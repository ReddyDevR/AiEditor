/**
 * REDDY AI STUDIO - Render Queue & Export Engine Routes
 * Manages background rendering jobs, real-time Server-Sent Events (SSE) progress,
 * and direct MP4 downloads.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { ffmpegService } = require('../services/ffmpegService');
const { renderJobsStore, projectsStore, mediaStore } = require('../database/jsonStore');
const cloudinaryStorage = require('../services/cloudinaryStorage');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

const EXPORTS_DIR = path.join(__dirname, '..', '..', 'exports');
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}


async function downloadToFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`Unable to download source video (${response.status})`);
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(destination));
}

// Active SSE client connections map
const sseClients = new Map();

// GET /api/render/history - list export history
router.get('/history', (req, res) => {
  try {
    const list = renderJobsStore.findAll();
    res.json({ success: true, jobs: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/render/events/:jobId - Server-Sent Events for real-time progress
router.get('/events/:jobId', (req, res) => {
  const { jobId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Register client
  if (!sseClients.has(jobId)) {
    sseClients.set(jobId, []);
  }
  sseClients.get(jobId).push(res);

  // Send initial status
  const job = renderJobsStore.findById(jobId);
  if (job) {
    res.write(`data: ${JSON.stringify(job)}\n\n`);
  }

  req.on('close', () => {
    const clients = sseClients.get(jobId) || [];
    sseClients.set(jobId, clients.filter(c => c !== res));
  });
});

function broadcastJobUpdate(jobId, data) {
  const clients = sseClients.get(jobId) || [];
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try { client.write(payload); } catch (e) {}
  });
}

// POST /api/render/start - initiate video rendering
router.post('/start', async (req, res) => {
  try {
    const {
      projectId,
      mediaId,
      aspectRatio = '9:16',
      resolution = '1080p',
      fps = 30,
      customPlan = null
    } = req.body;

    const project = projectId ? projectsStore.findById(projectId) : null;
    const mediaList = mediaStore.findAll();
    const media = mediaId ? mediaStore.findById(mediaId) : (mediaList.length > 0 ? mediaList[0] : null);

    const jobId = `job_${Date.now()}`;
    const outputFilename = `reddy_render_${Date.now()}_${aspectRatio.replace(':', 'x')}.mp4`;
    const outputPath = path.join(EXPORTS_DIR, outputFilename);

    const newJob = {
      id: jobId,
      projectId: projectId || 'standalone',
      projectTitle: project?.title || 'Reddy AI Custom Render',
      aspectRatio,
      resolution,
      fps,
      status: 'queued',
      progress: 0,
      stage: 'queued',
      message: 'Job submitted to video rendering queue',
      outputFilename,
      downloadUrl: `/api/render/download/${jobId}`,
      createdAt: new Date().toISOString()
    };

    renderJobsStore.create(newJob);

    // Respond immediately with job ticket
    res.status(202).json({ success: true, job: newJob });

    // Execute rendering asynchronously in background
    (async () => {
      try {
        let inputVideoPath = media?.filePath;
        let downloadedSourcePath = null;
        if ((!inputVideoPath || !fs.existsSync(inputVideoPath)) && media?.videoUrl) {
          downloadedSourcePath = path.join(EXPORTS_DIR, `source_${jobId}.mp4`);
          await downloadToFile(media.videoUrl, downloadedSourcePath);
          inputVideoPath = downloadedSourcePath;
        }

        // If no video uploaded yet, generate a high-quality sample video to process.
        if (!inputVideoPath || !fs.existsSync(inputVideoPath)) {
          const samplePath = path.join(EXPORTS_DIR, `temp_source_${Date.now()}.mp4`);
          await ffmpegService.generateSampleVideo(samplePath, {
            duration: project?.duration || 12.0,
            title: project?.title || 'REDDY AI STUDIO',
            subtitle: 'Real Autonomous Render'
          });
          inputVideoPath = samplePath;
        }

        // Subtitles from project
        const subTrack = project?.timeline?.tracks?.find(t => t.type === 'subtitles');
        const subtitles = subTrack?.clips || [
          { start: 0.5, duration: 4.0, text: 'Reddy AI Studio Autonomous Render 🔥' },
          { start: 5.0, duration: 4.5, text: 'Cinematic Telugu & English Multi-Track Video 🎬' }
        ];

        renderJobsStore.update(jobId, { status: 'rendering', stage: 'analyzing', progress: 10 });
        broadcastJobUpdate(jobId, { status: 'rendering', stage: 'analyzing', progress: 10, message: 'Analyzing timeline' });

        await ffmpegService.renderProject(
          {
            inputVideo: inputVideoPath,
            outputVideo: outputPath,
            plan: customPlan || {
              operations: [
                { type: 'APPLY_COLOR_GRADE', preset: 'teal_orange' },
                { type: 'SET_ASPECT_RATIO', aspectRatio: aspectRatio }
              ]
            },
            aspectRatio,
            resolution,
            fps,
            subtitles
          },
          (progressInfo) => {
            renderJobsStore.update(jobId, {
              status: progressInfo.stage === 'completed' ? 'completed' : 'rendering',
              stage: progressInfo.stage,
              progress: progressInfo.percent,
              message: progressInfo.message
            });
            broadcastJobUpdate(jobId, {
              status: progressInfo.stage === 'completed' ? 'completed' : 'rendering',
              stage: progressInfo.stage,
              progress: progressInfo.percent,
              message: progressInfo.message
            });
          }
        );

        // Persist completed exports in Cloudinary; Render's local disk is temporary.
        const stat = fs.existsSync(outputPath) ? fs.statSync(outputPath) : null;
        if (!stat) throw new Error('Render output file was not created.');
        const exportedAsset = await cloudinaryStorage.uploadFile(outputPath, { folder: 'reddy-ai-studio/exports', resourceType: 'video' });
        renderJobsStore.update(jobId, {
          status: 'completed', stage: 'completed', progress: 100,
          fileSize: stat.size, outputUrl: exportedAsset.secure_url,
          cloudinaryPublicId: exportedAsset.public_id,
          downloadUrl: exportedAsset.secure_url,
          completedAt: new Date().toISOString()
        });
        broadcastJobUpdate(jobId, {
          status: 'completed', stage: 'completed', progress: 100,
          fileSize: stat.size, outputUrl: exportedAsset.secure_url,
          downloadUrl: exportedAsset.secure_url
        });
        try { fs.unlinkSync(outputPath); } catch (_) {}
        if (downloadedSourcePath) { try { fs.unlinkSync(downloadedSourcePath); } catch (_) {} }

      } catch (renderErr) {
        console.error('[RenderRoutes] Render job failed:', renderErr);
        renderJobsStore.update(jobId, {
          status: 'failed',
          stage: 'failed',
          error: renderErr.message
        });
        broadcastJobUpdate(jobId, {
          status: 'failed',
          stage: 'failed',
          error: renderErr.message
        });
      }
    })();

  } catch (err) {
    console.error('[RenderRoutes] Render initiation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/render/status/:jobId - poll status
router.get('/status/:jobId', (req, res) => {
  const job = renderJobsStore.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ success: true, job });
});

// GET /api/render/download/:jobId - download final MP4
router.get('/download/:jobId', (req, res) => {
  const job = renderJobsStore.findById(req.params.jobId);
  if (!job) return res.status(404).send('Render job not found');

  if (job.outputUrl) return res.redirect(302, job.outputUrl);
  const filePath = path.join(EXPORTS_DIR, job.outputFilename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Exported file not found or still processing');
  }

  res.download(filePath, job.outputFilename, (err) => {
    if (err) console.error('[RenderRoutes] Download stream error:', err);
  });
});

module.exports = router;
