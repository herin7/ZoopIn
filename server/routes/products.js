const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const { validateRequest } = require('../middleware/validateRequest');
const { verifyRoles } = require('../middleware/verifyAdmin');

const router = express.Router();

const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      req.uploadedImageUrls = [];
      return next();
    }

    const uploadedFiles = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.path))
    );

    req.uploadedImageUrls = uploadedFiles.map((file) => file.secure_url);
    return next();
  } catch (error) {
    return next(error);
  }
};

const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer greater than or equal to 0'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const updateProductValidation = [
  param('id').isMongoId().withMessage('Invalid product id'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer greater than or equal to 0'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

router
  .route('/')
  .get(
    query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    validateRequest,
    getProducts
  )
  .post(
    ...verifyRoles(['admin', 'shop_owner']),
    upload.array('images', 5),
    createProductValidation,
    validateRequest,
    uploadProductImages,
    createProduct
  );

router
  .route('/:id')
  .put(
    ...verifyRoles(['admin', 'shop_owner']),
    upload.array('images', 5),
    updateProductValidation,
    validateRequest,
    uploadProductImages,
    updateProduct
  )
  .delete(
    ...verifyRoles(['admin', 'shop_owner']),
    param('id').isMongoId().withMessage('Invalid product id'),
    validateRequest,
    deleteProduct
  );

module.exports = router;
