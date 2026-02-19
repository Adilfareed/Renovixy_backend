const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { register, login, checkUsername, checkEmail, deleteAccount, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.get('/check-username', checkUsername);
router.get('/check-email', checkEmail);
router.post('/register', upload.single('profilePic'), register);
router.post('/login', login);
router.delete('/delete', deleteAccount);
router.get('/me', protect, getMe);

module.exports = router;
