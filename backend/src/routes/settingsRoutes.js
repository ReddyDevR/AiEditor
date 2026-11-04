/**
 * REDDY AI STUDIO - System Settings & Health Routes
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { ffmpegService } = require('../services/ffmpegService');

router.get('/status', (req, res) => {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  const exportsDir = path.join(__dirname, '..', '..', 'exports');

  const getDirSize = (dir) => {
    if (!fs.existsSync(dir)) return 0;
    const files = fs.readdirSync(dir);
    return files.reduce((acc, f) => {
      try {
        return acc + fs.statSync(path.join(dir, f)).size;
      } catch (e) {
        return acc;
      }
    }, 0);
  };

  res.json({
    success: true,
    platform: 'REDDY AI STUDIO',
    version: '2.5.0-production',
    system: {
      os: process.platform,
      nodeVersion: process.version,
      ffmpegPath: ffmpegService.ffmpegPath,
      ffmpegAvailable: fs.existsSync(ffmpegService.ffmpegPath) || ffmpegService.ffmpegPath === 'ffmpeg',
      ffprobePath: ffmpegService.ffprobePath,
      ffprobeAvailable: fs.existsSync(ffmpegService.ffprobePath) || ffmpegService.ffprobePath === 'ffprobe'
    },
    aiProviders: {
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      claudeConfigured: !!process.env.ANTHROPIC_API_KEY,
      localAutonomousAgent: true,
      teluguRomanNlpEngine: 'Active (Built-in Heuristic + Stemmer)'
    },
    storage: {
      uploadsCount: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0,
      uploadsBytes: getDirSize(uploadsDir),
      exportsCount: fs.existsSync(exportsDir) ? fs.readdirSync(exportsDir).length : 0,
      exportsBytes: getDirSize(exportsDir)
    }
  });
});

module.exports = router;
