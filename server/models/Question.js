const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveSession', required: true },
    viewerId: { type: String, required: true, trim: true },
    viewerName: { type: String, default: 'Guest', trim: true },
    text: { type: String, required: true, maxlength: 300, trim: true },
    isAnswered: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Question', questionSchema);
