const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

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

const uploadImageFromBuffer = async (buffer, folder = 'construction_app') => {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(buffer);
    const opts = { folder };
    
    const uploadStream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    });
    
    stream.pipe(uploadStream);
  });
};

const deleteImage = async (publicId) => {
  if(!publicId) return null;
  return await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, uploadImageFromBuffer, deleteImage };
