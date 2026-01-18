const asyncHandler = require('../middlewares/asyncHandler');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const fs = require('fs');

exports.getProjects = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page,10) || 1;
  const limit = 20;
  const skip = (page-1)*limit;
  const total = await Project.countDocuments();
  const projects = await Project.find().skip(skip).limit(limit);
  res.json({ success: true, count: projects.length, total, page, pages: Math.ceil(total/limit), data: projects });
});

exports.createProject = asyncHandler(async (req, res, next) => {
  const payload = { ...req.body };
  const images = [];
  if(req.files && req.files.length){
    const uploads = await Promise.all(req.files.map(f=> uploadImage(f.path, 'projects')));
    uploads.forEach(u=> images.push({ url: u.url, public_id: u.public_id }));
    req.files.forEach(f=>{ try{ fs.unlinkSync(f.path);}catch(e){} });
  }
  payload.images = images;
  const project = await Project.create(payload);
  res.status(201).json({ success: true, data: project });
});
