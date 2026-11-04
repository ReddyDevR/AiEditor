const cloudinary = require('cloudinary').v2;
const configured = () => Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
function ensureConfigured() {
  if (!configured()) throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
}
async function uploadFile(filePath, options = {}) {
  ensureConfigured();
  return cloudinary.uploader.upload(filePath, { folder: options.folder || 'reddy-ai-studio', resource_type: options.resourceType || 'auto', public_id: options.publicId, overwrite: false, use_filename: false, unique_filename: true });
}
async function uploadBuffer(buffer, options = {}) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: options.folder || 'reddy-ai-studio', resource_type: options.resourceType || 'auto', public_id: options.publicId, overwrite: false }, (error, result) => error ? reject(error) : resolve(result));
    stream.end(buffer);
  });
}
async function deleteAsset(publicId, resourceType = 'image') {
  ensureConfigured();
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}
module.exports = { cloudinary, configured, uploadFile, uploadBuffer, deleteAsset };
