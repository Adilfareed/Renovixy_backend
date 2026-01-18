const asyncHandler = require('../middlewares/asyncHandler');
const Service = require('../models/Service');
const ErrorResponse = require('../utils/errorResponse');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const fs = require('fs');

exports.createService = asyncHandler(async (req, res, next) => {
  const payload = req.body;
  if(req.file){
    const uploaded = await uploadImage(req.file.path, 'services');
    payload.image = { url: uploaded.url, public_id: uploaded.public_id };
    try{ fs.unlinkSync(req.file.path);}catch(e){}
  }
  const service = await Service.create(payload);
  res.status(201).json({ success: true, data: service });
});

exports.getServices = asyncHandler(async (req, res, next) => {
  const services = await Service.find();
  res.json({ success: true, count: services.length, data: services });
});

exports.updateService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if(!service) return next(new ErrorResponse('Service not found',404));
  if(req.file){
    if(service.image && service.image.public_id) await deleteImage(service.image.public_id);
    const uploaded = await uploadImage(req.file.path, 'services');
    service.image = { url: uploaded.url, public_id: uploaded.public_id };
    try{ fs.unlinkSync(req.file.path);}catch(e){}
  }
  Object.assign(service, req.body);
  await service.save();
  res.json({ success: true, data: service });
});

exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if(!service) return next(new ErrorResponse('Service not found',404));
  if(service.image && service.image.public_id) await deleteImage(service.image.public_id);
  await service.remove();
  res.json({ success: true, message: 'Service removed' });
});
