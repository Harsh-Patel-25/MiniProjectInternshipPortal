const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { auth, isAdmin } = require('../middleware/auth');

// ─── ADVANCED ANALYTICS ROUTES ────────────────────────────────────────────

// GET /api/analytics/overview — Advanced overview statistics
router.get('/overview', auth, isAdmin, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total counts
    const [totalUsers, totalCompanies, totalStudents, totalInternships, totalApplications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'company' }),
      User.countDocuments({ role: 'student' }),
      Internship.countDocuments(),
      Application.countDocuments()
    ]);

    // New users in last 30 days
    const [newUsers30d, newCompanies30d, newStudents30d] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ role: 'company', createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ role: 'student', createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Active stats
    const activeInternships = await Internship.countDocuments({ isActive: true });
    const pendingApplications = await Application.countDocuments({ status: 'pending' });

    // Verification stats
    const [verifiedCompanies, pendingVerification, unverifiedCompanies] = await Promise.all([
      User.countDocuments({ role: 'company', verificationStatus: 'verified' }),
      User.countDocuments({ role: 'company', verificationStatus: 'pending' }),
      User.countDocuments({ role: 'company', verificationStatus: 'unverified' })
    ]);

    // Trust badge distribution
    const trustBadges = await User.aggregate([
      { $match: { role: 'company' } },
      { $group: { _id: '$trustBadge', count: { $sum: 1 } } }
    ]);

    // Application status distribution
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top companies by applications
    const topCompanies = await Internship.aggregate([
      { $group: { 
        _id: '$companyId',
        totalApplications: { $sum: '$applicationsCount' },
        internshipsCount: { $sum: 1 }
      }},
      { $sort: { totalApplications: -1 } },
      { $limit: 10 },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'company'
      }},
      { $unwind: '$company' },
      { $project: {
        companyName: '$company.name',
        verificationStatus: '$company.verificationStatus',
        trustBadge: '$company.trustBadge',
        totalApplications: 1,
        internshipsCount: 1
      }}
    ]);

    // Growth data (last 7 days)
    const growthData = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { 
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          role: '$role'
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalCompanies,
        totalStudents,
        totalInternships,
        totalApplications,
        activeInternships,
        pendingApplications
      },
      growth: {
        newUsers30d,
        newCompanies30d,
        newStudents30d,
        growthData
      },
      verification: {
        verified: verifiedCompanies,
        pending: pendingVerification,
        unverified: unverifiedCompanies,
        verificationRate: totalCompanies > 0 ? ((verifiedCompanies / totalCompanies) * 100).toFixed(1) : 0
      },
      trustBadges: trustBadges.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topCompanies
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/analytics/trends — Time-series data for charts
router.get('/trends', auth, isAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Daily user registrations
    const userTrends = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          role: '$role'
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.date': 1 } }
    ]);

    // Daily applications
    const applicationTrends = await Application.aggregate([
      { $match: { appliedAt: { $gte: startDate } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    // Daily internship postings
    const internshipTrends = await Internship.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      period,
      userTrends,
      applicationTrends,
      internshipTrends
    });
  } catch (err) {
    console.error('Trends error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/analytics/companies — Company analytics
router.get('/companies', auth, isAdmin, async (req, res) => {
  try {
    // Industry distribution
    const byIndustry = await User.aggregate([
      { $match: { role: 'company', industry: { $exists: true, $ne: '' } } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Company size distribution
    const bySize = await User.aggregate([
      { $match: { role: 'company', companySize: { $exists: true, $ne: '' } } },
      { $group: { _id: '$companySize', count: { $sum: 1 } } }
    ]);

    // Average trust score
    const avgTrustScore = await User.aggregate([
      { $match: { role: 'company', trustScore: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$trustScore' } } }
    ]);

    res.json({
      byIndustry,
      bySize,
      avgTrustScore: avgTrustScore[0]?.avgScore || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
