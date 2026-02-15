const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { auth, isCompanyOnly, isAdmin, isCompanyOrAdmin } = require('../middleware/auth');

// ─── Static routes MUST come before /:id ───────────────────────────────────

// GET /api/internships/company/mine  — company sees only their own
router.get('/company/mine', auth, isCompanyOnly, async (req, res) => {
  try {
    const internships = await Internship.find({ companyId: req.user._id }).sort({ createdAt: -1 });
    res.json({ internships });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/internships/featured
router.get('/featured', async (req, res) => {
  try {
    const internships = await Internship.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 }).limit(6);
    res.json({ internships });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/internships/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Internship.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN ROUTES ──────────────────────────────────────────────────────────

// GET /api/internships/admin/all — admin sees ALL internships (incl. inactive)
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Internship.countDocuments(query);
    const internships = await Internship.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ internships, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/internships/admin/stats — admin platform statistics
router.get('/admin/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalInternships = await Internship.countDocuments();
    const activeInternships = await Internship.countDocuments({ isActive: true });
    const featuredInternships = await Internship.countDocuments({ isFeatured: true });
    const totalApplications = await Application.countDocuments();
    const categoryBreakdown = await Internship.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ totalInternships, activeInternships, featuredInternships, totalApplications, categoryBreakdown });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/internships/admin/:id/toggle-active — admin toggle active/inactive
router.patch('/admin/:id/toggle-active', auth, isAdmin, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    internship.isActive = !internship.isActive;
    await internship.save();
    res.json({ message: `Internship ${internship.isActive ? 'activated' : 'deactivated'}`, internship });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/internships/admin/:id/toggle-featured — admin toggle featured
router.patch('/admin/:id/toggle-featured', auth, isAdmin, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    internship.isFeatured = !internship.isFeatured;
    await internship.save();
    res.json({ message: `Internship ${internship.isFeatured ? 'featured' : 'unfeatured'}`, internship });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/internships/admin/:id — admin can delete ANY internship
router.delete('/admin/:id', auth, isAdmin, async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    // Also delete all applications for this internship
    await Application.deleteMany({ internshipId: req.params.id });
    res.json({ message: 'Internship and all its applications deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── PUBLIC / GENERAL ROUTES ───────────────────────────────────────────────

// GET /api/internships
router.get('/', async (req, res) => {
  try {
    const {
      search, category, type, location, minStipend, maxStipend,
      page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', featured
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (category && category !== 'all') query.category = category;
    if (type && type !== 'all') query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (featured === 'true') query.isFeatured = true;
    if (minStipend || maxStipend) {
      query['stipend.amount'] = {};
      if (minStipend) query['stipend.amount'].$gte = Number(minStipend);
      if (maxStipend) query['stipend.amount'].$lte = Number(maxStipend);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Internship.countDocuments(query);
    const internships = await Internship.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ internships, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/internships/:id  — dynamic, MUST be last GET
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    internship.views += 1;
    await internship.save();
    res.json({ internship });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── COMPANY-ONLY WRITE ROUTES ─────────────────────────────────────────────

// POST — ONLY company can post (not admin)
router.post('/', auth, isCompanyOnly, async (req, res) => {
  try {
    const internship = new Internship({
      ...req.body,
      company: req.body.company || req.user.name,
      companyId: req.user._id,
      companyLogo: req.body.companyLogo || req.user.profilePicture || ''
    });
    await internship.save();
    res.status(201).json({ message: 'Internship posted successfully', internship });
  } catch (err) {
    console.error('POST /internships error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT — company can only edit their own
router.put('/:id', auth, isCompanyOnly, async (req, res) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, companyId: req.user._id });
    if (!internship) return res.status(404).json({ message: 'Internship not found or unauthorized' });
    Object.assign(internship, { ...req.body, updatedAt: Date.now() });
    await internship.save();
    res.json({ message: 'Internship updated', internship });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE — company can only delete their own
router.delete('/:id', auth, isCompanyOnly, async (req, res) => {
  try {
    const internship = await Internship.findOneAndDelete({ _id: req.params.id, companyId: req.user._id });
    if (!internship) return res.status(404).json({ message: 'Internship not found or unauthorized' });
    res.json({ message: 'Internship deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
