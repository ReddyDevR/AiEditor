/**
 * REDDY AI STUDIO - AI Video Generation & Storyboard API Routes
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { aiVideoGenService } = require('../services/aiVideoGenService');
const { aiGenerationsStore, mediaStore } = require('../database/jsonStore');

const EXPORTS_DIR = path.join(__dirname, '..', '..', 'exports');

// POST /api/generate/storyboard - generate multi-scene storyboard
router.post('/storyboard', async (req, res) => {
  try {
    const { prompt, aspectRatio = '9:16', duration = 16 } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const storyboard = await aiVideoGenService.generateStoryboard(prompt, { aspectRatio, duration });
    const saved = aiGenerationsStore.create(storyboard);

    res.json({ success: true, storyboard: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/generate/render - render storyboard into finished video
router.post('/render', async (req, res) => {
  try {
    const { storyboardId } = req.body;
    const storyboard = aiGenerationsStore.findById(storyboardId);
    if (!storyboard) return res.status(404).json({ error: 'Storyboard not found' });

    const outFilename = `ai_gen_${Date.now()}.mp4`;
    const outPath = path.join(EXPORTS_DIR, outFilename);

    const result = await aiVideoGenService.renderGeneratedVideo(storyboard, outPath);

    // Save as media asset
    const mediaRecord = {
      id: `media_gen_${Date.now()}`,
      originalName: `${storyboard.conceptPrompt.substring(0, 24)}.mp4`,
      fileName: outFilename,
      filePath: outPath,
      thumbnailUrl: `/api/media/file/thumb_sample.jpg`,
      videoUrl: `/api/render/download/${outFilename}`,
      duration: storyboard.totalDurationSec,
      aspectRatio: storyboard.aspectRatio,
      isAiGenerated: true,
      createdAt: new Date().toISOString()
    };
    mediaStore.create(mediaRecord);

    res.json({
      success: true,
      message: 'AI video successfully generated',
      result,
      media: mediaRecord
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/generate/all
router.get('/all', (req, res) => {
  try {
    const list = aiGenerationsStore.findAll();
    res.json({ success: true, generations: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
