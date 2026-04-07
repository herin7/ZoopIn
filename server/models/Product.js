const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
    category: { type: String, default: '', trim: true },
    stock: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Product', productSchema);
