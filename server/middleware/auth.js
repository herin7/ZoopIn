const { verifyAdmin } = require('./verifyAdmin');

module.exports = { protect: verifyAdmin, verifyAdmin };
