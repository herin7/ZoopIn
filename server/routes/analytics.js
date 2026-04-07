const express = require('express');
const { param } = require('express-validator');
const { getSessionAnalytics } = require('../controllers/analyticsController');
const { validateRequest } = require('../middleware/validateRequest');
const { verifyAdmin } = require('../middleware/verifyAdmin');

const router = express.Router();

router.route('/:sessionId').get(
  verifyAdmin,
  param('sessionId').isMongoId().withMessage('Invalid session id'),
  validateRequest,
  getSessionAnalytics
);

module.exports = router;
