const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new ErrorResponse('Not authorized to access this route', 401));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if(!req.user) return next(new ErrorResponse('User not found', 401));
    next();
  } catch (err) {
    return next(new ErrorResponse('Token invalid', 401));
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ErrorResponse('Not authorized', 401));
  if (!roles.includes(req.user.role)) return next(new ErrorResponse(`User role ${req.user.role} not authorized`, 403));
  next(); 
};
