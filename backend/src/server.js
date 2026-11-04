/**
 * REDDY AI STUDIO - Production Video Backend Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const storageRoutes = require('./routes/storageRoutes');
const { configured: cloudinaryConfigured } = require('./services/cloudinaryStorage');

const chatRoutes = require('./routes/chatRoutes');
const projectRoutes = require('./routes/projectRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const renderRoutes = require('./routes/renderRoutes');
const autonomousRoutes = require('./routes/autonomousRoutes');
const referenceRoutes = require('./routes/referenceRoutes');
const generateRoutes = require('./routes/generateRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 10000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('[Startup] JWT_SECRET must be configured with at least 32 characters.');
  process.exit(1);
}

const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(v => v.trim()).filter(Boolean);
const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) { console.warn('[Database] MONGODB_URI missing; MongoDB auth is unavailable.'); return; }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[Database] MongoDB connected');
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && !(await User.exists({ email }))) {
    await User.create({ name: process.env.ADMIN_NAME || 'REDDY AI STUDIO', email, passwordHash: await bcrypt.hash(password, 12), role: 'super_admin' });
    console.log('[Auth] Initial Super Admin created');
  }
};

// Enable CORS
app.use(cors({
  origin: (origin, callback) => { if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('Origin not allowed by CORS')); },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range']
}));

// Body parsing
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static media directories
const uploadsDir = path.join(__dirname, '..', 'uploads');
const exportsDir = path.join(__dirname, '..', 'exports');
const frontendDistDir = path.join(__dirname, '..', '..', 'frontend', 'dist');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));
app.use('/exports', express.static(exportsDir));

// Serve Frontend SPA Dist if built
if (fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));
}

// Authentication and object storage APIs
app.use('/api/auth', authRoutes);
app.use('/api/storage', storageRoutes);

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/render', renderRoutes);
app.use('/api/autonomous', autonomousRoutes);
app.use('/api/reference', referenceRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    product: 'REDDY AI STUDIO',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    objectStorage: cloudinaryConfigured() ? 'cloudinary_configured' : 'not_configured',
    mediaStorage: cloudinaryConfigured() ? 'Cloudinary' : 'not_configured'
  });
});

// SPA fallback
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDistDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.send('<h1>REDDY AI STUDIO API Server</h1><p>Autonomous AI-powered video editing and rendering engine is active on port ' + PORT + '</p>');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

connectDatabase().catch(err => { console.error('[Database] Connection failed:', err.message); process.exit(1); });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 REDDY AI STUDIO Backend Server running on port ${PORT}`);
  console.log(`   Health Check: http://127.0.0.1:${PORT}/api/health`);
  console.log(`   Projects API: http://127.0.0.1:${PORT}/api/projects`);
  console.log(`   Render Engine: http://127.0.0.1:${PORT}/api/render/history`);
  console.log(`=======================================================`);
});

module.exports = app;
