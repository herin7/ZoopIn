const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: result.array().map(({ msg, path, value }) => ({
      field: path,
      message: msg,
      value,
    })),
  });
};

module.exports = { validateRequest };
