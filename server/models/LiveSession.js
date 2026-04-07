const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    hostId: { type: String, trim: true },
    hostName: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    thumbnail: { type: String, trim: true, default: '' },
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
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('LiveSession', liveSessionSchema);
