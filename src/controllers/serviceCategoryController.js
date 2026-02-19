const asyncHandler = require('../middlewares/asyncHandler');
const ServiceCategory = require('../models/ServiceCategory');
const ErrorResponse = require('../utils/errorResponse');

// ======================= CREATE CATEGORY =======================
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, icon, description } = req.body;

  // Check if category already exists
  const existingCategory = await ServiceCategory.findOne({ name });
  if (existingCategory) {
    return next(new ErrorResponse('Category already exists', 400));
  }

  const category = await ServiceCategory.create({
    name,
    icon,
    description
  });

  res.status(201).json({
    success: true,
    data: category
  });
});

// ======================= GET ALL CATEGORIES =======================
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await ServiceCategory.find({ isActive: true });

  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// ======================= GET CATEGORY BY ID =======================
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await ServiceCategory.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  res.json({
    success: true,
    data: category
  });
});

// ======================= UPDATE CATEGORY =======================
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { name, icon, description, isActive } = req.body;

  let category = await ServiceCategory.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Check if name is being updated and if it already exists
  if (name && name !== category.name) {
    const existingCategory = await ServiceCategory.findOne({ name });
    if (existingCategory) {
      return next(new ErrorResponse('Category name already exists', 400));
    }
  }

  category = await ServiceCategory.findByIdAndUpdate(
    req.params.id,
    { name, icon, description, isActive },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: category
  });
});

// ======================= DELETE CATEGORY =======================
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await ServiceCategory.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Soft delete - set isActive to false
  category.isActive = false;
  await category.save();

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});
