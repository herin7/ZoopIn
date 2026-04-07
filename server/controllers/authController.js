const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPasswordHash) {
      return res.status(500).json({
        success: false,
        message: 'Admin credentials are not configured',
      });
    }

    const isEmailValid = email === adminEmail;
    const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);

    if (!isEmailValid || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    const token = jwt.sign(
      {
        email: adminEmail,
        role: 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          email: adminEmail,
          role: 'admin',
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  loginAdmin,
};
