const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { 
  getUsers, 
  getProfile, 
  updateProfile, 
  updateProfilePic 
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.put('/profile/picture', protect, upload.single('profilePicture'), updateProfilePic);

module.exports = router;
