const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { auth, isStudentOnly, isCompanyOnly, isAdmin, isCompanyOrAdmin } = require('../middleware/auth');

// ─── ADMIN ROUTES (before dynamic routes) ─────────────────────────────────

// GET /api/applications/admin/all — admin sees ALL applications
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Application.countDocuments();
    const applications = await Application.find()
      .populate('internshipId', 'title company location')
      .populate('studentId', 'name email')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    res.json({ applications, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/applications/admin/:id — admin can delete any application
router.delete('/admin/:id', auth, isAdmin, async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    await Internship.findByIdAndUpdate(application.internshipId, { $inc: { applicationsCount: -1 } });
    res.json({ message: 'Application deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/applications/admin/:id/status — admin can update any application status
router.put('/admin/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    application.status = status;
    if (feedback) application.feedback = feedback;
    application.updatedAt = Date.now();
    await application.save();
    res.json({ message: 'Application status updated by admin', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── STUDENT-ONLY ROUTES ───────────────────────────────────────────────────

// POST /api/applications — ONLY students can apply
router.post('/', auth, isStudentOnly, async (req, res) => {
  try {
    const { internshipId, coverLetter, resume, answers } = req.body;

    const existing = await Application.findOne({ internshipId, studentId: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already applied for this internship' });

    const internship = await Internship.findById(internshipId);
    if (!internship || !internship.isActive) {
      return res.status(404).json({ message: 'Internship not found or inactive' });
    }
    if (new Date(internship.applicationDeadline) < new Date()) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    const application = new Application({
      internshipId,
      studentId: req.user._id,
      coverLetter,
      resume: resume || req.user.resume,
      answers
    });
    await application.save();
    await Internship.findByIdAndUpdate(internshipId, { $inc: { applicationsCount: 1 } });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/applications/my — student's own applications
router.get('/my', auth, isStudentOnly, async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('internshipId', 'title company location type stipend duration applicationDeadline companyLogo')
      .sort({ appliedAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/applications/:id — student withdraws their own application
router.delete('/:id', auth, isStudentOnly, async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw an application that has been reviewed' });
    }
    await application.deleteOne();
    await Internship.findByIdAndUpdate(application.internshipId, { $inc: { applicationsCount: -1 } });
    res.json({ message: 'Application withdrawn successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── COMPANY-ONLY ROUTES ──────────────────────────────────────────────────

// GET /api/applications/internship/:id — company views applications for their internship
router.get('/internship/:id', auth, isCompanyOnly, async (req, res) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, companyId: req.user._id });
    if (!internship) return res.status(404).json({ message: 'Internship not found or you do not own it' });

    const applications = await Application.find({ internshipId: req.params.id })
      .populate('studentId', 'name email profilePicture skills education experience phone location resume')
      .sort({ appliedAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/applications/:id/status — company updates status for their internship's applicant
router.put('/:id/status', auth, isCompanyOnly, async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const application = await Application.findById(req.params.id).populate('internshipId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Ensure the company owns the internship this application belongs to
    if (application.internshipId.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: you do not own this internship' });
    }

    application.status = status;
    if (feedback) application.feedback = feedback;
    application.updatedAt = Date.now();
    await application.save();

    res.json({ message: 'Application status updated', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
