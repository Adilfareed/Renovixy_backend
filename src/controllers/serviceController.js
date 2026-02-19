const asyncHandler = require('../middlewares/asyncHandler');
const Service = require('../models/Service');
const ErrorResponse = require('../utils/errorResponse');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const fs = require('fs');

exports.createService = asyncHandler(async (req, res, next) => {
  const payload = req.body;
  console.log(req.files)
  // Handle multiple images
  const images = [];
  if(req.files && req.files.length){
    const uploads = await Promise.all(req.files.map(f => uploadImage(f.path, 'services')));
    uploads.forEach(u => images.push({ url: u.url, public_id: u.public_id }));
    req.files.forEach(f => { try{ fs.unlinkSync(f.path);}catch(e){} });
  }
  payload.images = images;
  
  const service = await Service.create(payload);
  const populatedService = await Service.findById(service._id)
    .populate('category', 'name')
  
  res.status(201).json({ 
    success: true, 
    data: populatedService 
  });
});

exports.getServices = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  // Build filters
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured) filter.popular = req.query.featured === 'true';
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    filter['price.min'] = {};
    if (req.query.minPrice) filter['price.min'].$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter['price.max'] = {};
    if (req.query.maxPrice) filter['price.max'].$lte = parseFloat(req.query.maxPrice);
  }
  
  const total = await Service.countDocuments(filter);
  const services = await Service.find(filter)
    .populate('category', 'name icon')
    .sort({ popular: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  res.json({ 
    success: true, 
    data: services,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

exports.updateService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if(!service) return next(new ErrorResponse('Service not found',404));
  
  // Handle multiple images
  if(req.files && req.files.length){
    // Delete old images
    if(service.images && service.images.length){
      await Promise.all(service.images.map(img => {
        if(img.public_id) return deleteImage(img.public_id);
      }));
    }
    
    const uploads = await Promise.all(req.files.map(f => uploadImage(f.path, 'services')));
    const images = [];
    uploads.forEach(u => images.push({ url: u.url, public_id: u.public_id }));
    req.files.forEach(f => { try{ fs.unlinkSync(f.path);}catch(e){} });
    service.images = images;
  }
  
  // Update other fields
  const allowedFields = ['title', 'description', 'longDescription', 'icon', 'color', 'category', 'price', 'features', 'duration', 'popular'];
  allowedFields.forEach(field => {
    if(req.body[field] !== undefined) service[field] = req.body[field];
  });
  
  await service.save();
  const populatedService = await Service.findById(service._id)
    .populate('category', 'name icon')
    .populate('services', 'title');
  
  res.json({ success: true, data: populatedService });
});

exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if(!service) return next(new ErrorResponse('Service not found',404));
  
  // Delete associated images
  if(service.images && service.images.length){
    await Promise.all(service.images.map(img => {
      if(img.public_id) return deleteImage(img.public_id);
    }));
  }
  
  await service.deleteOne();
  res.json({ success: true, message: 'Service removed' });
});
