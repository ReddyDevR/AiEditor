/**
 * REDDY AI STUDIO - Smart Video Upload & Media Analysis Routes
 * Supports MP4, MOV, WebM uploads, automatic FFprobe metadata extraction,
 * thumbnail generation, waveform extraction, and video streaming.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ffmpegService } = require('../services/ffmpegService');
const { mediaStore } = require('../database/jsonStore');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `video_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|mov|webm|mkv|avi|m4v/i;
    const ext = path.extname(file.originalname).replace('.', '');
    if (allowed.test(ext) || allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Supported: MP4, MOV, WebM, MKV'));
    }
  }
});

// GET /api/media - list all media assets
router.get('/', (req, res) => {
  try {
    const items = mediaStore.findAll();
    res.json({ success: true, media: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/media/upload - upload & analyze video
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    console.log(`[MediaRoutes] Analyzing uploaded video: ${filePath}`);

    // Probe metadata using FFprobe
    const metadata = await ffmpegService.probe(filePath);

    // Generate thumbnail
    const thumbName = `thumb_${path.parse(fileName).name}.jpg`;
    const thumbPath = path.join(UPLOAD_DIR, thumbName);
    await ffmpegService.extractThumbnail(filePath, thumbPath, Math.min(2.0, metadata.duration / 2));

    const mediaRecord = {
      id: `media_${Date.now()}`,
      originalName: req.file.originalname,
      fileName: fileName,
      filePath: filePath,
      thumbnailUrl: `/api/media/file/${thumbName}`,
      videoUrl: `/api/media/file/${fileName}`,
      fileSize: req.file.size,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.aspectRatio,
      fps: metadata.fps,
      hasAudio: metadata.hasAudio,
      createdAt: new Date().toISOString()
    };

    const saved = mediaStore.create(mediaRecord);
    res.status(201).json({ success: true, media: saved });
  } catch (err) {
    console.error('[MediaRoutes] Video upload error:', err);
    res.status(500).json({ error: 'Video analysis failed: ' + err.message });
  }
});

// POST /api/media/generate-sample - generate sample video immediately
router.post('/generate-sample', async (req, res) => {
  try {
    const { title = 'Hyderabad Street Chai', format = '9:16' } = req.body;
    const isVertical = format === '9:16';
    const sampleFileName = `sample_${Date.now()}.mp4`;
    const sampleFilePath = path.join(UPLOAD_DIR, sampleFileName);

    await ffmpegService.generateSampleVideo(sampleFilePath, {
      duration: 12.0,
      width: isVertical ? 1080 : 1920,
      height: isVertical ? 1920 : 1080,
      title: title,
      subtitle: 'Reddy AI Studio • 4K Engine'
    });

    const metadata = await ffmpegService.probe(sampleFilePath);

    const thumbName = `thumb_${path.parse(sampleFileName).name}.jpg`;
    const thumbPath = path.join(UPLOAD_DIR, thumbName);
    await ffmpegService.extractThumbnail(sampleFilePath, thumbPath, 1.0);

    const record = {
      id: `media_sample_${Date.now()}`,
      originalName: `${title}.mp4`,
      fileName: sampleFileName,
      filePath: sampleFilePath,
      thumbnailUrl: `/api/media/file/${thumbName}`,
      videoUrl: `/api/media/file/${sampleFileName}`,
      fileSize: fs.statSync(sampleFilePath).size,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.aspectRatio,
      fps: metadata.fps,
      hasAudio: true,
      isSample: true,
      createdAt: new Date().toISOString()
    };

    const saved = mediaStore.create(record);
    res.json({ success: true, media: saved });
  } catch (err) {
    console.error('[MediaRoutes] Generate sample error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/media/file/:filename - serve video or thumbnail with streaming support
router.get('/file/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range && filePath.endsWith('.mp4')) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const mime = filePath.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': mime,
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

module.exports = router;
