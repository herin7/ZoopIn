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
      hostId: req.body.hostId,
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

const getSessionByRoomId = async (req, res, next) => {
  try {
    const session = await LiveSession.findOne({ roomId: req.params.roomId })
      .populate('products.productId')
      .populate('currentProduct');

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

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
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

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
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
  getSessionByRoomId,
  startSession,
  endSession,
};
