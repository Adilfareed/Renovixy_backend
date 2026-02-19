const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { uploadImageFromBuffer, deleteImage } = require('../utils/cloudinary');


// ======================= USERNAME CHECK =======================
exports.checkUsername = asyncHandler(async (req, res, next) => {
  const { username } = req.query;

  // Validate input
  if (!username) {
    return next(new ErrorResponse('Please provide username', 400));
  }

  // Check if username exists
  const existingUser = await User.findOne({ username });

  res.json({
    success: true,
    available: !existingUser,
    message: existingUser ? 'Username is already taken' : 'Username is available'
  });
});


// ======================= EMAIL CHECK =======================
exports.checkEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.query;

  // Validate input
  if (!email) {
    return next(new ErrorResponse('Please provide email', 400));
  }

  // Check if email exists
  const existingUser = await User.findOne({ email });

  res.json({
    success: true,
    available: !existingUser,
    message: existingUser ? 'Email is already registered' : 'Email is available'
  });
});


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
    const uploaded = await uploadImageFromBuffer(req.file.buffer, 'users');
    user.profilePic = {
      url: uploaded.url,
      public_id: uploaded.public_id
    };
    await user.save();
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


// ======================= DELETE ACCOUNT =======================
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Delete profile picture from Cloudinary if exists
  if (user.profilePic && user.profilePic.public_id) {
    try {
      await deleteImage(user.profilePic.public_id);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      // Continue with account deletion even if image deletion fails
    }
  }

  // Delete user account
  await User.findByIdAndDelete(req.user.id);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});


// ======================= GET CURRENT USER =======================
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.json({
    success: true,
    data: user
  });
});
