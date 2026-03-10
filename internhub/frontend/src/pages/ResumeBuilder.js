import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './ResumeBuilder.css';

const ResumeBuilder = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [template, setTemplate] = useState('modern');
  const [keywords, setKeywords] = useState(null);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview', 'optimize', 'download'

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const res = await api.get('/resume/keywords');
      setKeywords(res.data.keywords);
    } catch (err) {
      console.error('Failed to fetch keywords:', err);
    }
  };

  const analyzeResume = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post('/resume/analyze');
      setAnalysis(res.data.analysis);
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadResume = async () => {
    setLoading(true);
    try {
      const res = await api.post('/resume/generate', 
        { template }, 
        { responseType: 'blob' }
      );
      
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.name.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded successfully! 📄');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#F97316';
    return '#EF4444';
  };

  const calculateProfileCompletion = () => {
    const fields = [
      user.name, user.email, user.phone, user.location, user.bio,
      user.skills?.length > 0,
      user.education?.length > 0,
      user.experience?.length > 0,
      user.linkedIn, user.github
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="resume-builder-page">
      <div className="container">
        {/* Header */}
        <div className="resume-header">
          <div>
            <h1>📄 Resume Builder</h1>
            <p>Create a FAANG-level ATS-optimized resume from your profile</p>
          </div>
          <button className="btn btn-primary" onClick={downloadResume} disabled={loading || profileCompletion < 60}>
            {loading ? 'Generating...' : '⬇ Download Resume'}
          </button>
        </div>

        {/* Profile Completion Alert */}
        {profileCompletion < 60 && (
          <div className="alert alert-warning">
            <strong>⚠️ Profile Incomplete ({profileCompletion}%)</strong>
            <p>Complete your profile to at least 60% to generate a resume. Add education, experience, and skills.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="resume-tabs">
          <button 
            className={activeTab === 'preview' ? 'active' : ''} 
            onClick={() => setActiveTab('preview')}
          >
            👁️ Preview
          </button>
          <button 
            className={activeTab === 'optimize' ? 'active' : ''} 
            onClick={() => setActiveTab('optimize')}
          >
            🎯 Optimize
          </button>
          <button 
            className={activeTab === 'download' ? 'active' : ''} 
            onClick={() => setActiveTab('download')}
          >
            ⚙️ Templates
          </button>
        </div>

        {/* Tab Content */}
        <div className="resume-content">
          
          {/* PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="preview-section">
              <div className="resume-preview-card">
                <div className="resume-paper">
                  {/* Header */}
                  <div className="resume-paper-header">
                    <h2>{user.name?.toUpperCase()}</h2>
                    <div className="resume-paper-contact">
                      {user.email} {user.phone && `• ${user.phone}`} {user.location && `• ${user.location}`}
                    </div>
                    {(user.linkedIn || user.github || user.portfolio) && (
                      <div className="resume-paper-links">
                        {user.linkedIn && <span>LinkedIn</span>}
                        {user.github && <span>GitHub</span>}
                        {user.portfolio && <span>Portfolio</span>}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {user.bio && (
                    <div className="resume-paper-section">
                      <h3>PROFESSIONAL SUMMARY</h3>
                      <p>{user.bio}</p>
                    </div>
                  )}

                  {/* Education */}
                  {user.education?.length > 0 && (
                    <div className="resume-paper-section">
                      <h3>EDUCATION</h3>
                      {user.education.map((edu, i) => (
                        <div key={i} className="resume-paper-item">
                          <div className="resume-paper-item-header">
                            <strong>{edu.institution}</strong>
                            <span className="resume-paper-date">{edu.startYear} - {edu.endYear}</span>
                          </div>
                          <div className="resume-paper-item-subtitle">
                            {edu.degree} in {edu.field}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {user.skills?.length > 0 && (
                    <div className="resume-paper-section">
                      <h3>TECHNICAL SKILLS</h3>
                      <div className="resume-paper-skills">
                        {user.skills.join(' • ')}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {user.experience?.length > 0 && (
                    <div className="resume-paper-section">
                      <h3>EXPERIENCE</h3>
                      {user.experience.map((exp, i) => (
                        <div key={i} className="resume-paper-item">
                          <div className="resume-paper-item-header">
                            <strong>{exp.position} — {exp.company}</strong>
                            <span className="resume-paper-date">{exp.duration}</span>
                          </div>
                          {exp.description && (
                            <ul className="resume-paper-bullets">
                              {exp.description.split('\n').filter(Boolean).map((line, j) => (
                                <li key={j}>{line.replace(/^[•\-]\s*/, '')}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Stats Sidebar */}
              <div className="preview-stats">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div>
                    <strong>{profileCompletion}%</strong>
                    <small>Profile Complete</small>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div>
                    <strong>{user.skills?.length || 0}</strong>
                    <small>Skills Listed</small>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💼</div>
                  <div>
                    <strong>{user.experience?.length || 0}</strong>
                    <small>Experience</small>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎓</div>
                  <div>
                    <strong>{user.education?.length || 0}</strong>
                    <small>Education</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OPTIMIZE TAB */}
          {activeTab === 'optimize' && (
            <div className="optimize-section">
              <div className="optimize-main">
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={analyzeResume}
                  disabled={analyzing}
                >
                  {analyzing ? 'Analyzing...' : '🔍 Analyze My Resume'}
                </button>

                {analysis && (
                  <>
                    {/* Score Card */}
                    <div className="score-card">
                      <div className="score-circle" style={{ borderColor: getScoreColor(analysis.score) }}>
                        <div className="score-number" style={{ color: getScoreColor(analysis.score) }}>
                          {analysis.score}
                        </div>
                        <div className="score-max">/ 100</div>
                      </div>
                      <div className="score-info">
                        <h3>{analysis.level}</h3>
                        <p>Your resume is {analysis.score >= 80 ? 'ready for top companies!' : 'getting there. Follow suggestions below.'}</p>
                      </div>
                    </div>

                    {/* Section Breakdown */}
                    <div className="analysis-sections">
                      <h3>Section Scores</h3>
                      {Object.entries(analysis.sections).map(([section, data]) => (
                        <div key={section} className="section-score-row">
                          <div className="section-score-label">
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                          </div>
                          <div className="section-score-bar-wrap">
                            <div 
                              className="section-score-bar" 
                              style={{ 
                                width: `${(data.score / data.max) * 100}%`,
                                backgroundColor: getScoreColor((data.score / data.max) * 100)
                              }}
                            ></div>
                          </div>
                          <div className="section-score-value">{data.score}/{data.max}</div>
                        </div>
                      ))}
                    </div>

                    {/* Suggestions */}
                    {analysis.suggestions?.length > 0 && (
                      <div className="suggestions-card">
                        <h3>💡 Improvement Suggestions</h3>
                        <ul>
                          {analysis.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Keywords */}
                    <div className="keywords-card">
                      <h3>🔑 FAANG Keywords</h3>
                      <div className="keyword-section">
                        <strong className="keyword-found">✅ Found ({analysis.keywords.found.length}):</strong>
                        <div className="keyword-tags">
                          {analysis.keywords.found.slice(0, 10).map((kw, i) => (
                            <span key={i} className="keyword-tag found">{kw}</span>
                          ))}
                          {analysis.keywords.found.length > 10 && <span className="keyword-more">+{analysis.keywords.found.length - 10} more</span>}
                        </div>
                      </div>
                      <div className="keyword-section">
                        <strong className="keyword-missing">❌ Missing (Consider Adding):</strong>
                        <div className="keyword-tags">
                          {analysis.keywords.missing.slice(0, 15).map((kw, i) => (
                            <span key={i} className="keyword-tag missing">{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Tips Sidebar */}
              <div className="tips-sidebar">
                <div className="tips-card">
                  <h4>⭐ FAANG Resume Tips</h4>
                  <ul>
                    <li><strong>Use action verbs:</strong> Led, Implemented, Optimized, Architected</li>
                    <li><strong>Quantify everything:</strong> Increased by 30%, Reduced latency from 2s to 200ms</li>
                    <li><strong>Focus on impact:</strong> What was the business outcome?</li>
                    <li><strong>Keep it 1 page:</strong> Recruiters spend 6 seconds per resume</li>
                    <li><strong>ATS-friendly:</strong> Use standard fonts, no images, simple formatting</li>
                    <li><strong>Keywords matter:</strong> Match job description language</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === 'download' && (
            <div className="templates-section">
              <h3>Choose Your Template</h3>
              <div className="template-grid">
                <div 
                  className={`template-card ${template === 'modern' ? 'selected' : ''}`}
                  onClick={() => setTemplate('modern')}
                >
                  <div className="template-preview modern-template"></div>
                  <div className="template-info">
                    <strong>Modern</strong>
                    <small>Clean, professional, ATS-optimized</small>
                  </div>
                  {template === 'modern' && <div className="template-badge">✓ Selected</div>}
                </div>

                <div 
                  className={`template-card ${template === 'classic' ? 'selected' : ''}`}
                  onClick={() => setTemplate('classic')}
                >
                  <div className="template-preview classic-template"></div>
                  <div className="template-info">
                    <strong>Classic</strong>
                    <small>Traditional, conservative, professional</small>
                  </div>
                  {template === 'classic' && <div className="template-badge">✓ Selected</div>}
                </div>

                <div 
                  className={`template-card ${template === 'minimal' ? 'selected' : ''}`}
                  onClick={() => setTemplate('minimal')}
                >
                  <div className="template-preview minimal-template"></div>
                  <div className="template-info">
                    <strong>Minimal</strong>
                    <small>Simple, elegant, distraction-free</small>
                  </div>
                  {template === 'minimal' && <div className="template-badge">✓ Selected</div>}
                </div>
              </div>

              <div className="download-section">
                <h3>Ready to Download?</h3>
                <p>Your resume will be generated as a PDF using the {template} template.</p>
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={downloadResume}
                  disabled={loading || profileCompletion < 60}
                >
                  {loading ? 'Generating PDF...' : '📥 Download Resume PDF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
