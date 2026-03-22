import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './AdminDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldAlt,
  faUsers,
  faBuilding,
  faGraduationCap,
  faBriefcase,
  faFileLines,
  faCheck,
  faXmark,
  faChartSimple,
  faTrash,
  faStar,
  faGem,
  faTrophy,
  faMedal,
  faCircle,
  faChartPie
} from '@fortawesome/free-solid-svg-icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const TABS = ['overview', 'analytics', 'verification', 'internships', 'users', 'applications'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [verification, setVerification] = useState({ companies: [] });
  const [internships, setInternships] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (activeTab === 'analytics') fetchAnalytics(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'verification') fetchVerification(); }, [activeTab, verificationFilter]);
  useEffect(() => { if (activeTab === 'internships') fetchInternships(); }, [activeTab, search]);
  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab, userRoleFilter]);
  useEffect(() => { if (activeTab === 'applications') fetchApplications(); }, [activeTab]);

  const fetchAll = async () => {
    try {
      const [statsRes, internRes, userRes, appRes] = await Promise.all([
        api.get('/internships/admin/stats'),
        api.get('/internships/admin/all?limit=50'),
        api.get('/users/admin/all?limit=50'),
        api.get('/applications/admin/all?limit=50'),
      ]);
      setStats(statsRes.data);
      setInternships(internRes.data.internships || []);
      setUsers(userRes.data.users || []);
      setApplications(appRes.data.applications || []);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, trendsRes, companiesRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/trends?period=30d'),
        api.get('/analytics/companies')
      ]);
      setAnalytics({
        ...overviewRes.data,
        companyStats: companiesRes.data
      });
      setTrends(trendsRes.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    }
  };

  const fetchVerification = async () => {
    try {
      const res = await api.get(`/verification/all${verificationFilter ? '?status=' + verificationFilter : ''}`);
      setVerification(res.data);
    } catch (err) {
      console.error('Verification fetch error:', err);
    }
  };

  const fetchInternships = async () => {
    try {
      const res = await api.get(`/internships/admin/all?limit=100&search=${search}`);
      setInternships(res.data.internships || []);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users/admin/all?limit=100${userRoleFilter ? '&role=' + userRoleFilter : ''}`);
      setUsers(res.data.users || []);
    } catch {}
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/admin/all?limit=100');
      setApplications(res.data.applications || []);
    } catch {}
  };

  // ─── Verification Actions ──────────────────────────────────────────────

  const verifyCompany = async (companyId, companyName) => {
    const trustScore = prompt(`Enter trust score (0-100) for ${companyName}:`, '75');
    if (!trustScore) return;

    const score = parseInt(trustScore);
    if (isNaN(score) || score < 0 || score > 100) {
      return toast.error('Invalid trust score. Must be 0-100.');
    }

    const notes = prompt('Add verification notes (optional):');

    try {
      await api.post(`/verification/${companyId}/verify`, {
        trustScore: score,
        notes
      });
      toast.success(`${companyName} verified successfully!`);
      fetchVerification();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const rejectVerification = async (companyId, companyName) => {
    const reason = prompt(`Reason for rejecting ${companyName}:`);
    if (!reason) return;

    try {
      await api.post(`/verification/${companyId}/reject`, { reason });
      toast.success(`${companyName} verification rejected`);
      fetchVerification();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  const updateTrustScore = async (companyId, companyName, currentScore) => {
    const newScore = prompt(`Update trust score for ${companyName}:`, currentScore);
    if (!newScore) return;

    const score = parseInt(newScore);
    if (isNaN(score) || score < 0 || score > 100) {
      return toast.error('Invalid trust score. Must be 0-100.');
    }

    try {
      await api.put(`/verification/${companyId}/trust-score`, { trustScore: score });
      toast.success('Trust score updated');
      fetchVerification();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleCompanyStatusChange = async (company, newStatus) => {
    if (!newStatus || newStatus === company.verificationStatus) return;

    // Use existing flows for verify/reject since they prompt for extra info
    if (newStatus === 'verified') {
      return verifyCompany(company._id, company.name);
    }

    if (newStatus === 'rejected') {
      return rejectVerification(company._id, company.name);
    }

    try {
      await api.put(`/verification/${company._id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchVerification();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // ─── Internship Actions ────────────────────────────────────────────────
  const deleteInternship = async (id, title) => {
    if (!window.confirm(`Delete "${title}" and all its applications?`)) return;
    try {
      await api.delete(`/internships/admin/${id}`);
      setInternships(prev => prev.filter(i => i._id !== id));
      toast.success('Internship deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleActive = async (id) => {
    try {
      const res = await api.patch(`/internships/admin/${id}/toggle-active`);
      setInternships(prev => prev.map(i => i._id === id ? res.data.internship : i));
      toast.success(res.data.message);
    } catch { toast.error('Failed'); }
  };

  const toggleFeatured = async (id) => {
    try {
      const res = await api.patch(`/internships/admin/${id}/toggle-featured`);
      setInternships(prev => prev.map(i => i._id === id ? res.data.internship : i));
      toast.success(res.data.message);
    } catch { toast.error('Failed'); }
  };

  // ─── User Actions ──────────────────────────────────────────────────────
  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/admin/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success(`User "${name}" deleted`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const changeUserRole = async (id, newRole) => {
    try {
      const res = await api.patch(`/users/admin/${id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u));
      toast.success('Role updated');
    } catch { toast.error('Failed'); }
  };

  // ─── Application Actions ───────────────────────────────────────────────
  const deleteApplication = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await api.delete(`/applications/admin/${id}`);
      setApplications(prev => prev.filter(a => a._id !== id));
      toast.success('Application deleted');
    } catch { toast.error('Failed'); }
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      await api.put(`/applications/admin/${id}/status`, { status });
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  // ─── Helper Functions ──────────────────────────────────────────────────
  const getTrustBadgeColor = (badge) => {
    const colors = {
      platinum: '#E5E4E2',
      gold: '#FFD700',
      silver: '#C0C0C0',
      bronze: '#CD7F32',
      none: '#9CA3AF'
    };
    return colors[badge] || colors.none;
  };

  const getTrustBadgeIcon = (badge) => {
    const icons = {
      platinum: <FontAwesomeIcon icon={faGem} style={{ marginRight: 8, color: '#1f2937' }} />,
      gold: <FontAwesomeIcon icon={faTrophy} style={{ marginRight: 8, color: '#1f2937' }} />,
      silver: <FontAwesomeIcon icon={faMedal} style={{ marginRight: 8, color: '#1f2937' }} />,
      bronze: <FontAwesomeIcon icon={faStar} style={{ marginRight: 8, color: '#1f2937' }} />,
      none: <FontAwesomeIcon icon={faCircle} style={{ marginRight: 8, color: '#1f2937' }} />
    };
    return icons[badge] || icons.none;
  };

  const getStatusColor = (status) => {
    const colors = {
      verified: '#10B981',
      pending: '#F59E0B',
      unverified: '#6B7280',
      rejected: '#EF4444'
    };
    return colors[status] || colors.unverified;
  };

  if (loading) return <div className="admin-loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
          <h1><FontAwesomeIcon icon={faShieldAlt} style={{ marginRight: 8, color: '#F59E0B' }} /> Admin Dashboard</h1>
        <p>Manage platform, verify companies, and view analytics</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && <FontAwesomeIcon icon={faChartPie} style={{ marginRight: 8, color: "#4F46E5" }} /> } 
              {tab === 'analytics' && <FontAwesomeIcon icon={faChartSimple} style={{ marginRight: 8, color: '#4F46E5' }} />} 
              {tab === 'verification' && <FontAwesomeIcon icon={faCheck} style={{ marginRight: 8, color: '#10B981' }} />} 
              {tab === 'internships' && <FontAwesomeIcon icon={faBriefcase} style={{ marginRight: 8, color: '#F59E0B' }} />} 
              {tab === 'users' && <FontAwesomeIcon icon={faUsers} style={{ marginRight: 8, color: '#06B6D4' }} />} 
              {tab === 'applications' && <FontAwesomeIcon icon={faFileLines} style={{ marginRight: 8, color: '#7C3AED' }} />}
            {' '}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === 'overview' && stats && (
        <div className="admin-overview">
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-icon"><FontAwesomeIcon icon={faUsers} style={{ fontSize: 20, color: '#2563EB' }} /></div>
              <div className="stat-content">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon"><FontAwesomeIcon icon={faBuilding} style={{ fontSize: 20, color: '#4B5563' }} /></div>
              <div className="stat-content">
                <h3>{stats.totalCompanies}</h3>
                <p>Companies</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon"><FontAwesomeIcon icon={faGraduationCap} style={{ fontSize: 20, color: '#06B6D4' }} /></div>
              <div className="stat-content">
                <h3>{stats.totalStudents}</h3>
                <p>Students</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon"><FontAwesomeIcon icon={faBriefcase} style={{ fontSize: 20, color: '#F59E0B' }} /></div>
              <div className="stat-content">
                <h3>{stats.totalInternships}</h3>
                <p>Total Internships</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon"><FontAwesomeIcon icon={faFileLines} style={{ fontSize: 20, color: '#7C3AED' }} /></div>
              <div className="stat-content">
                <h3>{stats.totalApplications}</h3>
                <p>Total Applications</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon"><FontAwesomeIcon icon={faCheck} style={{ fontSize: 20, color: '#10B981' }} /></div>
              <div className="stat-content">
                <h3>{stats.activeInternships}</h3>
                <p>Active Internships</p>
              </div>
            </div>
          </div>

          <div className="admin-recent-section">
            <h3>Recent Internships</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Applications</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {internships.slice(0, 10).map(internship => (
                    <tr key={internship._id}>
                      <td>{internship.title}</td>
                      <td>{internship.company}</td>
                      <td>{internship.applicationsCount || 0}</td>
                      <td>
                        <span className={`status-badge ${internship.isActive ? 'active' : 'inactive'}`}>
                          {internship.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ANALYTICS TAB ═══ */}
      {activeTab === 'analytics' && analytics && (
        <div className="admin-analytics">
          <h2><FontAwesomeIcon icon={faChartSimple} style={{ marginRight: 8, color: '#4F46E5' }} /> Advanced Analytics</h2>
          
          {/* Key Metrics */}
          <div className="analytics-metrics-grid">
            <div className="metric-card">
              <h4>Verification Rate</h4>
              <div className="metric-value">{analytics.verification.verificationRate}%</div>
              <p className="metric-label">
                {analytics.verification.verified} of {analytics.overview.totalCompanies} verified
              </p>
            </div>
            <div className="metric-card">
              <h4>Avg Trust Score</h4>
              <div className="metric-value">{analytics.companyStats.avgTrustScore.toFixed(1)}</div>
              <p className="metric-label">Out of 100</p>
            </div>
            <div className="metric-card">
              <h4>New Users (30d)</h4>
              <div className="metric-value">{analytics.growth.newUsers30d}</div>
              <p className="metric-label">
                {analytics.growth.newStudents30d} students, {analytics.growth.newCompanies30d} companies
              </p>
            </div>
            <div className="metric-card">
              <h4>Pending Verification</h4>
              <div className="metric-value">{analytics.verification.pending}</div>
              <p className="metric-label">Companies awaiting review</p>
            </div>
          </div>

          {/* Trust Badge Distribution */}
          <div className="chart-section">
            <h3>Trust Badge Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.trustBadges || {}).map(([badge, count]) => ({
                    name: badge.charAt(0).toUpperCase() + badge.slice(1),
                    value: count
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(analytics.trustBadges || {}).map((badge, index) => (
                    <Cell key={`cell-${index}`} fill={getTrustBadgeColor(badge)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Application Status Distribution */}
          <div className="chart-section">
            <h3>Application Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(analytics.applicationsByStatus || {}).map(([status, count]) => ({
                status: status.charAt(0).toUpperCase() + status.slice(1),
                count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Companies */}
          <div className="top-companies-section">
            <h3>Top Companies by Applications</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Company</th>
                    <th>Trust Badge</th>
                    <th>Internships</th>
                    <th>Applications</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topCompanies.map((company, index) => (
                    <tr key={company._id}>
                      <td><strong>#{index + 1}</strong></td>
                      <td>{company.companyName}</td>
                      <td>
                        <span className="trust-badge" style={{ background: getTrustBadgeColor(company.trustBadge) }}>
                          {getTrustBadgeIcon(company.trustBadge)} {company.trustBadge}
                        </span>
                      </td>
                      <td>{company.internshipsCount}</td>
                      <td>{company.totalApplications}</td>
                      <td>
                        <span className="verification-badge" style={{ background: getStatusColor(company.verificationStatus) }}>
                          {company.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Industry Distribution */}
          <div className="chart-section">
            <h3>Companies by Industry</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.companyStats.byIndustry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══ VERIFICATION TAB ═══ */}
      {activeTab === 'verification' && (
        <div className="admin-verification">
          <div className="verification-header">
            <h2><FontAwesomeIcon icon={faCheck} style={{ marginRight: 8, color: '#10B981' }} /> Company Verification</h2>
            <div className="verification-filters">
              <select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="verification-stats">
            <div className="verification-stat pending">
              <h4>Pending</h4>
              <div className="stat-number">{verification.companies.filter(c => c.verificationStatus === 'pending').length}</div>
            </div>
            <div className="verification-stat verified">
              <h4>Verified</h4>
              <div className="stat-number">{verification.companies.filter(c => c.verificationStatus === 'verified').length}</div>
            </div>
            <div className="verification-stat unverified">
              <h4>Unverified</h4>
              <div className="stat-number">{verification.companies.filter(c => c.verificationStatus === 'unverified').length}</div>
            </div>
            <div className="verification-stat rejected">
              <h4>Rejected</h4>
              <div className="stat-number">{verification.companies.filter(c => c.verificationStatus === 'rejected').length}</div>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Trust Score</th>
                  <th>Badge</th>
                  <th>Internships</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {verification.companies.map(company => (
                  <tr key={company._id}>
                    <td>
                      <strong>{company.name}</strong>
                      {company.industry && <div className="company-industry">{company.industry}</div>}
                    </td>
                    <td>{company.email}</td>
                    <td>
                      {company.verificationStatus === 'verified' && (
                        <div className="trust-score-bar">
                          <div className="trust-score-fill" style={{ width: `${company.trustScore}%` }}></div>
                          <span className="trust-score-text">{company.trustScore}/100</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {company.verificationStatus === 'verified' && (
                        <span className="trust-badge" style={{ background: getTrustBadgeColor(company.trustBadge) }}>
                          {getTrustBadgeIcon(company.trustBadge)} {company.trustBadge}
                        </span>
                      )}
                    </td>
                    <td>{company.internshipCount || 0}</td>
                    <td>{company.applicationCount || 0}</td>
                    <td>
                      <select
                        value={company.verificationStatus}
                        onChange={(e) => handleCompanyStatusChange(company, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {company.verificationStatus === 'pending' && (
                          <>
                            <button className="btn-action verify" onClick={() => verifyCompany(company._id, company.name)} title="Verify Company">
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                            <button className="btn-action reject" onClick={() => rejectVerification(company._id, company.name)} title="Reject">
                              <FontAwesomeIcon icon={faXmark} />
                            </button>
                          </>
                        )}
                        {company.verificationStatus === 'verified' && (
                          <button className="btn-action edit" onClick={() => updateTrustScore(company._id, company.name, company.trustScore)} title="Update Trust Score">
                            <FontAwesomeIcon icon={faChartSimple} />
                          </button>
                        )}
                        {company.verificationStatus === 'unverified' && (
                          <button className="btn-action verify" onClick={() => verifyCompany(company._id, company.name)} title="Verify Company">
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ INTERNSHIPS TAB ═══ (Keep existing) */}
      {activeTab === 'internships' && (
        <div className="admin-internships">
          <div className="admin-section-header">
            <h2>💼 Manage Internships</h2>
            <input
              type="text"
              placeholder="Search internships..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-search"
            />
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {internships.map(internship => (
                  <tr key={internship._id}>
                    <td><strong>{internship.title}</strong></td>
                    <td>{internship.company}</td>
                    <td>{internship.location}</td>
                    <td>{internship.applicationsCount || 0}</td>
                    <td>
                      <button
                        className={`status-toggle ${internship.isActive ? 'active' : 'inactive'}`}
                        onClick={() => toggleActive(internship._id)}
                      >
                        {internship.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`featured-toggle ${internship.isFeatured ? 'featured' : ''}`}
                        onClick={() => toggleFeatured(internship._id)}
                      >
                        <FontAwesomeIcon icon={faStar} style={{ color: internship.isFeatured ? '#FCD34D' : '#9CA3AF' }} />
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => deleteInternship(internship._id, internship.title)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ USERS TAB ═══ (Keep existing) */}
      {activeTab === 'users' && (
        <div className="admin-users">
          <div className="admin-section-header">
            <h2><FontAwesomeIcon icon={faUsers} style={{ marginRight: 8, color: '#06B6D4' }} /> Manage Users</h2>
            <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="admin-filter">
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="company">Companies</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user._id, e.target.value)}
                        className="role-select"
                      >
                        <option value="student">Student</option>
                        <option value="company">Company</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      <button className="btn-delete" onClick={() => deleteUser(user._id, user.name)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ APPLICATIONS TAB ═══ (Keep existing) */}
      {activeTab === 'applications' && (
        <div className="admin-applications">
          <h2><FontAwesomeIcon icon={faFileLines} style={{ marginRight: 8, color: '#7C3AED' }} /> Manage Applications</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Internship</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id}>
                    <td>{app.studentId?.name || 'Unknown'}</td>
                    <td>{app.internshipId?.title || 'Unknown'}</td>
                    <td>{format(new Date(app.appliedAt), 'MMM d, yyyy')}</td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn-delete" onClick={() => deleteApplication(app._id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
