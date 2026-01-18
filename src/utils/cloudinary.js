const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
  secure: true,
});

const uploadImage = async (filePath, folder = 'construction_app') => {
  const opts = { folder };
  const result = await cloudinary.uploader.upload(filePath, opts);
  return { url: result.secure_url, public_id: result.public_id };
};

const deleteImage = async (publicId) => {
  if(!publicId) return null;
  return await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, deleteImage };
