/** Fully automatic upload -> understand request -> render -> downloadable result. */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { ffmpegService } = require('../services/ffmpegService');
const cloudinaryStorage = require('../services/cloudinaryStorage');
const { createAutonomousPlan } = require('../services/autonomousAiService');

const workDir = path.join(__dirname, '..', '..', 'uploads');
const exportDir = path.join(__dirname, '..', '..', 'exports');
fs.mkdirSync(workDir, { recursive: true }); fs.mkdirSync(exportDir, { recursive: true });
const jobs = new Map();
const upload = multer({ dest: workDir, limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 500) * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const ok = /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(file.originalname) || /^video\//i.test(file.mimetype);
  cb(ok ? null : new Error('Supported video formats: MP4, MOV, WebM, MKV, AVI'), ok);
} });

router.post('/start', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'Video upload cheyyandi.' });
  const prompt = String(req.body.prompt || '').trim();
  if (prompt.length < 5) { fs.rmSync(req.file.path, { force: true }); return res.status(400).json({ success: false, error: 'Mee editing requirement enter cheyyandi.' }); }
  const id = `auto_${Date.now()}`;
  const job = { id, status: 'queued', progress: 2, stage: 'upload', message: 'Video received. AI processing start avutondi.', createdAt: new Date().toISOString() };
  jobs.set(id, job);
  res.status(202).json({ success: true, job });

  (async () => {
    let inputPath = req.file.path; let outputPath;
    const analysisDir = path.join(workDir, `analysis_${id}`);
    try {
      job.status = 'processing'; job.stage = 'analyzing'; job.progress = 8; job.message = 'Video metadata analyze chestunnam';
      const metadata = await ffmpegService.probe(inputPath);
      // Save original in persistent object storage before the temporary upload is removed.
      const sourceAsset = await cloudinaryStorage.uploadFile(inputPath, { folder: 'reddy-ai-studio/autonomous-inputs', resourceType: 'video' });
      job.sourceUrl = sourceAsset.secure_url; job.progress = 18;
      const context = { id, title: req.file.originalname, duration: metadata.duration, width: metadata.width, height: metadata.height, aspectRatio: metadata.aspectRatio, hasAudio: metadata.hasAudio };
      job.stage = 'understanding'; job.progress = 22; job.message = 'AI video frames ni analyze chesi editing decisions teesukuntundi...';
      const plan = await createAutonomousPlan(inputPath, prompt, context, analysisDir);
      const aspectRatio = plan.aspectRatio;
      const operations = plan.operations;
      job.aiSummary = plan.summary;
      job.stage = 'editing'; job.progress = 30; job.message = 'AI decisions complete. FFmpeg automatic editing and rendering start avutondi.';
      outputPath = path.join(exportDir, `${id}.mp4`);
      await ffmpegService.renderProject({ inputVideo: inputPath, outputVideo: outputPath, plan: { operations }, aspectRatio, resolution: plan.resolution, fps: 30, subtitles: plan.subtitles || [] }, info => {
        job.progress = Math.max(25, Math.min(92, Math.round(25 + info.percent * 0.67)));
        job.stage = info.stage; job.message = info.message || 'Video render avutondi';
      });
      job.stage = 'uploading'; job.progress = 95; job.message = 'Final video secure storage ki upload avutondi.';
      const finalAsset = await cloudinaryStorage.uploadFile(outputPath, { folder: 'reddy-ai-studio/autonomous-exports', resourceType: 'video' });
      job.status = 'completed'; job.stage = 'completed'; job.progress = 100; job.message = 'Mee edited video ready!';
      job.outputUrl = finalAsset.secure_url; job.downloadUrl = finalAsset.secure_url; job.completedAt = new Date().toISOString();
      job.analysis = { duration: metadata.duration, width: metadata.width, height: metadata.height, detectedAspectRatio: aspectRatio, appliedOperations: operations.map(o => o.type), aiSummary: plan.summary, aiProvider: plan.provider };
    } catch (error) {
      console.error('[Autonomous] Job failed:', error);
      job.status = 'failed'; job.stage = 'failed'; job.error = error.message; job.message = 'Automatic editing complete kaaledu.';
    } finally {
      try { fs.rmSync(req.file.path, { force: true }); } catch (_) {}
      if (outputPath) try { fs.rmSync(outputPath, { force: true }); } catch (_) {}
      try { fs.rmSync(analysisDir, { recursive: true, force: true }); } catch (_) {}
    }
  })();
});

router.get('/status/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found or server restarted.' });
  res.json({ success: true, job });
});
module.exports = router;
