import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { internshipAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './PostInternship.css';

const PostInternship = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    company: user?.name || '',   // ← pre-fill with logged-in company name
    location: '',
    type: 'onsite',
    category: 'technology',
    description: '',
    duration: '',
    openings: 1,
    applicationDeadline: '',
    startDate: '',
    stipendType: 'paid',
    stipendAmount: '',
    skills: [],
    responsibilities: [''],
    requirements: [''],
    perks: [''],
  });

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = skillInput.trim();
      if (skill && !form.skills.includes(skill)) {
        updateField('skills', [...form.skills, skill]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => updateField('skills', form.skills.filter(s => s !== skill));

  const updateListItem = (field, idx, val) => {
    const arr = [...form[field]];
    arr[idx] = val;
    updateField(field, arr);
  };

  const addListItem = (field) => updateField(field, [...form[field], '']);
  const removeListItem = (field, idx) => updateField(field, form[field].filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.description || !form.duration || !form.applicationDeadline) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      const data = {
        title: form.title,
        company: form.company || user?.name,  // ← always include company name
        location: form.location,
        type: form.type,
        category: form.category,
        description: form.description,
        duration: form.duration,
        openings: form.openings,
        applicationDeadline: form.applicationDeadline,
        startDate: form.startDate || undefined,
        stipend: {
          type: form.stipendType,
          amount: form.stipendAmount ? Number(form.stipendAmount) : 0,
          currency: 'INR'
        },
        skills: form.skills,
        responsibilities: form.responsibilities.filter(r => r.trim()),
        requirements: form.requirements.filter(r => r.trim()),
        perks: form.perks.filter(p => p.trim()),
      };
      await internshipAPI.create(data);
      toast.success('Internship posted successfully! 🎉');
      navigate('/company/dashboard');
    } catch (err) {
      console.error('Post error:', err.response?.data);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to post internship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-page">
      <div className="page-header">
        <div className="container">
          <h1>Post an Internship</h1>
          <p>Attract the best talent by creating a detailed internship listing</p>
        </div>
      </div>

      <div className="container post-container">
        <form onSubmit={handleSubmit} className="post-form">

          {/* Basic Info */}
          <div className="form-section">
            <h2><span>1</span> Basic Information</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Internship Title *</label>
                <input type="text" placeholder="e.g. Frontend Developer Intern" value={form.title} onChange={e => updateField('title', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Company Name *</label>
                <input type="text" placeholder="Your company name" value={form.company} onChange={e => updateField('company', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input type="text" placeholder="e.g. Bangalore, Karnataka" value={form.location} onChange={e => updateField('location', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Work Type *</label>
                <select value={form.type} onChange={e => updateField('type', e.target.value)}>
                  <option value="onsite">🏢 On-site</option>
                  <option value="remote">🌐 Remote</option>
                  <option value="hybrid">🔄 Hybrid</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={form.category} onChange={e => updateField('category', e.target.value)}>
                  <option value="technology">💻 Technology</option>
                  <option value="marketing">📊 Marketing</option>
                  <option value="design">🎨 Design</option>
                  <option value="finance">💰 Finance</option>
                  <option value="hr">👥 Human Resources</option>
                  <option value="sales">📈 Sales</option>
                  <option value="engineering">⚙️ Engineering</option>
                  <option value="data">🗄️ Data Science</option>
                  <option value="operations">🔧 Operations</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <h2><span>2</span> Description</h2>
            <div className="form-group">
              <label>Internship Description *</label>
              <textarea
                placeholder="Describe the internship role, team, and what the intern will be working on..."
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
                rows={6}
                required
              />
            </div>
          </div>

          {/* Stipend & Duration */}
          <div className="form-section">
            <h2><span>3</span> Compensation & Duration</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Stipend Type</label>
                <select value={form.stipendType} onChange={e => updateField('stipendType', e.target.value)}>
                  <option value="paid">💰 Paid</option>
                  <option value="unpaid">🎓 Unpaid</option>
                  <option value="performance-based">📈 Performance Based</option>
                </select>
              </div>
              {form.stipendType === 'paid' && (
                <div className="form-group">
                  <label>Monthly Stipend (₹)</label>
                  <input type="number" placeholder="e.g. 15000" value={form.stipendAmount} onChange={e => updateField('stipendAmount', e.target.value)} />
                </div>
              )}
              <div className="form-group">
                <label>Duration *</label>
                <input type="text" placeholder="e.g. 3 months, 6 weeks" value={form.duration} onChange={e => updateField('duration', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Number of Openings</label>
                <input type="number" min="1" max="100" value={form.openings} onChange={e => updateField('openings', parseInt(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Application Deadline *</label>
                <input
                  type="date"
                  value={form.applicationDeadline}
                  onChange={e => updateField('applicationDeadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Expected Start Date</label>
                <input type="date" value={form.startDate} onChange={e => updateField('startDate', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="form-section">
            <h2><span>4</span> Skills Required</h2>
            <div className="form-group">
              <label>Add Skills (press Enter or comma to add)</label>
              <div className="tags-input">
                {form.skills.map((skill, i) => (
                  <div key={i} className="tag">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}>×</button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Type skill and press Enter..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  style={{ border: 'none', outline: 'none', flex: 1, minWidth: '150px', fontSize: '14px', padding: '4px' }}
                />
              </div>
            </div>
          </div>

          {/* Responsibilities & Requirements */}
          <div className="form-section">
            <h2><span>5</span> Responsibilities & Requirements</h2>
            <div className="form-group">
              <label>Responsibilities</label>
              {form.responsibilities.map((item, i) => (
                <div key={i} className="list-input-row">
                  <input
                    type="text"
                    placeholder={`Responsibility ${i + 1}`}
                    value={item}
                    onChange={e => updateListItem('responsibilities', i, e.target.value)}
                  />
                  {form.responsibilities.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => removeListItem('responsibilities', i)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" className="add-item-btn" onClick={() => addListItem('responsibilities')}>+ Add Responsibility</button>
            </div>

            <div className="form-group">
              <label>Requirements & Eligibility</label>
              {form.requirements.map((item, i) => (
                <div key={i} className="list-input-row">
                  <input
                    type="text"
                    placeholder={`Requirement ${i + 1}`}
                    value={item}
                    onChange={e => updateListItem('requirements', i, e.target.value)}
                  />
                  {form.requirements.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => removeListItem('requirements', i)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" className="add-item-btn" onClick={() => addListItem('requirements')}>+ Add Requirement</button>
            </div>

            <div className="form-group">
              <label>Perks & Benefits</label>
              {form.perks.map((item, i) => (
                <div key={i} className="list-input-row">
                  <input
                    type="text"
                    placeholder={`Perk ${i + 1} (e.g., Certificate, PPO)`}
                    value={item}
                    onChange={e => updateListItem('perks', i, e.target.value)}
                  />
                  {form.perks.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => removeListItem('perks', i)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" className="add-item-btn" onClick={() => addListItem('perks')}>+ Add Perk</button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate('/company/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Posting...' : '🚀 Post Internship'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PostInternship;
