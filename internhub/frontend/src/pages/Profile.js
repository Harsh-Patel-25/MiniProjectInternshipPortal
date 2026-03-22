import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const isCompany = user?.role === 'company';

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    linkedIn: user?.linkedIn || '',
    github: user?.github || '',
    portfolio: user?.portfolio || '',
    resume: user?.resume || '',
    skills: user?.skills || [],
    education: user?.education?.length > 0 ? user.education : [{ institution: '', degree: '', field: '', startYear: '', endYear: '' }],
    experience: user?.experience?.length > 0 ? user.experience : [{ company: '', position: '', duration: '', description: '' }],
    // Company specific fields
    companySize: user?.companySize || '',
    industry: user?.industry || '',
    foundedYear: user?.foundedYear || '',
    website: user?.website || '',
    companyDescription: user?.companyDescription || '',
  });

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const s = skillInput.trim();
      if (s && !form.skills.includes(s)) updateField('skills', [...form.skills, s]);
      setSkillInput('');
    }
  };

  const updateEdu = (i, key, val) => {
    const edu = [...form.education];
    edu[i] = { ...edu[i], [key]: val };
    updateField('education', edu);
  };

  const updateExp = (i, key, val) => {
    const exp = [...form.experience];
    exp[i] = { ...exp[i], [key]: val };
    updateField('experience', exp);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const getCompleteness = () => {
    if (isCompany) {
      const fields = [form.name, form.bio, form.phone, form.location, form.website, form.companySize, form.industry, form.foundedYear, form.companyDescription, form.linkedIn];
      const filled = fields.filter(Boolean).length;
      return Math.round((filled / fields.length) * 100);
    } else {
      const fields = [form.name, form.bio, form.phone, form.location, form.resume, form.skills.length > 0, form.education[0]?.institution, form.experience[0]?.company, form.linkedIn];
      const filled = fields.filter(Boolean).length;
      return Math.round((filled / fields.length) * 100);
    }
  };

  const completeness = getCompleteness();

  return (
    <div className="profile-page">
      <div className="page-header"><div className="container"><h1>{isCompany ? 'Company Profile' : 'My Profile'}</h1><p>Keep your profile complete to {isCompany ? 'attract the best talent' : 'get better matches'}</p></div></div>
      <div className="container profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar-large">{user?.name?.charAt(0)}</div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <span className="badge badge-primary">{user?.role === 'student' ? <><i className="fa-solid fa-user-graduate" style={{ marginRight: 6 }}></i>Student</> : <><i className="fa-solid fa-building" style={{ marginRight: 6 }}></i>Company</>}</span>
            
            {isCompany && user?.verificationStatus === 'verified' && (
              <div className="verification-badge-container" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <span className="badge" style={{ backgroundColor: '#10B981', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {user.trustBadge === 'platinum' ? <i className="fa-solid fa-gem" style={{ color: '#E5E4E2' }}></i> :
                   user.trustBadge === 'gold' ? <i className="fa-solid fa-trophy" style={{ color: '#FCD34D' }}></i> :
                   user.trustBadge === 'silver' ? <i className="fa-solid fa-medal" style={{ color: '#D1D5DB' }}></i> :
                   user.trustBadge === 'bronze' ? <i className="fa-solid fa-star" style={{ color: '#F59E0B' }}></i> :
                   <i className="fa-solid fa-circle-check"></i>}
                   Verified Company
                </span>
                <span className="trust-score" style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>
                  Trust Score: <strong style={{ color: '#111827' }}>{user.trustScore}/100</strong>
                </span>
              </div>
            )}

            <div className="completeness-bar">
              <div className="completeness-header">
                <span>Profile Completeness</span>
                <strong>{completeness}%</strong>
              </div>
              <div className="bar"><div className="bar-fill" style={{ width: `${completeness}%` }}></div></div>
            </div>
          </div>
          <nav className="profile-nav">
            {isCompany ? (
              ['basic', 'company_details', 'links'].map(tab => (
                <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                  {tab === 'basic' ? <><i className="fa-solid fa-building" style={{ marginRight: 8 }}></i> Basic Info</> : tab === 'company_details' ? <><i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: '#F59E0B' }}></i> Details</> : <><i className="fa-solid fa-link" style={{ marginRight: 8 }}></i> Links</>}
                </button>
              ))
            ) : (
              ['basic', 'skills', 'education', 'experience', 'links'].map(tab => (
                <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                  {tab === 'basic' ? <><i className="fa-solid fa-user" style={{ marginRight: 8 }}></i> Basic Info</> : tab === 'skills' ? <><i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: '#F59E0B' }}></i> Skills</> : tab === 'education' ? <><i className="fa-solid fa-graduation-cap" style={{ marginRight: 8, color: '#FBBF24' }}></i> Education</> : tab === 'experience' ? <><i className="fa-solid fa-briefcase" style={{ marginRight: 8 }}></i> Experience</> : <><i className="fa-solid fa-link" style={{ marginRight: 8 }}></i> Links & Resume</>}
                </button>
              ))
            )}
          </nav>
        </aside>

        {/* Main */}
        <div className="profile-main">
          {activeTab === 'basic' && (
            <div className="profile-section">
              <h2>Basic Information</h2>
              <div className="form-grid-2">
                <div className="form-group"><label>{isCompany ? 'Company Name' : 'Full Name'}</label><input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} /></div>
                <div className="form-group"><label>Phone Number</label><input type="tel" placeholder="+91 9999999999" value={form.phone} onChange={e => updateField('phone', e.target.value)} /></div>
                <div className="form-group"><label>Location</label><input type="text" placeholder="City, State" value={form.location} onChange={e => updateField('location', e.target.value)} /></div>
              </div>
              <div className="form-group"><label>{isCompany ? 'Short Tagline (Bio)' : 'Professional Bio'}</label><textarea placeholder={isCompany ? "Short tagline about your company..." : "Write a short bio about yourself..."} value={form.bio} onChange={e => updateField('bio', e.target.value)} rows={5} /></div>
            </div>
          )}

          {isCompany && activeTab === 'company_details' && (
            <div className="profile-section">
              <h2>Company Details</h2>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Industry</label>
                  <input type="text" placeholder="e.g. Information Technology" value={form.industry} onChange={e => updateField('industry', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Company Size</label>
                  <select value={form.companySize} onChange={e => updateField('companySize', e.target.value)} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '15px' }}>
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Founded Year</label>
                  <input type="number" placeholder="e.g. 2010" value={form.foundedYear} onChange={e => updateField('foundedYear', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Company Description</label>
                <textarea placeholder="Tell us more about your company mission, vision, and culture..." value={form.companyDescription} onChange={e => updateField('companyDescription', e.target.value)} rows={6} />
              </div>
            </div>
          )}

          {!isCompany && activeTab === 'skills' && (
            <div className="profile-section">
              <h2>Skills</h2>
              <div className="form-group">
                <label>Add Skills (press Enter or comma)</label>
                <div className="tags-input">
                  {form.skills.map((s, i) => (
                    <div key={i} className="tag">{s}<button type="button" onClick={() => updateField('skills', form.skills.filter((_, j) => j !== i))}>×</button></div>
                  ))}
                  <input type="text" placeholder="Type skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} style={{ border: 'none', outline: 'none', flex: 1, minWidth: '150px', fontSize: '14px', padding: '4px' }} />
                </div>
              </div>
            </div>
          )}

          {!isCompany && activeTab === 'education' && (
            <div className="profile-section">
              <h2>Education</h2>
              {form.education.map((edu, i) => (
                <div key={i} className="list-card">
                  <div className="form-grid-2">
                    <div className="form-group"><label>Institution</label><input type="text" placeholder="University/College name" value={edu.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} /></div>
                    <div className="form-group"><label>Degree</label><input type="text" placeholder="B.Tech, BCA, MBA..." value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} /></div>
                    <div className="form-group"><label>Field of Study</label><input type="text" placeholder="Computer Science, Marketing..." value={edu.field} onChange={e => updateEdu(i, 'field', e.target.value)} /></div>
                    <div className="form-group"><label>Start Year</label><input type="number" placeholder="2020" value={edu.startYear} onChange={e => updateEdu(i, 'startYear', e.target.value)} /></div>
                    <div className="form-group"><label>End Year</label><input type="number" placeholder="2024" value={edu.endYear} onChange={e => updateEdu(i, 'endYear', e.target.value)} /></div>
                  </div>
                  {form.education.length > 1 && <button className="remove-list-item-btn" onClick={() => updateField('education', form.education.filter((_, j) => j !== i))}>Remove</button>}
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={() => updateField('education', [...form.education, { institution: '', degree: '', field: '', startYear: '', endYear: '' }])}>+ Add Education</button>
            </div>
          )}

          {!isCompany && activeTab === 'experience' && (
            <div className="profile-section">
              <h2>Work Experience</h2>
              {form.experience.map((exp, i) => (
                <div key={i} className="list-card">
                  <div className="form-grid-2">
                    <div className="form-group"><label>Company</label><input type="text" placeholder="Company name" value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} /></div>
                    <div className="form-group"><label>Position</label><input type="text" placeholder="Your role/position" value={exp.position} onChange={e => updateExp(i, 'position', e.target.value)} /></div>
                    <div className="form-group"><label>Duration</label><input type="text" placeholder="Jan 2023 - Mar 2023" value={exp.duration} onChange={e => updateExp(i, 'duration', e.target.value)} /></div>
                  </div>
                  <div className="form-group"><label>Description</label><textarea placeholder="What did you work on?" value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} rows={3} /></div>
                  {form.experience.length > 1 && <button className="remove-list-item-btn" onClick={() => updateField('experience', form.experience.filter((_, j) => j !== i))}>Remove</button>}
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={() => updateField('experience', [...form.experience, { company: '', position: '', duration: '', description: '' }])}>+ Add Experience</button>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="profile-section">
              <h2>{isCompany ? 'Links & Website' : 'Links & Resume'}</h2>
              {isCompany && (
                <div className="form-group"><label><i className="fa-solid fa-globe" style={{ marginRight: 8, color: '#06B6D4' }}></i> Company Website</label><input type="url" placeholder="https://yourcompany.com" value={form.website} onChange={e => updateField('website', e.target.value)} /></div>
              )}
              <div className="form-group"><label><i className="fa-brands fa-linkedin" style={{ marginRight: 8, color: '#0A66C2' }}></i> {isCompany ? 'Company LinkedIn' : 'LinkedIn Profile'}</label><input type="url" placeholder="https://linkedin.com/in/..." value={form.linkedIn} onChange={e => updateField('linkedIn', e.target.value)} /></div>
              {!isCompany && (
                <>
                  <div className="form-group"><label><i className="fa-brands fa-github" style={{ marginRight: 8 }}></i> GitHub Profile</label><input type="url" placeholder="https://github.com/..." value={form.github} onChange={e => updateField('github', e.target.value)} /></div>
                  <div className="form-group"><label><i className="fa-solid fa-globe" style={{ marginRight: 8 }}></i> Portfolio Website</label><input type="url" placeholder="https://..." value={form.portfolio} onChange={e => updateField('portfolio', e.target.value)} /></div>
                  <div className="form-group"><label><i className="fa-solid fa-file-lines" style={{ marginRight: 8 }}></i> Resume Link</label><input type="url" placeholder="https://drive.google.com/..." value={form.resume} onChange={e => updateField('resume', e.target.value)} /></div>
                </>
              )}
            </div>
          )}

          <div className="profile-actions">
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 8 }}></i> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
