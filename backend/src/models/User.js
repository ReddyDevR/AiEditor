const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['super_admin', 'admin', 'editor', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  avatarUrl: String,
  lastLoginAt: Date
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
