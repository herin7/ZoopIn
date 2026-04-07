const { requireAuth, verifyAdmin, verifyRoles } = require('./verifyAdmin');

module.exports = {
  protect: requireAuth,
  requireAuth,
  verifyAdmin,
  verifyRoles,
};
