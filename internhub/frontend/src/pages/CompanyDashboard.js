import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { internshipAPI, applicationAPI, companyAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './Dashboard.css';
import './CompanyDashboard.css';

const STATUS_CONFIG = {
  pending: { color: 'warning', label: 'Pending', icon: <i className="fa-solid fa-hourglass-half" aria-hidden></i> },
  reviewed: { color: 'accent', label: 'Reviewed', icon: <i className="fa-solid fa-eye" aria-hidden></i> },
  shortlisted: { color: 'primary', label: 'Shortlisted', icon: <i className="fa-solid fa-star" aria-hidden></i> },
  interview: { color: 'secondary', label: 'Interview', icon: <i className="fa-solid fa-phone" aria-hidden></i> },
  selected: { color: 'success', label: 'Selected', icon: <i className="fa-solid fa-check" aria-hidden></i> },
  rejected: { color: 'error', label: 'Rejected', icon: <i className="fa-solid fa-xmark" aria-hidden></i> }
};

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [stats, setStats] = useState({ totalInternships: 0, activeInternships: 0, totalApplications: 0, pendingApplications: 0, shortlisted: 0, selected: 0 });
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('internships');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [dashRes, myRes] = await Promise.all([
        companyAPI.getDashboard(),
        internshipAPI.getMine()
      ]);
      setStats(dashRes.data.stats);
      setInternships(myRes.data.internships || []);
    } catch {
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (internshipId) => {
    setLoadingApps(true);
    setSelectedInternship(internshipId);
    setActiveTab('applications');
    try {
      const res = await applicationAPI.getForInternship(internshipId);
      setApplications(res.data.applications || []);
    } catch { setApplications([]); }
    finally { setLoadingApps(false); }
  };

  const updateStatus = async (appId, status) => {
    try {
      await applicationAPI.updateStatus(appId, { status });
      setApplications(prev => prev.map(app => app._id === appId ? { ...app, status } : app));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const deleteInternship = async (id) => {
    if (!window.confirm('Delete this internship?')) return;
    try {
      await internshipAPI.delete(id);
      setInternships(prev => prev.filter(i => i._id !== id));
      toast.success('Internship deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const statCards = [
    { label: 'Total Internships', value: stats.totalInternships, icon: <i className="fa-solid fa-clipboard-list" aria-hidden></i>, color: 'primary' },
    { label: 'Active', value: stats.activeInternships, icon: <i className="fa-solid fa-circle-check" aria-hidden></i>, color: 'success' },
    { label: 'Total Applications', value: stats.totalApplications, icon: <i className="fa-solid fa-envelope" aria-hidden></i>, color: 'warning' },
    { label: 'Candidates Selected', value: stats.selected, icon: <i className="fa-solid fa-trophy" aria-hidden></i>, color: 'accent' },
  ];

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-welcome">
            <div className="welcome-avatar"><i className="fa-solid fa-building" aria-hidden></i></div>
            <div>
              <h1>Company Dashboard</h1>
              <p>{user?.name}</p>
            </div>
          </div>
          <Link to="/company/post-internship" className="btn btn-primary">+ Post New Internship</Link>
        </div>
      </div>

      <div className="container dashboard-content">
        <div className="stats-cards">
          {statCards.map((stat, i) => (
            <div key={i} className={`stat-card stat-${stat.color}`}>
              <span className="stat-icon">{stat.icon}</span>
              <div><strong>{stat.value}</strong><span>{stat.label}</span></div>
            </div>
          ))}
        </div>

        <div className="dashboard-tabs">
          <button className={activeTab === 'internships' ? 'active' : ''} onClick={() => setActiveTab('internships')}><i className="fa-solid fa-clipboard-list" aria-hidden></i> My Internships <span className="tab-count">{internships.length}</span></button>
          {selectedInternship && <button className={activeTab === 'applications' ? 'active' : ''} onClick={() => setActiveTab('applications')}><i className="fa-solid fa-envelope" aria-hidden></i> Applications <span className="tab-count">{applications.length}</span></button>}
        </div>

        {activeTab === 'internships' && (
          internships.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><i className="fa-solid fa-clipboard-list" aria-hidden></i></div>
              <h3>No internships posted yet</h3>
              <p>Start posting internships to receive applications</p>
              <Link to="/company/post-internship" className="btn btn-primary">Post Internship</Link>
            </div>
          ) : (
            <div className="company-internships-list">
              {internships.map((intern, i) => (
                <div key={i} className="company-internship-row">
                  <div className="ci-info">
                    <h3>{intern.title}</h3>
                    <div className="ci-meta">
                      <span className={`badge badge-${intern.isActive ? 'success' : 'gray'}`}>{intern.isActive ? <><i className="fa-solid fa-circle-check" aria-hidden></i> Active</> : <><i className="fa-solid fa-circle" aria-hidden></i> Inactive</>}</span>
                      <span><i className="fa-solid fa-location-dot" aria-hidden></i> {intern.location}</span>
                      <span><i className="fa-solid fa-indian-rupee-sign" aria-hidden></i> ₹{intern.stipend?.amount?.toLocaleString('en-IN')}/mo</span>
                      <span><i className="fa-solid fa-hourglass-half" aria-hidden></i> {intern.duration}</span>
                      <span><i className="fa-solid fa-calendar-days" aria-hidden></i> Closes: {format(new Date(intern.applicationDeadline), 'MMM dd')}</span>
                    </div>
                  </div>
                  <div className="ci-stats">
                    <div className="ci-stat">
                      <strong>{intern.applicationsCount || 0}</strong>
                      <small>Applications</small>
                    </div>
                    <div className="ci-stat">
                      <strong>{intern.views || 0}</strong>
                      <small>Views</small>
                    </div>
                  </div>
                  <div className="ci-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => fetchApplications(intern._id)}>
                      View Applications
                    </button>
                    <Link to={`/internships/${intern._id}`} className="btn btn-outline btn-sm">View</Link>
                    <button className="btn btn-sm danger-btn" onClick={() => deleteInternship(intern._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'applications' && (
          <div>
            {loadingApps ? (
              <div style={{textAlign:'center',padding:'40px'}}><div className="spinner" style={{margin:'0 auto'}}></div></div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📨</div>
                <h3>No applications yet</h3>
                <p>Applications for this internship will appear here</p>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((app, i) => (
                  <div key={i} className="applicant-card">
                    <div className="applicant-avatar">{app.studentId?.name?.charAt(0)}</div>
                    <div className="applicant-info">
                      <h3>{app.studentId?.name}</h3>
                      <p>{app.studentId?.email}</p>
                      {app.studentId?.skills?.length > 0 && (
                        <div className="applicant-skills">
                          {app.studentId.skills.slice(0, 4).map((s, j) => <span key={j} className="skill-tag-sm">{s}</span>)}
                        </div>
                      )}
                      {app.coverLetter && <p className="cover-letter-preview">"{app.coverLetter.substring(0, 120)}..."</p>}
                    </div>
                    <div className="applicant-meta">
                      <span>{format(new Date(app.appliedAt), 'MMM dd, yyyy')}</span>
                      {app.resume && <a href={app.resume} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><i className="fa-solid fa-file-lines" aria-hidden></i> Resume</a>}
                    </div>
                    <div className="applicant-status">
                      <select
                        className="status-select"
                        value={app.status}
                        onChange={e => updateStatus(app._id, e.target.value)}
                      >
                        {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.label}</option>
                        ))}
                      </select>
                      <span className={`badge badge-${STATUS_CONFIG[app.status]?.color || 'gray'}`}>
                        {STATUS_CONFIG[app.status]?.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
