const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Internship = require('../models/Internship');
const { auth, isAdmin } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/emailService');

// ─── COMPANY VERIFICATION ROUTES ──────────────────────────────────────────

// GET /api/verification/pending — Get all companies pending verification
router.get('/pending', auth, isAdmin, async (req, res) => {
  try {
    const companies = await User.find({ 
      role: 'company', 
      verificationStatus: 'pending' 
    }).select('-password').sort({ createdAt: -1 });
    
    res.json({ companies });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/verification/all — Get all companies with verification details
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { role: 'company' };
    if (status) filter.verificationStatus = status;

    const companies = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    // Get internship counts for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const internshipCount = await Internship.countDocuments({ companyId: company._id });
        const applicationCount = await Internship.aggregate([
          { $match: { companyId: company._id } },
          { $group: { _id: null, total: { $sum: '$applicationsCount' } } }
        ]);
        
        return {
          ...company.toObject(),
          internshipCount,
          applicationCount: applicationCount[0]?.total || 0
        };
      })
    );

    res.json({ companies: companiesWithStats });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/verification/:id/verify — Verify a company
router.post('/:id/verify', auth, isAdmin, async (req, res) => {
  try {
    const { trustScore, trustBadge, notes } = req.body;
    
    const company = await User.findById(req.params.id);
    if (!company || company.role !== 'company') {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update verification status
    company.verificationStatus = 'verified';
    company.verifiedAt = new Date();
    company.verifiedBy = req.user._id;
    company.verificationNotes = notes || '';
    company.isVerified = true;
    
    // Set trust score and badge
    if (trustScore !== undefined) {
      company.trustScore = Math.min(100, Math.max(0, trustScore));
    } else {
      // Auto-calculate trust score based on profile completeness
      company.trustScore = calculateTrustScore(company);
    }
    
    if (trustBadge) {
      company.trustBadge = trustBadge;
    } else {
      // Auto-assign badge based on trust score
      company.trustBadge = assignTrustBadge(company.trustScore);
    }

    await company.save();

    // Send verification success email
    await sendVerificationEmail(
      company.email,
      company.name,
      'approved',
      company.trustBadge,
      notes
    );

    res.json({ 
      message: 'Company verified successfully', 
      company: {
        ...company.toObject(),
        password: undefined
      }
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/verification/:id/reject — Reject a company verification
router.post('/:id/reject', auth, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const company = await User.findById(req.params.id);
    if (!company || company.role !== 'company') {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.verificationStatus = 'rejected';
    company.verificationNotes = reason || '';
    company.isVerified = false;
    company.trustScore = 0;
    company.trustBadge = 'none';

    await company.save();

    // Send rejection email
    await sendVerificationEmail(
      company.email,
      company.name,
      'rejected',
      'none',
      reason
    );

    res.json({ message: 'Verification rejected', company });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/verification/:id/trust-score — Update trust score
router.put('/:id/trust-score', auth, isAdmin, async (req, res) => {
  try {
    const { trustScore, trustBadge } = req.body;
    
    const company = await User.findById(req.params.id);
    if (!company || company.role !== 'company') {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (trustScore !== undefined) {
      company.trustScore = Math.min(100, Math.max(0, trustScore));
    }
    
    if (trustBadge) {
      company.trustBadge = trustBadge;
    } else {
      company.trustBadge = assignTrustBadge(company.trustScore);
    }

    await company.save();

    res.json({ message: 'Trust score updated', company });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/verification/:id/status — Update verification status (pending/unverified)
router.put('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'unverified', 'verified', 'rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const company = await User.findById(req.params.id);
    if (!company || company.role !== 'company') {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Apply status changes
    if (status === 'verified') {
      company.verificationStatus = 'verified';
      company.verifiedAt = new Date();
      company.verifiedBy = req.user._id;
      company.isVerified = true;
      company.verificationNotes = company.verificationNotes || '';
      company.trustScore = company.trustScore || calculateTrustScore(company);
      company.trustBadge = company.trustBadge || assignTrustBadge(company.trustScore);
      // send email notifying approval if desired
      try {
        await sendVerificationEmail(company.email, company.name, 'approved', company.trustBadge, company.verificationNotes);
      } catch (e) { console.warn('Email send failed', e.message); }
    } else if (status === 'rejected') {
      company.verificationStatus = 'rejected';
      company.verificationNotes = company.verificationNotes || '';
      company.isVerified = false;
      company.trustScore = 0;
      company.trustBadge = 'none';
      try {
        await sendVerificationEmail(company.email, company.name, 'rejected', 'none', company.verificationNotes);
      } catch (e) { console.warn('Email send failed', e.message); }
    } else if (status === 'pending') {
      company.verificationStatus = 'pending';
      company.isVerified = false;
    } else if (status === 'unverified') {
      company.verificationStatus = 'unverified';
      company.isVerified = false;
      company.trustScore = company.trustScore || 0;
      company.trustBadge = company.trustBadge || 'none';
    }

    await company.save();

    res.json({ message: 'Status updated', company });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────

// Calculate trust score based on profile completeness and activity
const calculateTrustScore = (company) => {
  let score = 0;
  
  // Basic info (30 points)
  if (company.email) score += 5;
  if (company.phone) score += 5;
  if (company.location) score += 5;
  if (company.website) score += 5;
  if (company.companyDescription) score += 5;
  if (company.industry) score += 5;
  
  // Documents (20 points)
  if (company.verificationDocuments && company.verificationDocuments.length > 0) {
    score += Math.min(20, company.verificationDocuments.length * 7);
  }
  
  // Profile completeness (20 points)
  if (company.companySize) score += 5;
  if (company.foundedYear) score += 5;
  if (company.linkedIn) score += 5;
  if (company.bio) score += 5;
  
  // Verification (30 points)
  if (company.verificationStatus === 'verified') score += 30;
  
  return Math.min(100, score);
};

// Assign trust badge based on score
const assignTrustBadge = (score) => {
  if (score >= 90) return 'platinum';
  if (score >= 75) return 'gold';
  if (score >= 60) return 'silver';
  if (score >= 40) return 'bronze';
  return 'none';
};

module.exports = router;
