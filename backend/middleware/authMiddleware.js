const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found, token invalid' });
      }
      return next();
    } catch (error) {
      console.error('[Auth Middleware]', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

// Middleware to ensure user is a hospital
const hospitalOnly = (req, res, next) => {
  if (req.user && req.user.role === 'hospital') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a hospital' });
  }
};

module.exports = { protect, hospitalOnly };
