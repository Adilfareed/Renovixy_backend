const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { createService, getServices, updateService, deleteService } = require('../controllers/serviceController');
const { protect, authorize } = require('../middlewares/auth');

router.route('/').get(getServices).post(protect, authorize('admin'), upload.single('image'), createService);
router.route('/:id').put(protect, authorize('admin'), upload.single('image'), updateService).delete(protect, authorize('admin'), deleteService);

module.exports = router;
