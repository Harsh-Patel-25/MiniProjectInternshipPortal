const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { auth, isCompanyOnly, isAdmin } = require('../middleware/auth');

// GET /api/companies — public list of companies
router.get('/', async (req, res) => {
  try {
    const companies = await User.find({ role: 'company' })
      .select('name profilePicture bio location createdAt')
      .sort({ createdAt: -1 });
    res.json({ companies });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/companies/dashboard — company's own dashboard stats (company only)
router.get('/dashboard', auth, isCompanyOnly, async (req, res) => {
  try {
    const internships = await Internship.find({ companyId: req.user._id });
    const internshipIds = internships.map(i => i._id);

    const totalApplications = await Application.countDocuments({ internshipId: { $in: internshipIds } });
    const pendingApplications = await Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'pending' });
    const shortlisted = await Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'shortlisted' });
    const selected = await Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'selected' });

    res.json({
      stats: {
        totalInternships: internships.length,
        activeInternships: internships.filter(i => i.isActive).length,
        totalApplications,
        pendingApplications,
        shortlisted,
        selected
      },
      recentInternships: internships.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
