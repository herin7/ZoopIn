const jwt = require('jsonwebtoken');
const User = require('../models/User');

const buildUserPayload = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

const createToken = (user) =>
  jwt.sign(buildUserPayload(user), process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || (role && user.role !== role)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      data: {
        token,
        user: buildUserPayload(user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'buyer' } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: buildUserPayload(user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('_id name email role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCurrentUser,
  loginUser,
  registerUser,
};
