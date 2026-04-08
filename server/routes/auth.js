const express = require('express');
const { body } = require('express-validator');
const { getCurrentUser, loginUser, registerUser, getAllUsers, updateUser, deleteUser } = require('../controllers/authController');
const { requireAuth, verifyAdmin } = require('../middleware/verifyAdmin');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/register',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['buyer', 'shop_owner', 'admin'])
    .withMessage('Role must be buyer, shop_owner or admin'),
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

// Admin routes for user management
router.get('/users', verifyAdmin, getAllUsers);
router.put('/users/:id', verifyAdmin, updateUser);
router.delete('/users/:id', verifyAdmin, deleteUser);

module.exports = router;
