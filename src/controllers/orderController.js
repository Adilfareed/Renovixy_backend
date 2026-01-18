const asyncHandler = require('../middlewares/asyncHandler');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs');

/* ================= GET ORDERS ================= */
exports.getOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  let filter = {};

  // 🔐 Agar user admin nahi hai → sirf apne orders
  if (req.user.role !== 'admin') {
    filter.customerRef = req.user._id;
  }

  const total = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('customerRef', 'username email');

  res.json({
    success: true,
    count: orders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: orders,
  });
});

/* ================= CREATE ORDER ================= */
exports.createOrder = asyncHandler(async (req, res, next) => {
  const payload = { ...req.body, customerRef: req.user._id };
  const relatedPics = [];

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

  res.status(201).json({
    success: true,
    data: order,
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

  res.json({
    success: true,
    data: order,
  });
});
