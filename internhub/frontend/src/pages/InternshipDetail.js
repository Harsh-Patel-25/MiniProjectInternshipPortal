import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { internshipAPI, applicationAPI, userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './InternshipDetail.css';

const mockInternship = {
  _id: '1', title: 'Frontend Developer Intern', company: 'TechCorp India', location: 'Bangalore, Karnataka',
  type: 'hybrid', category: 'technology',
  description: `We are looking for a passionate Frontend Developer Intern to join our dynamic team. You will work on real-world projects, collaborate with senior engineers, and gain hands-on experience with modern web technologies.\n\nThis is an excellent opportunity to kickstart your career in the tech industry with a company that values innovation and growth.`,
  responsibilities: ['Develop responsive user interfaces using React.js', 'Collaborate with the design team to implement UI mockups', 'Write clean, maintainable code following best practices', 'Participate in code reviews and team meetings', 'Debug and fix frontend issues'],
  requirements: ['Currently pursuing or recently completed B.Tech/MCA in Computer Science', 'Basic knowledge of HTML, CSS, JavaScript', 'Familiarity with React.js is a plus', 'Good problem-solving skills', 'Strong communication skills'],
  skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
  perks: ['Certificate of completion', 'Letter of recommendation', 'Pre-placement offer for exceptional performers', 'Flexible working hours', 'Mentorship from senior engineers'],
  stipend: { amount: 15000, currency: 'INR', type: 'paid' },
  duration: '3 months', openings: 3,
  applicationDeadline: new Date(Date.now() + 30 * 864e5),
  startDate: new Date(Date.now() + 45 * 864e5),
  isFeatured: true, applicationsCount: 45, views: 342,
  createdAt: new Date(Date.now() - 5 * 864e5)
};

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState('');

  const isStudent = user?.role === 'student';

  useEffect(() => {
    fetchInternship();
    if (user?.role === 'student') checkApplicationStatus();
  }, [id, user]);

  const fetchInternship = async () => {
    try {
      const res = await internshipAPI.getById(id);
      setInternship(res.data.internship);
    } catch {
      setInternship({ ...mockInternship, _id: id });
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const res = await applicationAPI.getMy();
      const myApps = res.data.applications || [];
      setApplied(myApps.some(app =>
        app.internshipId?._id === id || app.internshipId === id
      ));
    } catch {}
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!isStudent) {
      toast.error('Only students can apply for internships');
      return;
    }
    setApplying(true);
    try {
      await applicationAPI.apply({ internshipId: id, coverLetter, resume: resume || user?.resume });
      setApplied(true);
      setShowApplyModal(false);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    if (!isStudent) {
      toast.error('Only students can save internships');
      return;
    }
    try {
      const res = await userAPI.saveInternship(id);
      setSaved(res.data.saved);
      toast.success(res.data.saved ? 'Saved!' : 'Removed from saved');
    } catch {}
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!internship) return <div className="container"><p>Internship not found</p></div>;

  const daysLeft = Math.ceil((new Date(internship.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft < 0;

  return (
    <div className="detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/internships">Internships</Link> / {internship.title}
        </div>

        <div className="detail-layout">
          {/* Main Content */}
          <div className="detail-main">
            <div className="detail-header-card">
                  <div className="detail-company-header">
                <div className="detail-company-logo">
                  {internship.companyLogo
                    ? <img src={internship.companyLogo} alt={internship.company} />
                    : <span>{internship.company?.charAt(0)}</span>
                  }
                </div>
                  <div>
                  <h1>{internship.title}</h1>
                  <p className="detail-company">{internship.company}</p>
                  <div className="detail-location"><i className="fa-solid fa-location-dot" style={{ marginRight: 6, color: 'var(--gray)' }}></i>{internship.location}</div>
                </div>
              </div>

              <div className="detail-meta-tags">
                <span className="badge badge-primary">
                  {internship.type === 'remote' ? <i className="fa-solid fa-globe" style={{ marginRight: 6, color: '#06B6D4' }}></i>
                   : internship.type === 'onsite' ? <i className="fa-solid fa-building" style={{ marginRight: 6, color: 'var(--gray)' }}></i>
                   : <i className="fa-solid fa-arrows-rotate" style={{ marginRight: 6, color: '#6B7280' }}></i>}
                  {internship.type?.charAt(0).toUpperCase() + internship.type?.slice(1)}
                </span>
                <span className="badge badge-gray"><i className="fa-solid fa-folder" style={{ marginRight: 6, color: 'var(--gray)' }}></i>{internship.category?.charAt(0).toUpperCase() + internship.category?.slice(1)}</span>
                {internship.isFeatured && <span className="badge badge-secondary"><i className="fa-solid fa-star" style={{ color: '#FBBF24', marginRight: 6 }}></i> Featured</span>}
              </div>

              <div className="detail-stats-row">
                <div className="detail-stat">
                  <span className="stat-icon"><i className="fa-solid fa-coins" style={{ color: '#10B981' }}></i></span>
                  <div>
                    <small>Stipend</small>
                    <strong>{internship.stipend?.type === 'unpaid' ? 'Unpaid' : `₹${internship.stipend?.amount?.toLocaleString('en-IN')}/month`}</strong>
                  </div>
                </div>
                <div className="detail-stat">
                  <span className="stat-icon"><i className="fa-solid fa-hourglass-half" style={{ color: '#F97316' }}></i></span>
                  <div><small>Duration</small><strong>{internship.duration}</strong></div>
                </div>
                <div className="detail-stat">
                  <span className="stat-icon"><i className="fa-solid fa-calendar-days" style={{ color: '#6B7280' }}></i></span>
                  <div>
                    <small>Deadline</small>
                    <strong className={isExpired ? 'text-error' : daysLeft <= 5 ? 'text-warning' : ''}>
                      {isExpired ? 'Expired' : format(new Date(internship.applicationDeadline), 'MMM dd, yyyy')}
                    </strong>
                  </div>
                </div>
                <div className="detail-stat">
                  <span className="stat-icon"><i className="fa-solid fa-bullseye" style={{ color: '#F59E0B' }}></i></span>
                  <div><small>Openings</small><strong>{internship.openings}</strong></div>
                </div>
              </div>
            </div>

            {internship.description && (
              <div className="detail-section">
                <h2>About the Internship</h2>
                <div className="detail-description">
                  {internship.description.split('\n').map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </div>
            )}

            {internship.responsibilities?.length > 0 && (
              <div className="detail-section">
                <h2>Responsibilities</h2>
                <ul className="detail-list">
                  {internship.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {internship.requirements?.length > 0 && (
              <div className="detail-section">
                <h2>Requirements & Eligibility</h2>
                <ul className="detail-list">
                  {internship.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {internship.skills?.length > 0 && (
              <div className="detail-section">
                <h2>Skills Required</h2>
                <div className="skills-list">
                  {internship.skills.map((s, i) => <span key={i} className="skill-badge">{s}</span>)}
                </div>
              </div>
            )}

            {internship.perks?.length > 0 && (
              <div className="detail-section">
                <h2>Perks & Benefits</h2>
                <div className="perks-list">
                  {internship.perks.map((perk, i) => <div key={i} className="perk-item"><i className="fa-solid fa-circle-check" style={{ color: '#10B981', marginRight: 8 }}></i> {perk}</div>)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
            <div className="apply-card">
              <div className="apply-card-header">
                <div className="deadline-info">
                  <strong>Application Deadline</strong>
                  <p className={isExpired ? 'text-error' : daysLeft <= 5 ? 'text-warning' : 'text-success'}>
                    {isExpired ? 'Expired' : `${daysLeft} days remaining`}
                  </p>
                </div>
              </div>

              {/* Apply button: only for students, not expired */}
              {isStudent && !isExpired && (
                applied ? (
                  <div className="applied-notice">
                    <i className="fa-solid fa-circle-check" style={{ color: '#10B981', fontSize: 18, marginRight: 8 }}></i>
                    <div><strong>Applied!</strong><p>You have already applied for this internship.</p></div>
                  </div>
                ) : (
                    <button
                      className="btn btn-primary btn-lg apply-btn"
                      onClick={() => setShowApplyModal(true)}
                    >
                      Apply Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }}></i>
                    </button>
                )
              )}

              {/* Not logged in */}
              {!user && !isExpired && (
                <button className="btn btn-primary btn-lg apply-btn" onClick={() => navigate('/login')}>
                  Login to Apply →
                </button>
              )}

              {/* Company/Admin sees info notice instead of apply button */}
              {user && !isStudent && (
                <div className="role-notice">
                  {user.role === 'company'
                    ? <><i className="fa-solid fa-building" style={{ marginRight: 8 }}></i> You are viewing as a Company</>
                    : <><i className="fa-solid fa-shield" style={{ marginRight: 8 }}></i> You are viewing as Admin</>}
                </div>
              )}

              {/* Save button — students only */}
                  {isStudent && (
                <button
                  className={`btn btn-outline save-internship-btn ${saved ? 'saved' : ''}`}
                  onClick={handleSave}
                >
                  {saved ? <><i className="fa-solid fa-bookmark" style={{ color: '#F59E0B', marginRight: 8 }}></i> Saved</> : <><i className="fa-solid fa-bookmark" style={{ marginRight: 8 }}></i> Save Internship</>}
                </button>
              )}

              <div className="apply-meta">
                <div className="apply-meta-item"><i className="fa-solid fa-users" style={{ marginRight: 8 }}></i> {internship.applicationsCount} applications</div>
                <div className="apply-meta-item"><i className="fa-solid fa-eye" style={{ marginRight: 8 }}></i> {internship.views} views</div>
                {internship.startDate && (
                  <div className="apply-meta-item">
                    <i className="fa-solid fa-rocket" style={{ marginRight: 8, color: '#EF4444' }}></i> Starts {format(new Date(internship.startDate), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
            </div>

            <div className="company-card">
              <h3>About Company</h3>
                <div className="company-info">
                <div className="company-logo-md">{internship.company?.charAt(0)}</div>
                <div>
                  <strong>{internship.company}</strong>
                  <p><i className="fa-solid fa-location-dot" style={{ marginRight: 6, color: 'var(--gray)' }}></i>{internship.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal — students only */}
      {showApplyModal && isStudent && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for {internship.title}</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>×</button>
            </div>
            <form onSubmit={handleApply} className="apply-form">
              <div className="form-group">
                <label>Cover Letter <span className="optional">(Optional)</span></label>
                <textarea
                  placeholder={`Dear ${internship.company} Team,\n\nI am writing to express my interest...`}
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="form-group">
                <label>Resume Link <span className="optional">(Optional – paste Google Drive link)</span></label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={resume}
                  onChange={e => setResume(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={applying}>
                  {applying ? 'Submitting...' : <><i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i> Submit Application</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipDetail;
