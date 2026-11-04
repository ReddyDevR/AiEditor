const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const { requireAuth } = require('../middleware/auth');
const cloudinary = require('../services/cloudinaryStorage');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 100) * 1024 * 1024 } });

router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    const isVideo = req.file.mimetype.startsWith('video/');
    const isImage = req.file.mimetype.startsWith('image/');
    if (!isVideo && !isImage) return res.status(400).json({ error: 'Only image and video files are supported.' });
    const safe = path.parse(req.file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    const result = await cloudinary.uploadBuffer(req.file.buffer, {
      folder: `reddy-ai-studio/users/${req.user.id}/${isVideo ? 'videos' : 'images'}`,
      publicId: `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safe}`,
      resourceType: isVideo ? 'video' : 'image'
    });
    res.status(201).json({ success: true, url: result.secure_url, secure_url: result.secure_url, publicId: result.public_id, public_id: result.public_id, resourceType: result.resource_type, originalName: req.file.originalname, size: req.file.size, contentType: req.file.mimetype, format: result.format, width: result.width, height: result.height });
  } catch (e) { next(e); }
});

router.delete('/:publicId(*)', requireAuth, async (req, res, next) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId || '');
    const userPrefix = `reddy-ai-studio/users/${req.user.id}/`;
    if (!publicId.startsWith(userPrefix) && !['super_admin', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    const resourceType = req.query.resourceType === 'video' ? 'video' : 'image';
    const result = await cloudinary.deleteAsset(publicId, resourceType);
    res.json({ success: true, result });
  } catch (e) { next(e); }
});
module.exports = router;
