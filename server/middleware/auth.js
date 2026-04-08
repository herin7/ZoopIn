const { optionalAuth, requireAuth, verifyAdmin, verifyRoles } = require('./verifyAdmin');

module.exports = {
  optionalAuth,
  protect: requireAuth,
  requireAuth,
  verifyAdmin,
  verifyRoles,
};
