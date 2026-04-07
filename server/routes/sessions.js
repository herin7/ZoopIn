const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createSession,
  getManagedSessions,
  getLiveSessions,
  getSessionByRoomId,
  startSession,
  endSession,
} = require('../controllers/sessionController');
const { validateRequest } = require('../middleware/validateRequest');
const { verifyRoles } = require('../middleware/verifyAdmin');

const router = express.Router();

router.route('/').get(
  ...verifyRoles(['admin', 'shop_owner']),
  query('status').optional().isIn(['scheduled', 'live', 'ended']).withMessage('Invalid status'),
  validateRequest,
  getManagedSessions
).post(
  ...verifyRoles(['admin', 'shop_owner']),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description')
    .optional()
    .isLength({ max: 280 })
    .withMessage('Description must be 280 characters or fewer'),
  body('thumbnail')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
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

router.route('/live').get(
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  validateRequest,
  getLiveSessions
);

router.route('/:roomId').get(getSessionByRoomId);

router.route('/:id/start').patch(
  ...verifyRoles(['admin', 'shop_owner']),
  param('id').isMongoId().withMessage('Invalid session id'),
  validateRequest,
  startSession
);

router.route('/:id/end').patch(
  ...verifyRoles(['admin', 'shop_owner']),
  param('id').isMongoId().withMessage('Invalid session id'),
  validateRequest,
  endSession
);

module.exports = router;
