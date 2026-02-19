const asyncHandler = require('../middlewares/asyncHandler');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const fs = require('fs');

exports.getProjects = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  
  // Build filters
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.featured) filter.featured = req.query.featured === 'true';
  if (req.query.client) filter.client = { $regex: req.query.client, $options: 'i' };
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { location: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .populate('category', 'name icon')
    .populate('services', 'title')
    .sort({ featured: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  res.json({ 
    success: true, 
    data: projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

exports.createProject = asyncHandler(async (req, res, next) => {
  const payload = { ...req.body };
  const images = [];
  
  if(req.files && req.files.length){
    const uploads = await Promise.all(req.files.map(f => uploadImage(f.path, 'projects')));
    uploads.forEach(u => images.push({ url: u.url, public_id: u.public_id }));
    req.files.forEach(f => { try{ fs.unlinkSync(f.path);}catch(e){} });
  }
  payload.images = images;
  
  const project = await Project.create(payload);
  const populatedProject = await Project.findById(project._id)
    .populate('category', 'name icon')
    .populate('services', 'title');
  
  res.status(201).json({ success: true, data: populatedProject });
});

exports.updateProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if(!project) return next(new ErrorResponse('Project not found',404));
  
  // Handle multiple images
  if(req.files && req.files.length){
    // Delete old images
    if(project.images && project.images.length){
      await Promise.all(project.images.map(img => {
        if(img.public_id) return deleteImage(img.public_id);
      }));
    }
    
    const uploads = await Promise.all(req.files.map(f => uploadImage(f.path, 'projects')));
    const images = [];
    uploads.forEach(u => images.push({ url: u.url, public_id: u.public_id }));
    req.files.forEach(f => { try{ fs.unlinkSync(f.path);}catch(e){} });
    project.images = images;
  }
  
  // Update other fields
  const allowedFields = ['title', 'description', 'category', 'client', 'location', 'duration', 'completedDate', 'status', 'featured', 'services', 'budget'];
  allowedFields.forEach(field => {
    if(req.body[field] !== undefined) project[field] = req.body[field];
  });
  
  await project.save();
  const populatedProject = await Project.findById(project._id)
    .populate('category', 'name icon')
    .populate('services', 'title');
  
  res.json({ success: true, data: populatedProject });
});

exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if(!project) return next(new ErrorResponse('Project not found',404));
  
  // Delete associated images
  if(project.images && project.images.length){
    await Promise.all(project.images.map(img => {
      if(img.public_id) return deleteImage(img.public_id);
    }));
  }
  
  await project.deleteOne();
  res.json({ success: true, message: 'Project removed' });
});

exports.getProjectById = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('category', 'name icon')
    .populate('services', 'title description');
    
  if(!project) return next(new ErrorResponse('Project not found',404));
  
  res.json({ success: true, data: project });
});
