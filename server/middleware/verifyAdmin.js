const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization || '';

    if (!authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing',
      });
    }

    const token = authorizationHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    req.user = decodedToken;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { verifyAdmin };
