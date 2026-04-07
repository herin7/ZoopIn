const express = require('express');
const { body } = require('express-validator');
const { loginAdmin } = require('../controllers/authController');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest,
  loginAdmin
);

module.exports = router;
