const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveSession', required: true },
    type: { type: String, enum: ['like', 'fire', 'heart', 'wow'], required: true },
    count: { type: Number, default: 1, min: 1 },
    timestamp: { type: Date, default: Date.now },
    userId: { type: String, trim: true },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Reaction', reactionSchema);
