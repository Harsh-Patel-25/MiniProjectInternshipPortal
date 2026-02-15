import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationAPI, userAPI } from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import InternshipCard from '../components/InternshipCard';

const STATUS_CONFIG = {
  pending: { color: 'warning', label: 'Pending Review', icon: '⏳' },
  reviewed: { color: 'accent', label: 'Reviewed', icon: '👀' },
  shortlisted: { color: 'primary', label: 'Shortlisted!', icon: '⭐' },
  interview: { color: 'secondary', label: 'Interview Scheduled', icon: '📞' },
  selected: { color: 'success', label: 'Selected! 🎉', icon: '✅' },
  rejected: { color: 'error', label: 'Not Selected', icon: '❌' }
};

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await applicationAPI.getMy();
      setApplications(res.data.applications || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await applicationAPI.withdraw(id);
      setApplications(prev => prev.filter(a => a._id !== id));
      toast.success('Application withdrawn');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot withdraw');
    }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-header">
        <div className="container">
          <h1>My Applications</h1>
          <p>Track all your internship applications in one place</p>
        </div>
      </div>
      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[['all', 'All', applications.length], ['pending', '⏳ Pending'], ['shortlisted', '⭐ Shortlisted'], ['interview', '📞 Interview'], ['selected', '✅ Selected'], ['rejected', '❌ Rejected']].map(([val, label, count]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                padding: '8px 16px', borderRadius: '50px', border: '1.5px solid',
                borderColor: filter === val ? 'var(--primary)' : 'var(--border)',
                background: filter === val ? 'var(--primary)' : 'white',
                color: filter === val ? 'white' : 'var(--dark-3)',
                fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
              }}
            >
              {label} {count !== undefined && `(${count})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>{filter === 'all' ? 'No applications yet' : `No ${filter} applications`}</h3>
            <p>Start applying to internships to track them here</p>
            <Link to="/internships" className="btn btn-primary">Browse Internships</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((app, i) => {
              const intern = app.internshipId;
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
              return (
                <div key={i} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary-light), #DDD6FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '22px', color: 'var(--primary)', fontFamily: 'Sora, sans-serif', flexShrink: 0 }}>
                    {intern?.company?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ fontSize: '17px', marginBottom: '4px' }}>{intern?.title || 'Internship'}</h3>
                    <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '8px' }}>🏢 {intern?.company} &nbsp;•&nbsp; 📍 {intern?.location} &nbsp;•&nbsp; 💰 {intern?.stipend?.amount ? `₹${intern.stipend.amount.toLocaleString('en-IN')}/mo` : 'Unpaid'}</p>
                    <p style={{ fontSize: '13px', color: 'var(--gray)' }}>Applied on {format(new Date(app.appliedAt), 'MMMM dd, yyyy')}</p>
                    {app.feedback && <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--dark-3)', fontStyle: 'italic', background: 'var(--bg)', padding: '8px 12px', borderRadius: '8px' }}>💬 {app.feedback}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span className={`badge badge-${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {intern?._id && <Link to={`/internships/${intern._id}`} className="btn btn-outline btn-sm">View Internship</Link>}
                      {app.status === 'pending' && <button onClick={() => handleWithdraw(app._id)} className="btn btn-sm" style={{ background: '#FEF2F2', color: 'var(--error)', border: '1px solid #FECACA' }}>Withdraw</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const SavedInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { fetchSaved(); }, []);

  const fetchSaved = async () => {
    try {
      const res = await userAPI.getSaved();
      setInternships(res.data.internships || []);
      setSavedIds(res.data.internships?.map(i => i._id) || []);
    } catch {
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (id) => {
    try {
      await userAPI.saveInternship(id);
      setInternships(prev => prev.filter(i => i._id !== id));
      setSavedIds(prev => prev.filter(sid => sid !== id));
      toast.success('Removed from saved');
    } catch {}
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-header">
        <div className="container">
          <h1>Saved Internships</h1>
          <p>{internships.length} internships saved</p>
        </div>
      </div>
      <div className="container" style={{ padding: '32px 24px' }}>
        {internships.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔖</div>
            <h3>No saved internships</h3>
            <p>Browse and save internships you're interested in applying for</p>
            <Link to="/internships" className="btn btn-primary">Browse Internships</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {internships.map(intern => (
              <InternshipCard
                key={intern._id}
                internship={intern}
                showSave={true}
                onSave={handleUnsave}
                isSaved={savedIds.includes(intern._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
