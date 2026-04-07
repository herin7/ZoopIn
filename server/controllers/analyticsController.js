const Analytics = require('../models/Analytics');
const LiveSession = require('../models/LiveSession');
const Question = require('../models/Question');
const Reaction = require('../models/Reaction');

const getSessionAnalytics = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await LiveSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (req.user?.role === 'shop_owner' && session.hostId !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this session analytics',
      });
    }

    const analytics = await Analytics.find({ sessionId }).sort({ timestamp: 1 });
    const reactionAggregate = await Reaction.aggregate([
      { $match: { sessionId: session._id } },
      {
        $group: {
          _id: '$sessionId',
          totalReactions: { $sum: '$count' },
        },
      },
    ]);
    const totalQuestions = await Question.countDocuments({ sessionId });
    const peakViewers = analytics.reduce(
      (currentPeak, item) => Math.max(currentPeak, item.viewerCount),
      session.viewerCount || 0
    );
    const latestSnapshot = analytics[analytics.length - 1] || null;

    return res.json({
      success: true,
      data: {
        timeseries: analytics,
        summary: {
          totalReactions: reactionAggregate[0]?.totalReactions || 0,
          totalQuestions,
          viewerCount: session.viewerCount,
          status: session.status,
          peakViewers,
          latestEngagementRate: latestSnapshot?.engagementRate || 0,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSessionAnalytics,
};
