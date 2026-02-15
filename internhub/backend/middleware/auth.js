const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to req
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'internhub_secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Token is not valid' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ONLY company role — admin cannot post internships
const isCompanyOnly = (req, res, next) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ message: 'Access denied. Only companies can perform this action.' });
  }
  next();
};

// ONLY student role — admin/company cannot apply
const isStudentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Only students can apply for internships.' });
  }
  next();
};

// ONLY admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Company OR admin (for viewing applications, updating status etc.)
const isCompanyOrAdmin = (req, res, next) => {
  if (req.user.role !== 'company' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Company or admin role required.' });
  }
  next();
};

module.exports = { auth, isCompanyOnly, isStudentOnly, isAdmin, isCompanyOrAdmin };
