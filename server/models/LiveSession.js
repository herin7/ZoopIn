const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    hostId: { type: String, trim: true },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'scheduled',
    },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        order: { type: Number, default: 0 },
      },
    ],
    currentProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    viewerCount: { type: Number, default: 0, min: 0 },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    roomId: { type: String, unique: true, required: true, trim: true },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('LiveSession', liveSessionSchema);
