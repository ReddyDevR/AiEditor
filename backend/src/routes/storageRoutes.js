const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/auth');
const r2 = require('../services/r2Storage');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 500) * 1024 * 1024 } });
router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try { if (!req.file) return res.status(400).json({ error: 'File is required' }); const safe = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'); const key = `users/${req.user.id}/uploads/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safe}`; const result = await r2.uploadBuffer({ key, buffer: req.file.buffer, contentType: req.file.mimetype }); res.status(201).json({ ...result, originalName: req.file.originalname, size: req.file.size, contentType: req.file.mimetype }); } catch(e) { next(e); }
});
router.get('/signed-url', requireAuth, async (req,res,next) => { try { const key=String(req.query.key||''); if (!key.startsWith(`users/${req.user.id}/`) && !['super_admin','admin'].includes(req.user.role)) return res.status(403).json({error:'Forbidden'}); res.json({url:await r2.signedReadUrl(key)}); } catch(e){next(e);} });
module.exports = router;
