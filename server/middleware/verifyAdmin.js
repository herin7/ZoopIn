const jwt = require('jsonwebtoken');

const getTokenFromRequest = (req) => {
  const authorizationHeader = req.headers.authorization || '';

  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.split(' ')[1];
};

const requireAuth = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing',
      });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return next(error);
  }
};

const verifyRoles = (allowedRoles = []) => [
  requireAuth,
  (req, res, next) => {
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    return next();
  },
];

const verifyAdmin = verifyRoles(['admin']);

module.exports = {
  getTokenFromRequest,
  requireAuth,
  verifyRoles,
  verifyAdmin,
};
