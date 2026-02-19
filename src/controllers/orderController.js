const asyncHandler = require('../middlewares/asyncHandler');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const fs = require('fs');

/* ================= GET ORDERS ================= */
exports.getOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let filter = {};

  // 🔐 Agar user admin nahi hai → sirf apne orders
  if (req.user.role !== 'admin') {
    filter.customerRef = req.user._id;
  }

  // Additional filters
  if (req.query.status) filter.status = req.query.status;
  if (req.query.serviceType) {
    // Handle single service or multiple services
    if (req.query.serviceType.includes(',')) {
      filter.serviceType = { $in: req.query.serviceType.split(',') };
    } else {
      filter.serviceType = req.query.serviceType;
    }
  }
  if (req.query.search) {
    filter.$or = [
      { customerName: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const total = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('customerRef', 'username email')
    .populate('serviceType', 'title description')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/* ================= CREATE ORDER ================= */
exports.createOrder = asyncHandler(async (req, res, next) => {
  const payload = { ...req.body, customerRef: req.user._id };
  const relatedPics = [];
  const { latitude, longitude, serviceType } = req.body;

  // Handle multiple services
  if (serviceType) {
    if (typeof serviceType === 'string') {
      // If comma-separated string, split into array
      payload.serviceType = serviceType.split(',').map(id => id.trim());
    } else if (Array.isArray(serviceType)) {
      payload.serviceType = serviceType;
    }
  }

  if (latitude && longitude) {
    payload.coordinates = { latitude, longitude };
  }

  if (req.files && req.files.length) {
    const uploads = await Promise.all(
      req.files.map((f) => uploadImage(f.path, 'orders'))
    );

    uploads.forEach((u) =>
      relatedPics.push({ url: u.url, public_id: u.public_id })
    );

    req.files.forEach((f) => {
      try {
        fs.unlinkSync(f.path);
      } catch (e) {}
    });
  }

  payload.relatedPics = relatedPics;

  const order = await Order.create(payload);
  const populatedOrder = await Order.findById(order._id)
    .populate('customerRef', 'username email')
    .populate('serviceType', 'title description');

  res.status(201).json({
    success: true,
    data: populatedOrder,
  });
});

/* ================= UPDATE ORDER ================= */
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, estimatedCost, adminNotes } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // 🔐 Optional: sirf admin update kare
  // if (req.user.role !== 'admin') {
  //   return next(new ErrorResponse('Not authorized', 403));
  // }

  if (status) order.status = status;
  if (estimatedCost !== undefined) order.estimatedCost = estimatedCost;
  if (adminNotes !== undefined) order.adminNotes = adminNotes;

  await order.save();
  const populatedOrder = await Order.findById(order._id)
    .populate('customerRef', 'username email')
    .populate('serviceType', 'title description');

  res.json({
    success: true,
    data: populatedOrder,
  });
});

/* ================= GET ORDER BY ID ================= */
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customerRef', 'username email')
    .populate('serviceType', 'title description');
    
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // 🔐 Check if user owns the order or is admin
  if (req.user.role !== 'admin' && order.customerRef._id.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to access this order', 403));
  }

  res.json({
    success: true,
    data: order,
  });
});

/* ================= DELETE ORDER ================= */
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // 🔐 Only admin can delete orders
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete orders', 403));
  }

  // Delete associated images
  if (order.relatedPics && order.relatedPics.length) {
    await Promise.all(order.relatedPics.map(pic => {
      if (pic.public_id) return deleteImage(pic.public_id);
    }));
  }

  await order.deleteOne();
  res.json({
    success: true,
    message: 'Order deleted successfully'
  });
});
