const express = require('express');
const { body } = require('express-validator');
const { getCurrentUser, loginUser, registerUser } = require('../controllers/authController');
const { requireAuth } = require('../middleware/verifyAdmin');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/register',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['buyer', 'shop_owner'])
    .withMessage('Role must be buyer or shop_owner'),
  validateRequest,
  registerUser
);

router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['buyer', 'admin', 'shop_owner'])
    .withMessage('Role must be buyer, admin, or shop_owner'),
  validateRequest,
  loginUser
);

router.get('/me', requireAuth, getCurrentUser);

module.exports = router;
