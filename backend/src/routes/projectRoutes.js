/**
 * REDDY AI STUDIO - Project Management API Routes
 * Handles project creation, duplication, deletion, multi-track timeline autosave,
 * and track/clip state management.
 */

const express = require('express');
const router = express.Router();
const { projectsStore } = require('../database/jsonStore');

// GET /api/projects - list all projects
router.get('/', (req, res) => {
  try {
    const list = projectsStore.findAll();
    res.json({ success: true, projects: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id - get single project
router.get('/:id', (req, res) => {
  try {
    const project = projectsStore.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects - create new project
router.post('/', (req, res) => {
  try {
    const { title, aspectRatio = '9:16', template = 'blank' } = req.body;

    const newProject = {
      id: `proj_${Date.now()}`,
      title: title || 'Untitled AI Project (కొత్త ప్రాజెక్ట్)',
      aspectRatio,
      duration: 15.0,
      status: 'draft',
      timeline: {
        tracks: [
          {
            id: 'track-v1',
            type: 'video',
            name: 'Video Track 1',
            clips: [
              {
                id: `clip_${Date.now()}`,
                title: 'Main Footage',
                start: 0,
                duration: 15.0,
                sourceDuration: 15.0,
                color: '#3b82f6',
                speed: 1.0,
                filter: 'none'
              }
            ]
          },
          {
            id: 'track-a1',
            type: 'audio',
            name: 'Audio / BGM Track',
            clips: [
              {
                id: `audio_${Date.now()}`,
                title: 'Ambient Beats',
                start: 0,
                duration: 15.0,
                volume: 0.4,
                ducking: true
              }
            ]
          },
          {
            id: 'track-s1',
            type: 'subtitles',
            name: 'Captions Track',
            clips: [
              {
                id: `sub_${Date.now()}`,
                text: 'Welcome to Reddy AI Studio! 🎬',
                start: 1.0,
                duration: 4.5,
                style: 'hormozi'
              }
            ]
          }
        ]
      },
      conversation: []
    };

    const created = projectsStore.create(newProject);
    res.status(201).json({ success: true, project: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id - update project timeline or metadata
router.put('/:id', (req, res) => {
  try {
    const updated = projectsStore.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/duplicate - duplicate project
router.post('/:id/duplicate', (req, res) => {
  try {
    const original = projectsStore.findById(req.params.id);
    if (!original) return res.status(404).json({ error: 'Project not found' });

    const duplicate = JSON.parse(JSON.stringify(original));
    duplicate.id = `proj_${Date.now()}`;
    duplicate.title = `${original.title} (Copy)`;
    duplicate.createdAt = new Date().toISOString();
    duplicate.updatedAt = new Date().toISOString();

    const created = projectsStore.create(duplicate);
    res.status(201).json({ success: true, project: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id - delete project
router.delete('/:id', (req, res) => {
  try {
    const deleted = projectsStore.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
