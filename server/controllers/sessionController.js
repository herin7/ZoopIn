const crypto = require('crypto');
const LiveSession = require('../models/LiveSession');
const Product = require('../models/Product');

const parseProducts = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return [];
};

const normalizeOptionalString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const ensureSessionAccess = (session, user) => {
  if (!session) {
    return {
      allowed: false,
      statusCode: 404,
      message: 'Session not found',
    };
  }

  if (user?.role === 'admin') {
    return { allowed: true };
  }

  if (user?.role === 'shop_owner' && session.hostId === user.email) {
    return { allowed: true };
  }

  return {
    allowed: false,
    statusCode: 403,
    message: 'You do not have access to this session',
  };
};

const populateSessionQuery = (query) =>
  query.populate('products.productId').populate('currentProduct');

const createSession = async (req, res, next) => {
  try {
    const products = parseProducts(req.body.products);
    const productIds = products.map((item) => item.productId).filter(Boolean);

    if (productIds.length > 0) {
      const existingProducts = await Product.countDocuments({
        _id: { $in: productIds },
      });

      if (existingProducts !== productIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more products do not exist',
        });
      }
    }

    const session = new LiveSession({
      title: req.body.title,
      hostId: req.user?.email || req.body.hostId,
      hostName: req.user?.name || req.body.hostName || '',
      description: normalizeOptionalString(req.body.description),
      thumbnail: normalizeOptionalString(req.body.thumbnail),
      roomId: `session_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
      products,
      currentProduct: products?.[0]?.productId ?? null,
    });

    const createdSession = await session.save();

    return res.status(201).json({
      success: true,
      data: createdSession,
    });
  } catch (error) {
    return next(error);
  }
};

const getManagedSessions = async (req, res, next) => {
  try {
    const filters = {};

    if (req.user?.role === 'shop_owner') {
      filters.hostId = req.user.email;
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    const sessions = await populateSessionQuery(
      LiveSession.find(filters).sort({ createdAt: -1, startedAt: -1 })
    );

    return res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    return next(error);
  }
};

const getLiveSessions = async (req, res, next) => {
  try {
    const requestedLimit = req.query.limit ? Number(req.query.limit) : null;
    let liveSessionsQuery = populateSessionQuery(
      LiveSession.find({ status: 'live' }).sort({ startedAt: -1 })
    );

    if (requestedLimit) {
      liveSessionsQuery = liveSessionsQuery.limit(Math.min(requestedLimit, 50));
    }

    const sessions = await liveSessionsQuery;

    return res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    return next(error);
  }
};

const getSessionByRoomId = async (req, res, next) => {
  try {
    const session = await populateSessionQuery(
      LiveSession.findOne({ roomId: req.params.roomId })
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    return res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    return next(error);
  }
};

const startSession = async (req, res, next) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    const access = ensureSessionAccess(session, req.user);

    if (!access.allowed) {
      return res.status(access.statusCode).json({
        success: false,
        message: access.message,
      });
    }

    session.status = 'live';
    session.startedAt = new Date();
    session.endedAt = null;

    if (!session.currentProduct && session.products.length > 0) {
      session.currentProduct = session.products[0].productId;
    }

    const updatedSession = await session.save();

    return res.json({
      success: true,
      data: updatedSession,
    });
  } catch (error) {
    return next(error);
  }
};

const endSession = async (req, res, next) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    const access = ensureSessionAccess(session, req.user);

    if (!access.allowed) {
      return res.status(access.statusCode).json({
        success: false,
        message: access.message,
      });
    }

    session.status = 'ended';
    session.endedAt = new Date();

    const updatedSession = await session.save();

    return res.json({
      success: true,
      data: updatedSession,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createSession,
  getManagedSessions,
  getLiveSessions,
  getSessionByRoomId,
  startSession,
  endSession,
};
