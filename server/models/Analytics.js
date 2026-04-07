const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveSession', required: true },
    viewerCount: { type: Number, default: 0, min: 0 },
    reactionCount: { type: Number, default: 0, min: 0 },
    questionCount: { type: Number, default: 0, min: 0 },
    engagementRate: { type: Number, default: 0, min: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    collection: 'analytics',
    timeseries: {
      timeField: 'timestamp',
      metaField: 'sessionId',
      granularity: 'seconds',
    },
  }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
