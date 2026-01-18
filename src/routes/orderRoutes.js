const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getOrders, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', protect, authorize('admin'), getOrders);
router.post('/', protect, upload.array('relatedPics', 10), createOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
