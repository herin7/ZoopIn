const express = require('express');
const { body, param } = require('express-validator');
const {
  createSession,
  getSessionByRoomId,
  startSession,
  endSession,
} = require('../controllers/sessionController');
const { validateRequest } = require('../middleware/validateRequest');
const { verifyAdmin } = require('../middleware/verifyAdmin');

const router = express.Router();

router.route('/').post(
  verifyAdmin,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('hostId').optional().isString().withMessage('hostId must be a string'),
  body('products').optional().custom((value) => {
    if (typeof value === 'string') {
      JSON.parse(value);
      return true;
    }

    if (Array.isArray(value)) {
      return true;
    }

    throw new Error('Products must be an array or a JSON string');
  }),
  validateRequest,
  createSession
);

router.route('/:roomId').get(verifyAdmin, getSessionByRoomId);

router.route('/:id/start').patch(
  verifyAdmin,
  param('id').isMongoId().withMessage('Invalid session id'),
  validateRequest,
  startSession
);

router.route('/:id/end').patch(
  verifyAdmin,
  param('id').isMongoId().withMessage('Invalid session id'),
  validateRequest,
  endSession
);

module.exports = router;
