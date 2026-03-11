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

  const completeness = Math.round([
    form.name, form.bio, form.phone, form.location, form.resume,
    form.skills.length > 0,
    form.education[0]?.institution,
    form.experience[0]?.company,
    form.linkedIn
  ].filter(Boolean).length / 9 * 100);

  return (
    <div className="profile-page">
      <div className="page-header"><div className="container"><h1>My Profile</h1><p>Keep your profile complete to get better matches</p></div></div>
      <div className="container profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar-large">{user?.name?.charAt(0)}</div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <span className="badge badge-primary">{user?.role === 'student' ? <><i className="fa-solid fa-user-graduate" style={{ marginRight: 6 }}></i>Student</> : <><i className="fa-solid fa-building" style={{ marginRight: 6 }}></i>Company</>}</span>
            <div className="completeness-bar">
              <div className="completeness-header">
                <span>Profile Completeness</span>
                <strong>{completeness}%</strong>
              </div>
              <div className="bar"><div className="bar-fill" style={{ width: `${completeness}%` }}></div></div>
            </div>
          </div>
          <nav className="profile-nav">
            {['basic', 'skills', 'education', 'experience', 'links'].map(tab => (
              <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                {tab === 'basic' ? <><i className="fa-solid fa-user" style={{ marginRight: 8 }}></i> Basic Info</> : tab === 'skills' ? <><i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: '#F59E0B' }}></i> Skills</> : tab === 'education' ? <><i className="fa-solid fa-graduation-cap" style={{ marginRight: 8, color: '#FBBF24' }}></i> Education</> : tab === 'experience' ? <><i className="fa-solid fa-briefcase" style={{ marginRight: 8 }}></i> Experience</> : <><i className="fa-solid fa-link" style={{ marginRight: 8 }}></i> Links & Resume</>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="profile-main">
          {activeTab === 'basic' && (
            <div className="profile-section">
              <h2>Basic Information</h2>
              <div className="form-grid-2">
                <div className="form-group"><label>Full Name</label><input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} /></div>
                <div className="form-group"><label>Phone Number</label><input type="tel" placeholder="+91 9999999999" value={form.phone} onChange={e => updateField('phone', e.target.value)} /></div>
                <div className="form-group"><label>Location</label><input type="text" placeholder="City, State" value={form.location} onChange={e => updateField('location', e.target.value)} /></div>
              </div>
              <div className="form-group"><label>Professional Bio</label><textarea placeholder="Write a short bio about yourself, your goals, and interests..." value={form.bio} onChange={e => updateField('bio', e.target.value)} rows={5} /></div>
            </div>
          )}

          {activeTab === 'skills' && (
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

          {activeTab === 'education' && (
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

          {activeTab === 'experience' && (
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
              <h2>Links & Resume</h2>
              <div className="form-group"><label><i className="fa-brands fa-linkedin" style={{ marginRight: 8, color: '#0A66C2' }}></i> LinkedIn Profile</label><input type="url" placeholder="https://linkedin.com/in/yourprofile" value={form.linkedIn} onChange={e => updateField('linkedIn', e.target.value)} /></div>
              <div className="form-group"><label><i className="fa-brands fa-github" style={{ marginRight: 8 }}></i> GitHub Profile</label><input type="url" placeholder="https://github.com/yourusername" value={form.github} onChange={e => updateField('github', e.target.value)} /></div>
              <div className="form-group"><label><i className="fa-solid fa-globe" style={{ marginRight: 8 }}></i> Portfolio Website</label><input type="url" placeholder="https://yourportfolio.com" value={form.portfolio} onChange={e => updateField('portfolio', e.target.value)} /></div>
              <div className="form-group"><label><i className="fa-solid fa-file-lines" style={{ marginRight: 8 }}></i> Resume Link (Google Drive / OneDrive)</label><input type="url" placeholder="https://drive.google.com/..." value={form.resume} onChange={e => updateField('resume', e.target.value)} /></div>
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
