const crypto = require('crypto');
const LiveSession = require('../models/LiveSession');
const Reaction = require('../models/Reaction');
const Question = require('../models/Question');
const Analytics = require('../models/Analytics');

const REACTION_TYPES = ['like', 'fire', 'heart', 'wow'];
const activeSessions = new Map();

const getAdminRoom = (roomId) => `admin_${roomId}`;

const createDefaultReactionCounts = () => ({
  like: 0,
  fire: 0,
  heart: 0,
  wow: 0,
});

const emitSocketError = (socket, message) => {
  socket.emit('error', {
    success: false,
    message,
  });
};

const sumReactionCounts = (reactionCounts) =>
  Object.values(reactionCounts).reduce((total, count) => total + count, 0);

const getOrCreateRoomState = (roomId) => {
  if (!activeSessions.has(roomId)) {
    activeSessions.set(roomId, {
      roomId,
      sessionId: null,
      hostSocketId: null,
      viewerSockets: new Set(),
      viewerSocketMap: new Map(),
      socketToViewerId: new Map(),
      reactionCounts: createDefaultReactionCounts(),
      reactionBuffer: [],
      questionCount: 0,
    });
  }

  return activeSessions.get(roomId);
};

const removeViewerFromRoomState = (roomState, socketId) => {
  const viewerId = roomState.socketToViewerId.get(socketId);

  if (!viewerId) {
    return null;
  }

  roomState.socketToViewerId.delete(socketId);
  roomState.viewerSocketMap.delete(viewerId);
  roomState.viewerSockets.delete(viewerId);

  return viewerId;
};

const hydrateRoomState = async (roomState, roomId) => {
  const session = await LiveSession.findOne({ roomId })
    .populate('products.productId')
    .populate('currentProduct');

  if (!session) {
    return null;
  }

  roomState.sessionId = session._id.toString();

  const reactionAggregate = await Reaction.aggregate([
    { $match: { sessionId: session._id } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$count' },
      },
    },
  ]);

  roomState.reactionCounts = createDefaultReactionCounts();
  reactionAggregate.forEach(({ _id, total }) => {
    if (REACTION_TYPES.includes(_id)) {
      roomState.reactionCounts[_id] = total;
    }
  });

  roomState.questionCount = await Question.countDocuments({ sessionId: session._id });

  return session;
};

const setViewerCount = async (roomState) => {
  if (!roomState.sessionId) {
    return null;
  }

  return LiveSession.findByIdAndUpdate(
    roomState.sessionId,
    { viewerCount: roomState.viewerSockets.size },
    { new: true }
  );
};

const emitCurrentSessionState = async (io, socket, roomState, session) => {
  const hydratedSession = session || (await LiveSession.findById(roomState.sessionId)
    .populate('products.productId')
    .populate('currentProduct'));
  const questions = await Question.find({ sessionId: roomState.sessionId })
    .sort({ timestamp: -1 })
    .limit(50);

  socket.emit('session:state', {
    success: true,
    data: {
      session: hydratedSession,
      reactionCounts: roomState.reactionCounts,
      questionCount: roomState.questionCount,
      questions,
      viewerCount: roomState.viewerSockets.size,
    },
  });

  io.to(getAdminRoom(roomState.roomId)).emit('analytics:update', {
    sessionId: roomState.sessionId,
    viewerCount: roomState.viewerSockets.size,
    reactionCount: sumReactionCounts(roomState.reactionCounts),
    questionCount: roomState.questionCount,
    engagementRate:
      roomState.viewerSockets.size > 0
        ? (sumReactionCounts(roomState.reactionCounts) + roomState.questionCount) /
        roomState.viewerSockets.size
        : 0,
    timestamp: new Date(),
  });
};

const flushReactionBuffers = async () => {
  const flushPromises = Array.from(activeSessions.values()).map(async (roomState) => {
    if (!roomState.sessionId || roomState.reactionBuffer.length === 0) {
      return;
    }

    const buffer = [...roomState.reactionBuffer];
    roomState.reactionBuffer = [];

    await Reaction.insertMany(buffer, { ordered: false });
  });

  await Promise.allSettled(flushPromises);
};

const snapshotAnalytics = async (io) => {
  const snapshotPromises = Array.from(activeSessions.values()).map(async (roomState) => {
    if (!roomState.sessionId) {
      return;
    }

    const viewerCount = roomState.viewerSockets.size;
    const reactionCount = sumReactionCounts(roomState.reactionCounts);
    const questionCount = roomState.questionCount;
    const engagementRate =
      viewerCount > 0 ? (reactionCount + questionCount) / viewerCount : 0;

    const snapshot = await Analytics.create({
      sessionId: roomState.sessionId,
      viewerCount,
      reactionCount,
      questionCount,
      engagementRate,
      timestamp: new Date(),
    });

    io.to(getAdminRoom(roomState.roomId)).emit('analytics:update', {
      sessionId: roomState.sessionId,
      viewerCount,
      reactionCount,
      questionCount,
      engagementRate,
      timestamp: snapshot.timestamp,
    });
  });

  await Promise.allSettled(snapshotPromises);
};

