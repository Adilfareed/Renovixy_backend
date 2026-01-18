const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getUsers, updateProfilePic } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id/profilePic', protect, upload.single('profilePic'), updateProfilePic);

module.exports = router;
