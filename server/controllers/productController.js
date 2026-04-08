const Product = require('../models/Product');
const LiveSession = require('../models/LiveSession');

const parseBoolean = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return value === 'true';
};

const parseNumber = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

const normalizeImages = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value);
      return Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : [value];
    } catch (error) {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const buildOwnerFilter = (user) => {
  if (!user || user.role === 'admin') {
    return {};
  }

  if (user.role === 'shop_owner') {
    return {
      ownerId: user.id,
    };
  }

  return {};
};

const findManagedProduct = (productId, user) =>
  Product.findOne({
    _id: productId,
    ...buildOwnerFilter(user),
  });

const createProduct = async (req, res, next) => {
  try {
    const images = req.uploadedImageUrls?.length
      ? req.uploadedImageUrls
      : normalizeImages(req.body.images);

    const product = new Product({
      name: req.body.name,
      description: req.body.description ?? '',
      price: parseNumber(req.body.price, 0),
      category: req.body.category ?? '',
      stock: parseNumber(req.body.stock, 0),
      isActive: parseBoolean(req.body.isActive) ?? true,
      images,
      ownerId: req.user.id,
      ownerEmail: req.user.email,
      ownerName: req.user.name,
    });

    const createdProduct = await product.save();

    return res.status(201).json({
      success: true,
      data: createdProduct,
    });
  } catch (error) {
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const filters = {
      ...buildOwnerFilter(req.user),
    };

    if (req.query.isActive !== undefined) {
      filters.isActive = parseBoolean(req.query.isActive);
    }

    const products = await Product.find(filters).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await findManagedProduct(req.params.id, req.user);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.name !== undefined) {
      product.name = req.body.name;
    }

    if (req.body.description !== undefined) {
      product.description = req.body.description;
    }

    if (req.body.price !== undefined) {
      product.price = parseNumber(req.body.price, product.price);
    }

    if (req.body.category !== undefined) {
      product.category = req.body.category;
    }

    if (req.body.stock !== undefined) {
      product.stock = parseNumber(req.body.stock, product.stock);
    }

    if (req.body.isActive !== undefined) {
      product.isActive = parseBoolean(req.body.isActive);
    }

    if (req.body.images !== undefined) {
      product.images = normalizeImages(req.body.images);
    }

    if (req.uploadedImageUrls?.length) {
      product.images = [...product.images, ...req.uploadedImageUrls];
    }

    product.ownerId = product.ownerId || req.user.id;
    product.ownerEmail = req.user.email;
    product.ownerName = req.user.name;

    const updatedProduct = await product.save();

    return res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await findManagedProduct(req.params.id, req.user);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    await LiveSession.updateMany(
      { currentProduct: product._id },
      { $set: { currentProduct: null } }
    );
    await LiveSession.updateMany({}, { $pull: { products: { productId: product._id } } });

    return res.json({
      success: true,
      data: {
        id: product._id,
        message: 'Product removed',
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
