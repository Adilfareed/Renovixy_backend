const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const fs = require('fs');

exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page,10) || 1;
  const limit = 20;
  const skip = (page-1)*limit;
  const total = await User.countDocuments();
  const users = await User.find().skip(skip).limit(limit).select('-password');
  res.json({ success: true, count: users.length, total, page, pages: Math.ceil(total/limit), data: users });
});

exports.updateProfilePic = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if(!user) return next(new ErrorResponse('User not found',404));
  if(!req.file) return next(new ErrorResponse('File required',400));
  if(user.profilePic && user.profilePic.public_id) await deleteImage(user.profilePic.public_id);
  const uploaded = await uploadImage(req.file.path, 'users');
  user.profilePic = { url: uploaded.url, public_id: uploaded.public_id };
  await user.save();
  try{ fs.unlinkSync(req.file.path); }catch(e){}
  res.json({ success: true, data: user });
});
