import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const TABS = ['overview', 'internships', 'users', 'applications'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [internships, setInternships] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  useEffect(() => { fetchAll(); }, []);
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

  // ─── Internship actions ────────────────────────────────────────────────
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

  // ─── User actions ──────────────────────────────────────────────────────
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

  const changeRole = async (id, newRole) => {
    try {
      const res = await api.patch(`/users/admin/${id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u));
      toast.success(`Role changed to ${newRole}`);
    } catch { toast.error('Failed to change role'); }
  };

  // ─── Application actions ───────────────────────────────────────────────
  const deleteApplication = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await api.delete(`/applications/admin/${id}`);
      setApplications(prev => prev.filter(a => a._id !== id));
      toast.success('Application deleted');
    } catch { toast.error('Failed'); }
  };

  const updateAppStatus = async (id, status) => {
    try {
      await api.put(`/applications/admin/${id}/status`, { status });
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const statCards = stats ? [
    { label: 'Total Internships', value: stats.totalInternships, icon: <i className="fa-solid fa-clipboard-list" aria-hidden></i>, color: 'primary' },
    { label: 'Active Internships', value: stats.activeInternships, icon: <i className="fa-solid fa-circle-check" aria-hidden></i>, color: 'success' },
    { label: 'Featured', value: stats.featuredInternships, icon: <i className="fa-solid fa-star" aria-hidden></i>, color: 'warning' },
    { label: 'Total Applications', value: stats.totalApplications, icon: <i className="fa-solid fa-envelope" aria-hidden></i>, color: 'accent' },
    { label: 'Total Users', value: users.length, icon: <i className="fa-solid fa-users" aria-hidden></i>, color: 'primary' },
    { label: 'Students', value: users.filter(u => u.role === 'student').length, icon: <i className="fa-solid fa-user-graduate" aria-hidden></i>, color: 'success' },
    { label: 'Companies', value: users.filter(u => u.role === 'company').length, icon: <i className="fa-solid fa-building" aria-hidden></i>, color: 'accent' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: <i className="fa-solid fa-shield" aria-hidden></i>, color: 'warning' },
  ] : [];

  const STATUS_OPTS = ['pending', 'reviewed', 'shortlisted', 'interview', 'selected', 'rejected'];
  const STATUS_COLORS = { pending: 'warning', reviewed: 'accent', shortlisted: 'primary', interview: 'secondary', selected: 'success', rejected: 'error' };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="container">
              <div className="admin-header-inner">
            <div>
              <h1><i className="fa-solid fa-shield" aria-hidden></i> Admin Dashboard</h1>
              <p>Full platform control — manage internships, users & applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container admin-content">
        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
              {tab === 'overview' ? <><i className="fa-solid fa-chart-simple" aria-hidden></i> Overview</> :
               tab === 'internships' ? <><i className="fa-solid fa-clipboard-list" aria-hidden></i> Internships ({internships.length})</> :
               tab === 'users' ? <><i className="fa-solid fa-users" aria-hidden></i> Users ({users.length})</> :
               <><i className="fa-solid fa-envelope" aria-hidden></i> Applications ({applications.length})</>}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            <div className="admin-stats-grid">
              {statCards.map((s, i) => (
                <div key={i} className={`admin-stat-card stat-${s.color}`}>
                  <span>{s.icon}</span>
                  <div><strong>{s.value}</strong><small>{s.label}</small></div>
                </div>
              ))}
            </div>

            {stats?.categoryBreakdown?.length > 0 && (
              <div className="admin-section">
                <h3>Internships by Category</h3>
                <div className="category-breakdown">
                  {stats.categoryBreakdown.map((cat, i) => (
                    <div key={i} className="cat-row">
                      <span className="cat-name">{cat._id}</span>
                      <div className="cat-bar-wrap">
                        <div className="cat-bar" style={{ width: `${(cat.count / stats.totalInternships) * 100}%` }}></div>
                      </div>
                      <span className="cat-count">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-recent-grid">
              <div className="admin-section">
                <h3>Recent Internships</h3>
                {internships.slice(0, 5).map((intern, i) => (
                  <div key={i} className="admin-recent-row">
                    <div>
                      <strong>{intern.title}</strong>
                      <small>{intern.company} • {intern.location}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge badge-${intern.isActive ? 'success' : 'gray'}`}>{intern.isActive ? <><i className="fa-solid fa-circle-check" aria-hidden></i> Active</> : <><i className="fa-solid fa-circle" aria-hidden></i> Inactive</>}</span>
                      <button className="admin-danger-btn" onClick={() => deleteInternship(intern._id, intern.title)}><i className="fa-solid fa-trash" aria-hidden></i></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="admin-section">
                <h3>Recent Users</h3>
                {users.slice(0, 5).map((u, i) => (
                  <div key={i} className="admin-recent-row">
                    <div>
                      <strong>{u.name}</strong>
                      <small>{u.email}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge badge-${u.role === 'admin' ? 'warning' : u.role === 'company' ? 'primary' : 'success'}`}>{u.role === 'admin' ? <i className="fa-solid fa-shield" aria-hidden></i> : u.role === 'company' ? <i className="fa-solid fa-building" aria-hidden></i> : <i className="fa-solid fa-user-graduate" aria-hidden></i>} {u.role}</span>
                      <button className="admin-danger-btn" onClick={() => deleteUser(u._id, u.name)}><i className="fa-solid fa-trash" aria-hidden></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── INTERNSHIPS ── */}
        {activeTab === 'internships' && (
          <div>
            <div className="admin-toolbar">
              <input
                className="admin-search"
                type="text"
                placeholder="Search internships..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="admin-count">{internships.length} internships</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title & Company</th>
                    <th>Location / Type</th>
                    <th>Stipend</th>
                    <th>Deadline</th>
                    <th>Apps</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {internships.map((intern, i) => (
                    <tr key={i} className={!intern.isActive ? 'inactive-row' : ''}>
                      <td>
                        <div className="td-primary">{intern.title}</div>
                        <div className="td-secondary">{intern.company}</div>
                      </td>
                      <td>
                        <div className="td-primary">{intern.location}</div>
                        <span className="badge badge-gray">{intern.type}</span>
                      </td>
                      <td>₹{intern.stipend?.amount?.toLocaleString('en-IN') || 0}/mo</td>
                      <td style={{ fontSize: '13px' }}>{format(new Date(intern.applicationDeadline), 'MMM dd, yyyy')}</td>
                      <td><strong>{intern.applicationsCount || 0}</strong></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`badge badge-${intern.isActive ? 'success' : 'gray'}`}>
                            {intern.isActive ? '🟢 Active' : '⚫ Inactive'}
                          </span>
                          {intern.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
                        </div>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className={`admin-action-btn ${intern.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => toggleActive(intern._id)}
                            title={intern.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {intern.isActive ? <i className="fa-solid fa-toggle-on" aria-hidden></i> : <i className="fa-solid fa-toggle-off" aria-hidden></i>}
                          </button>
                          <button
                            className={`admin-action-btn ${intern.isFeatured ? 'unfeature' : 'feature'}`}
                            onClick={() => toggleFeatured(intern._id)}
                            title={intern.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                          >
                            <i className="fa-solid fa-star" aria-hidden></i>
                          </button>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => deleteInternship(intern._id, intern.title)}
                            title="Delete Internship"
                          >
                            <i className="fa-solid fa-trash" aria-hidden></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div>
            <div className="admin-toolbar">
              <div className="role-filter-btns">
                {['', 'student', 'company', 'admin'].map(role => (
                  <button
                    key={role}
                    className={`role-filter-btn ${userRoleFilter === role ? 'active' : ''}`}
                    onClick={() => setUserRoleFilter(role)}
                  >
                    {role === '' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                    {role === '' && ` (${users.length})`}
                    {role === 'student' && ` (${users.filter(u=>u.role==='student').length})`}
                    {role === 'company' && ` (${users.filter(u=>u.role==='company').length})`}
                    {role === 'admin' && ` (${users.filter(u=>u.role==='admin').length})`}
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Change Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i}>
                      <td>
                        <div className="user-cell">
                          <div className="user-initials">{u.name?.charAt(0)}</div>
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--gray)' }}>{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.role === 'admin' ? 'warning' : u.role === 'company' ? 'primary' : 'success'}`}>
                          {u.role === 'admin' ? '🛡️' : u.role === 'company' ? '🏢' : '👨‍🎓'} {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{format(new Date(u.createdAt), 'MMM dd, yyyy')}</td>
                      <td>
                        <select
                          className="role-select"
                          value={u.role}
                          onChange={e => changeRole(u._id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="company">Company</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => deleteUser(u._id, u.name)}
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── APPLICATIONS ── */}
        {activeTab === 'applications' && (
          <div>
            <div className="admin-toolbar">
              <span className="admin-count">{applications.length} total applications</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Internship</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Change Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => (
                    <tr key={i}>
                      <td>
                        <div className="td-primary">{app.studentId?.name || 'Unknown'}</div>
                        <div className="td-secondary">{app.studentId?.email}</div>
                      </td>
                      <td>
                        <div className="td-primary">{app.internshipId?.title || 'N/A'}</div>
                        <div className="td-secondary">{app.internshipId?.company}</div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{format(new Date(app.appliedAt), 'MMM dd, yyyy')}</td>
                      <td>
                        <span className={`badge badge-${STATUS_COLORS[app.status] || 'gray'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="role-select"
                          value={app.status}
                          onChange={e => updateAppStatus(app._id, e.target.value)}
                        >
                          {STATUS_OPTS.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => deleteApplication(app._id)}
                          title="Delete Application"
                        >
                          🗑️
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
    </div>
  );
};

export default AdminDashboard;
