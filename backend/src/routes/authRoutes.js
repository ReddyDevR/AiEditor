const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth, allowRoles } = require('../middleware/auth');
const tokenFor = user => jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || password.length < 10) return res.status(400).json({ error: 'Name, valid email and password (minimum 10 characters) are required' });
    const normalized = String(email).toLowerCase().trim();
    if (await User.exists({ email: normalized })) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ name, email: normalized, passwordHash: await bcrypt.hash(password, 12), role: 'user' });
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || '').toLowerCase().trim() }).select('+passwordHash');
    if (!user || !user.isActive || !await bcrypt.compare(req.body.password || '', user.passwordHash)) return res.status(401).json({ error: 'Invalid email or password' });
    user.lastLoginAt = new Date(); await user.save();
    res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});
router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));
router.get('/users', requireAuth, allowRoles('super_admin', 'admin'), async (req, res, next) => { try { const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(500); res.json({ users }); } catch(e) { next(e); } });
router.patch('/users/:id/role', requireAuth, allowRoles('super_admin'), async (req, res, next) => { try { const role = req.body.role; if (!['admin','editor','user'].includes(role)) return res.status(400).json({ error: 'Invalid role' }); const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash'); if (!user) return res.status(404).json({ error: 'User not found' }); res.json({ user }); } catch(e) { next(e); } });
module.exports = router;
