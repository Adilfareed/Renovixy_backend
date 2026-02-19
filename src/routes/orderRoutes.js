const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { 
  getOrders, 
  createOrder, 
  updateOrderStatus, 
  getOrderById, 
  deleteOrder 
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .get(protect, getOrders)
  .post(protect, upload.array('relatedPics', 10), createOrder);

router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, authorize('admin'), deleteOrder);

router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
