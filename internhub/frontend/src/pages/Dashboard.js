import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI, internshipAPI, userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import './Dashboard.css';

const STATUS_CONFIG = {
  pending: { color: 'warning', label: 'Pending', icon: <i className="fa-solid fa-hourglass-half" aria-hidden></i> },
  reviewed: { color: 'accent', label: 'Reviewed', icon: <i className="fa-solid fa-eye" aria-hidden></i> },
  shortlisted: { color: 'primary', label: 'Shortlisted', icon: <i className="fa-solid fa-star" aria-hidden></i> },
  interview: { color: 'secondary', label: 'Interview', icon: <i className="fa-solid fa-phone" aria-hidden></i> },
  selected: { color: 'success', label: 'Selected', icon: <i className="fa-solid fa-check" aria-hidden></i> },
  rejected: { color: 'error', label: 'Rejected', icon: <i className="fa-solid fa-xmark" aria-hidden></i> }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedInternships, setSavedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, savedRes] = await Promise.all([
        applicationAPI.getMy(),
        userAPI.getSaved()
      ]);
      setApplications(appsRes.data.applications || []);
      setSavedInternships(savedRes.data.internships || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: <i className="fa-solid fa-clipboard-list" aria-hidden></i>, color: 'primary' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted' || a.status === 'interview' || a.status === 'selected').length, icon: <i className="fa-solid fa-star" aria-hidden></i>, color: 'warning' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'interview').length, icon: <i className="fa-solid fa-phone" aria-hidden></i>, color: 'accent' },
    { label: 'Offers', value: applications.filter(a => a.status === 'selected').length, icon: <i className="fa-solid fa-check" aria-hidden></i>, color: 'success' },
  ];

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-welcome">
            <div className="welcome-avatar">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
              <p>Here's an overview of your internship journey</p>
            </div>
          </div>
          <Link to="/internships" className="btn btn-primary">Find Internships →</Link>
        </div>
      </div>

      <div className="container dashboard-content">
        {/* Stats */}
        <div className="stats-cards">
          {stats.map((stat, i) => (
            <div key={i} className={`stat-card stat-${stat.color}`}>
              <span className="stat-icon">{stat.icon}</span>
              <div>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          {['overview', 'applications', 'saved'].map(tab => (
            <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
              {tab === 'overview' ? <><i className="fa-solid fa-chart-simple" aria-hidden></i> Overview</> : tab === 'applications' ? <><i className="fa-solid fa-clipboard-list" aria-hidden></i> Applications</> : <><i className="fa-regular fa-bookmark" aria-hidden></i> Saved</>}
              {tab === 'applications' && applications.length > 0 && <span className="tab-count">{applications.length}</span>}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Application Status</h3>
              {applications.length === 0 ? (
                <div className="empty-small">
                  <p>No applications yet. Start applying!</p>
                  <Link to="/internships" className="btn btn-primary btn-sm">Browse Internships</Link>
                </div>
              ) : (
                <div className="status-breakdown">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const count = applications.filter(a => a.status === status).length;
                    return count > 0 ? (
                      <div key={status} className="status-row">
                        <span className="status-icon">{config.icon} {config.label}</span>
                        <div className="status-bar-wrap">
                          <div className="status-bar" style={{ width: `${(count / applications.length) * 100}%`, background: `var(--${config.color})` }}></div>
                        </div>
                        <strong>{count}</strong>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="overview-card">
              <h3>Recent Applications</h3>
                  {applications.slice(0, 4).map((app, i) => (
                <div key={i} className="recent-app">
                  <div className="recent-app-logo">{app.internshipId?.company?.charAt(0)}</div>
                  <div className="recent-app-info">
                    <strong>{app.internshipId?.title || 'Internship'}</strong>
                    <small>{app.internshipId?.company} • {format(new Date(app.appliedAt), 'MMM dd')}</small>
                  </div>
                  <span className={`badge badge-${STATUS_CONFIG[app.status]?.color || 'gray'}`}>
                    {STATUS_CONFIG[app.status]?.icon} {STATUS_CONFIG[app.status]?.label}
                  </span>
                </div>
              ))}
              {applications.length === 0 && <p className="empty-small-text">No applications yet</p>}
            </div>

            <div className="overview-card profile-completeness-card">
              <h3>Profile Completeness</h3>
              <div className="profile-progress-wrap">
                {[
                  { label: 'Basic Info', done: !!(user?.name && user?.email) },
                  { label: 'Bio Added', done: !!user?.bio },
                  { label: 'Skills Listed', done: user?.skills?.length > 0 },
                  { label: 'Education', done: user?.education?.length > 0 },
                  { label: 'Experience', done: user?.experience?.length > 0 },
                  { label: 'Resume', done: !!user?.resume },
                ].map((item, i) => (
                  <div key={i} className="profile-item">
                    <span className={item.done ? 'done' : 'pending'}>{item.done ? <i className="fa-solid fa-check" aria-hidden></i> : <i className="fa-regular fa-circle" aria-hidden></i>}</span>
                    <span>{item.label}</span>
                    {!item.done && <Link to="/profile" className="add-link">Add <i className="fa-solid fa-arrow-right" aria-hidden></i></Link>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="icon"><i className="fa-solid fa-clipboard-list" aria-hidden></i></div>
                <h3>No applications yet</h3>
                <p>Start applying to internships and track them here</p>
                <Link to="/internships" className="btn btn-primary">Browse Internships</Link>
              </div>
            ) : (
              <div className="applications-table">
                {applications.map((app, i) => (
                  <div key={i} className="application-row">
                    <div className="app-company-logo">{app.internshipId?.company?.charAt(0)}</div>
                    <div className="app-info">
                      <strong>{app.internshipId?.title || 'Internship'}</strong>
                        <div className="app-meta">
                        <span><i className="fa-solid fa-building" aria-hidden></i> {app.internshipId?.company}</span>
                        <span><i className="fa-solid fa-location-dot" aria-hidden></i> {app.internshipId?.location}</span>
                        <span><i className="fa-solid fa-indian-rupee-sign" aria-hidden></i> {app.internshipId?.stipend?.amount ? `₹${app.internshipId.stipend.amount.toLocaleString('en-IN')}/mo` : 'Unpaid'}</span>
                      </div>
                    </div>
                    <div className="app-timeline">
                      <small>Applied</small>
                      <span>{format(new Date(app.appliedAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <div>
                      <span className={`badge badge-${STATUS_CONFIG[app.status]?.color || 'gray'}`}>
                        {STATUS_CONFIG[app.status]?.icon} {STATUS_CONFIG[app.status]?.label}
                      </span>
                      {app.feedback && <p className="app-feedback">{app.feedback}</p>}
                    </div>
                    {app.internshipId?._id && (
                      <Link to={`/internships/${app.internshipId._id}`} className="btn btn-outline btn-sm">View</Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div>
            {savedInternships.length === 0 ? (
              <div className="empty-state">
                <div className="icon"><i className="fa-regular fa-bookmark" aria-hidden></i></div>
                <h3>No saved internships</h3>
                <p>Bookmark internships you're interested in</p>
                <Link to="/internships" className="btn btn-primary">Browse Internships</Link>
              </div>
            ) : (
              <div className="saved-grid">
                {savedInternships.map((intern, i) => (
                  <div key={i} className="saved-item">
                    <div className="saved-logo">{intern.company?.charAt(0)}</div>
                    <div className="saved-info">
                      <strong>{intern.title}</strong>
                      <span>{intern.company} • {intern.location}</span>
                      <span className="saved-stipend">₹{intern.stipend?.amount?.toLocaleString('en-IN')}/mo • {intern.duration}</span>
                    </div>
                    <Link to={`/internships/${intern._id}`} className="btn btn-primary btn-sm">Apply</Link>
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

export default Dashboard;