module.exports = (io) => {
  const reactionFlushInterval = setInterval(() => {
    flushReactionBuffers().catch((error) => {
      console.error('Failed to flush reactions:', error);
    });
  }, 5000);

  const analyticsInterval = setInterval(() => {
    snapshotAnalytics(io).catch((error) => {
      console.error('Failed to snapshot analytics:', error);
    });
  }, 30000);

  io.on('connection', (socket) => {
    socket.on('host:join', async ({ roomId, sessionId } = {}) => {
      try {
        if (!roomId) {
          return emitSocketError(socket, 'roomId is required');
        }

        const roomState = getOrCreateRoomState(roomId);
        const session = await hydrateRoomState(roomState, roomId);

        if (!session) {
          return emitSocketError(socket, 'Session not found');
        }

        roomState.sessionId = sessionId || session._id.toString();
        roomState.hostSocketId = socket.id;
        socket.data.role = 'host';
        socket.data.roomId = roomId;
        socket.join(roomId);
        socket.join(getAdminRoom(roomId));

        socket.emit('host:joined', {
          success: true,
          roomId,
          sessionId: roomState.sessionId,
          viewerCount: roomState.viewerSockets.size,
          viewerIds: Array.from(roomState.viewerSockets),
        });

        await emitCurrentSessionState(io, socket, roomState, session);
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to join as host');
      }
    });

    socket.on('viewer:join', async ({ roomId } = {}) => {
      try {
        if (!roomId) {
          return emitSocketError(socket, 'roomId is required');
        }

        const roomState = getOrCreateRoomState(roomId);
        const session = await hydrateRoomState(roomState, roomId);

        if (!session) {
          return emitSocketError(socket, 'Session not found');
        }

        const viewerId = crypto.randomUUID();
        socket.data.role = 'viewer';
        socket.data.roomId = roomId;
        socket.data.viewerId = viewerId;

        roomState.viewerSockets.add(viewerId);
        roomState.viewerSocketMap.set(viewerId, socket.id);
        roomState.socketToViewerId.set(socket.id, viewerId);

        socket.join(roomId);
        await setViewerCount(roomState);

        socket.emit('viewer:joined', {
          success: true,
          viewerId,
          roomId,
          sessionId: roomState.sessionId,
        });

        if (roomState.hostSocketId) {
          io.to(roomState.hostSocketId).emit('viewer:join', {
            viewerId,
            roomId,
            viewerCount: roomState.viewerSockets.size,
          });
        }

        io.to(roomId).emit('viewer:count', {
          roomId,
          viewerCount: roomState.viewerSockets.size,
        });

        await emitCurrentSessionState(io, socket, roomState, session);
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to join as viewer');
      }
    });

    socket.on('offer', ({ roomId, to, sdp } = {}) => {
      try {
        const roomState = activeSessions.get(roomId);

        if (!roomState || !to || !sdp) {
          return emitSocketError(socket, 'Invalid offer payload');
        }

        const viewerSocketId = roomState.viewerSocketMap.get(to);

        if (!viewerSocketId) {
          return emitSocketError(socket, 'Viewer not found');
        }

        io.to(viewerSocketId).emit('offer', {
          roomId,
          viewerId: to,
          sdp,
        });
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to relay offer');
      }
    });

    socket.on('answer', ({ roomId, viewerId, sdp } = {}) => {
      try {
        const roomState = activeSessions.get(roomId);

        if (!roomState?.hostSocketId || !viewerId || !sdp) {
          return emitSocketError(socket, 'Invalid answer payload');
        }

        io.to(roomState.hostSocketId).emit('answer', {
          roomId,
          viewerId,
          sdp,
        });
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to relay answer');
      }
    });

    socket.on('ice-candidate', ({ roomId, to, candidate } = {}) => {
      try {
        const roomState = activeSessions.get(roomId);

        if (!roomState || !candidate) {
          return emitSocketError(socket, 'Invalid ICE candidate payload');
        }

        if (socket.data.role === 'host') {
          const viewerSocketId = roomState.viewerSocketMap.get(to);

          if (!viewerSocketId) {
            return emitSocketError(socket, 'Viewer not found');
          }

          return io.to(viewerSocketId).emit('ice-candidate', {
            roomId,
            viewerId: to,
            candidate,
          });
        }

        if (!roomState.hostSocketId) {
          return emitSocketError(socket, 'Host not connected');
        }

        return io.to(roomState.hostSocketId).emit('ice-candidate', {
          roomId,
          viewerId: socket.data.viewerId,
          candidate,
        });
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to relay ICE candidate');
      }
    });

    socket.on('reaction:send', async ({ roomId, sessionId, type, userId } = {}) => {
      try {
        const roomState = activeSessions.get(roomId);

        if (!roomState || !REACTION_TYPES.includes(type)) {
          return emitSocketError(socket, 'Invalid reaction payload');
        }

        const activeSessionId = sessionId || roomState.sessionId;

        if (!activeSessionId) {
          return emitSocketError(socket, 'sessionId is required');
        }

        roomState.sessionId = activeSessionId;
        roomState.reactionCounts[type] += 1;
        roomState.reactionBuffer.push({
          sessionId: activeSessionId,
          type,
          count: 1,
          userId: userId || socket.data.viewerId || crypto.randomUUID(),
          timestamp: new Date(),
        });

        io.to(roomId).emit('reaction:update', {
          sessionId: activeSessionId,
          counts: roomState.reactionCounts,
          latestReactionType: type,
        });
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to send reaction');
      }
    });

    socket.on('question:submit', async ({ roomId, sessionId, text, viewerName } = {}) => {
      try {
        const roomState = activeSessions.get(roomId);

        if (!roomState || !sessionId || !text?.trim()) {
          return emitSocketError(socket, 'Invalid question payload');
        }

        const question = await Question.create({
          sessionId,
          viewerId: socket.data.viewerId || crypto.randomUUID(),
          viewerName: viewerName?.trim() || 'Guest',
          text: text.trim(),
        });

        roomState.questionCount += 1;

        io.to(getAdminRoom(roomId)).emit('question:new', question);
        io.to(roomId).emit('question:new', question);
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to submit question');
      }
    });

    socket.on('question:answer', async ({ roomId, questionId } = {}) => {
      try {
        if (!roomId || !questionId) {
          return emitSocketError(socket, 'roomId and questionId are required');
        }

        const question = await Question.findByIdAndUpdate(
          questionId,
          { isAnswered: true },
          { new: true }
        );

        if (!question) {
          return emitSocketError(socket, 'Question not found');
        }

        io.to(roomId).emit('question:answered', question);
        io.to(getAdminRoom(roomId)).emit('question:answered', question);
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to answer question');
      }
    });

    socket.on('product:switch', async ({ roomId, sessionId, productId } = {}) => {
      try {
        if (!roomId || !sessionId) {
          return emitSocketError(socket, 'roomId and sessionId are required');
        }

        const session = await LiveSession.findById(sessionId);

        if (!session) {
          return emitSocketError(socket, 'Session not found');
        }

        session.currentProduct = productId || null;
        await session.save();
        await session.populate('currentProduct');

        io.to(roomId).emit('product:changed', {
          sessionId,
          productId: productId || null,
          currentProduct: session.currentProduct || null,
        });
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to switch product');
      }
    });

    socket.on('host:leave', async ({ roomId, sessionId } = {}) => {
      try {
        const roomState = activeSessions.get(roomId);

        if (!roomState) {
          return;
        }

        await flushReactionBuffers();

        const activeSessionId = sessionId || roomState.sessionId;
        if (activeSessionId) {
          await LiveSession.findByIdAndUpdate(activeSessionId, {
            status: 'ended',
            endedAt: new Date(),
          });
        }

        io.to(roomId).emit('host:leave', {
          success: true,
          roomId,
          sessionId: activeSessionId,
          message: 'Host ended the session',
        });

        activeSessions.delete(roomId);
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to leave host session');
      }
    });

    socket.on('viewer:leave', async ({ roomId } = {}) => {
      try {
        const roomState = activeSessions.get(roomId);

        if (!roomState) {
          return;
        }

        const viewerId = removeViewerFromRoomState(roomState, socket.id);
        await setViewerCount(roomState);

        if (roomState.hostSocketId && viewerId) {
          io.to(roomState.hostSocketId).emit('viewer:leave', {
            viewerId,
            roomId,
            viewerCount: roomState.viewerSockets.size,
          });
        }

        io.to(roomId).emit('viewer:count', {
          roomId,
          viewerCount: roomState.viewerSockets.size,
        });
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to leave viewer session');
      }
    });

    socket.on('disconnect', async () => {
      try {
        const { role, roomId } = socket.data;

        if (!role || !roomId) {
          return;
        }

        const roomState = activeSessions.get(roomId);

        if (!roomState) {
          return;
        }

        if (role === 'host' && roomState.hostSocketId === socket.id) {
          await flushReactionBuffers();

          if (roomState.sessionId) {
            await LiveSession.findByIdAndUpdate(roomState.sessionId, {
              status: 'ended',
              endedAt: new Date(),
            });
          }

          io.to(roomId).emit('host:leave', {
            success: true,
            roomId,
            sessionId: roomState.sessionId,
            message: 'Host disconnected',
          });

          activeSessions.delete(roomId);
          return;
        }

        if (role === 'viewer') {
          const viewerId = removeViewerFromRoomState(roomState, socket.id);
          await setViewerCount(roomState);

          if (roomState.hostSocketId && viewerId) {
            io.to(roomState.hostSocketId).emit('viewer:leave', {
              viewerId,
              roomId,
              viewerCount: roomState.viewerSockets.size,
            });
          }

          io.to(roomId).emit('viewer:count', {
            roomId,
            viewerCount: roomState.viewerSockets.size,
          });
        }
      } catch (error) {
        console.error('Socket disconnect cleanup failed:', error);
      }
    });
  });

};
