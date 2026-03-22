const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Internship = require('../models/Internship');
const { auth, isAdmin } = require('../middleware/auth');

// @route GET /api/users/profile - Get own profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedInternships');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/users/profile - Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'skills', 'education', 'experience', 'phone', 'location', 'linkedIn', 'github', 'portfolio', 'profilePicture', 'resume', 'companySize', 'industry', 'foundedYear', 'website', 'companyDescription'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route POST /api/users/save-internship/:id
router.post('/save-internship/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const internshipId = req.params.id;

    if (user.savedInternships.includes(internshipId)) {
      user.savedInternships = user.savedInternships.filter(id => id.toString() !== internshipId);
      await user.save();
      return res.json({ message: 'Internship removed from saved', saved: false });
    }

    user.savedInternships.push(internshipId);
    await user.save();
    res.json({ message: 'Internship saved successfully', saved: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/users/saved-internships
router.get('/saved-internships', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedInternships');
    res.json({ internships: user.savedInternships });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// ─── ADMIN USER MANAGEMENT ROUTES ─────────────────────────────────────────

// GET /api/users/admin/all — admin gets all users
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/users/admin/:id — admin deletes any user
router.delete('/admin/:id', auth, isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot delete themselves' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `User "${user.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/users/admin/:id/role — admin changes user role
router.patch('/admin/:id/role', auth, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'company', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `Role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
