const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs');


// ======================= REGISTER =======================
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, phoneNumber, address, role } = req.body;

  // Check duplicate user
  const existing_user = await User.findOne({
    email 
  });

  if (existing_user) {
    return next(new ErrorResponse("Username or email already exists", 400));
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    phoneNumber,
    address,
    role
  });

  // Upload image if exists
  if (req.file) {
    const uploaded = await uploadImage(req.file.path, 'users');
    user.profilePic = {
      url: uploaded.url,
      public_id: uploaded.public_id
    };
    await user.save();

    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {}
  }

  // Send token
  res.status(201).json({
    success: true,
    token: user.getSignedJwtToken()
  });
});


// ======================= LOGIN =======================
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  // Find user with password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check matching password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Remove password from response
  user.password = undefined;

  // Send response
  res.json({
    success: true,
    token: user.getSignedJwtToken(),
    user
  });
});
