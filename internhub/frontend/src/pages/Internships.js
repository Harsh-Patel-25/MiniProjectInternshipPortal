  import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { internshipAPI, userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import InternshipCard from '../components/InternshipCard';
import toast from 'react-hot-toast';
import './Internships.css';

const CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: null },
  { value: 'technology', label: 'Technology', icon: <i className="fa-solid fa-laptop-code" aria-hidden></i> },
  { value: 'marketing', label: 'Marketing', icon: <i className="fa-solid fa-chart-line" aria-hidden></i> },
  { value: 'design', label: 'Design', icon: <i className="fa-solid fa-palette" aria-hidden></i> },
  { value: 'finance', label: 'Finance', icon: <i className="fa-solid fa-indian-rupee-sign" aria-hidden></i> },
  { value: 'hr', label: 'Human Resources', icon: <i className="fa-solid fa-users" aria-hidden></i> },
  { value: 'sales', label: 'Sales', icon: <i className="fa-solid fa-chart-simple" aria-hidden></i> },
  { value: 'engineering', label: 'Engineering', icon: <i className="fa-solid fa-gears" aria-hidden></i> },
  { value: 'data', label: 'Data Science', icon: <i className="fa-solid fa-database" aria-hidden></i> },
  { value: 'operations', label: 'Operations', icon: <i className="fa-solid fa-wrench" aria-hidden></i> },
  { value: 'other', label: 'Other', icon: <i className="fa-solid fa-box" aria-hidden></i> }
];

const TYPES = [
  { value: 'all', label: 'All Types', icon: null },
  { value: 'remote', label: 'Remote', icon: <i className="fa-solid fa-globe" aria-hidden></i> },
  { value: 'onsite', label: 'On-site', icon: <i className="fa-solid fa-building" aria-hidden></i> },
  { value: 'hybrid', label: 'Hybrid', icon: <i className="fa-solid fa-arrows-rotate" aria-hidden></i> }
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest First' },
  { value: 'stipend.amount', label: 'Highest Stipend' },
  { value: 'applicationDeadline', label: 'Closing Soon' },
  { value: 'applicationsCount', label: 'Most Popular' }
];

const getMockInternships = () => [
  { _id: '1', title: 'Frontend Developer Intern', company: 'TechCorp India', location: 'Bangalore', type: 'hybrid', category: 'technology', stipend: { amount: 15000, currency: 'INR', type: 'paid' }, duration: '3 months', applicationDeadline: new Date(Date.now() + 30*864e5), skills: ['React', 'JavaScript', 'CSS'], isFeatured: true, applicationsCount: 45 },
  { _id: '2', title: 'Digital Marketing Intern', company: 'GrowthAgency', location: 'Mumbai', type: 'remote', category: 'marketing', stipend: { amount: 10000, currency: 'INR', type: 'paid' }, duration: '2 months', applicationDeadline: new Date(Date.now() + 20*864e5), skills: ['SEO', 'Social Media', 'Analytics'], isFeatured: true, applicationsCount: 32 },
  { _id: '3', title: 'UI/UX Design Intern', company: 'DesignStudio', location: 'Hyderabad', type: 'onsite', category: 'design', stipend: { amount: 12000, currency: 'INR', type: 'paid' }, duration: '3 months', applicationDeadline: new Date(Date.now() + 25*864e5), skills: ['Figma', 'Adobe XD', 'Prototyping'], isFeatured: false, applicationsCount: 28 },
  { _id: '4', title: 'Data Science Intern', company: 'Analytics Pro', location: 'Pune', type: 'hybrid', category: 'data', stipend: { amount: 20000, currency: 'INR', type: 'paid' }, duration: '6 months', applicationDeadline: new Date(Date.now() + 35*864e5), skills: ['Python', 'Machine Learning', 'SQL'], isFeatured: true, applicationsCount: 60 },
  { _id: '5', title: 'Business Development Intern', company: 'StartupHub', location: 'Delhi', type: 'onsite', category: 'sales', stipend: { amount: 8000, currency: 'INR', type: 'paid' }, duration: '2 months', applicationDeadline: new Date(Date.now() + 15*864e5), skills: ['Communication', 'MS Excel', 'Research'], isFeatured: false, applicationsCount: 19 },
  { _id: '6', title: 'Full Stack Developer Intern', company: 'CodeBase Labs', location: 'Chennai', type: 'remote', category: 'technology', stipend: { amount: 18000, currency: 'INR', type: 'paid' }, duration: '4 months', applicationDeadline: new Date(Date.now() + 40*864e5), skills: ['Node.js', 'React', 'MongoDB'], isFeatured: true, applicationsCount: 72 },
  { _id: '7', title: 'Finance Analyst Intern', company: 'HDFC Group', location: 'Mumbai', type: 'onsite', category: 'finance', stipend: { amount: 25000, currency: 'INR', type: 'paid' }, duration: '3 months', applicationDeadline: new Date(Date.now() + 22*864e5), skills: ['Excel', 'Financial Modeling', 'Tally'], isFeatured: false, applicationsCount: 41 },
  { _id: '8', title: 'HR Intern', company: 'People First', location: 'Gurgaon', type: 'hybrid', category: 'hr', stipend: { amount: 7000, currency: 'INR', type: 'paid' }, duration: '2 months', applicationDeadline: new Date(Date.now() + 18*864e5), skills: ['Recruitment', 'HR Policies', 'Communication'], isFeatured: false, applicationsCount: 15 },
  { _id: '9', title: 'Backend Developer Intern', company: 'CloudSystems', location: 'Noida', type: 'remote', category: 'technology', stipend: { amount: 16000, currency: 'INR', type: 'paid' }, duration: '3 months', applicationDeadline: new Date(Date.now() + 28*864e5), skills: ['Python', 'Django', 'PostgreSQL'], isFeatured: false, applicationsCount: 38 },
];

const Internships = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = new URLSearchParams(location.search);

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || 'all',
    type: 'all',
    location: params.get('location') || '',
    minStipend: '',
    maxStipend: '',
    sortBy: 'createdAt',
    page: 1
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchInternships();
    if (user?.role === 'student') fetchSaved();
  }, [filters]);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const queryParams = { ...filters, limit: 9 };
      // If user typed "remote" into the location field, treat it as a type filter
      const loc = (queryParams.location || '').toString().trim().toLowerCase();
      if (loc === 'remote' || loc.includes('remote') || loc.includes('work from home') || loc === 'wfh') {
        queryParams.type = 'remote';
        delete queryParams.location;
      }
      if (queryParams.category === 'all') delete queryParams.category;
      if (queryParams.type === 'all') delete queryParams.type;
      const res = await internshipAPI.getAll(queryParams);
      setInternships(res.data.internships || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setInternships(getMockInternships());
      setPagination({ total: 9, page: 1, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    try {
      const res = await userAPI.getSaved();
      setSavedIds(res.data.internships?.map(i => i._id) || []);
    } catch {}
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSave = async (id) => {
    if (!user) return navigate('/login');
    try {
      const res = await userAPI.saveInternship(id);
      if (res.data.saved) {
        setSavedIds(prev => [...prev, id]);
        toast.success('Internship saved!');
      } else {
        setSavedIds(prev => prev.filter(sid => sid !== id));
        toast.success('Removed from saved');
      }
    } catch {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInternships();
  };

  return (
    <div className="internships-page">
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <h1>Find Internships</h1>
          <p>Discover {pagination.total || '1000+'} internship opportunities across India</p>
        </div>
      </div>

      <div className="container internships-layout">
        {/* Filters Sidebar */}
        <aside className={`filters-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="clear-filters" onClick={() => setFilters({ search: '', category: 'all', type: 'all', location: '', minStipend: '', maxStipend: '', sortBy: 'createdAt', page: 1 })}>
              <i className="fa-solid fa-xmark" aria-hidden></i> Clear All
            </button>
          </div>

          <div className="filter-section">
            <label>Search</label>
            <form onSubmit={handleSearchSubmit} className="search-input-wrap">
              <input type="text" placeholder="Job title, skills..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
                <button type="submit" className="search-submit-btn"><i className="fa-solid fa-magnifying-glass" aria-hidden></i></button>
            </form>
          </div>

          <div className="filter-section">
            <label>Category</label>
            {CATEGORIES.map(cat => (
              <label key={cat.value} className="filter-option">
                <input type="radio" name="category" value={cat.value} checked={filters.category === cat.value} onChange={() => handleFilterChange('category', cat.value)} />
                <span>{cat.icon} {cat.label}</span>
              </label>
            ))}
          </div>

          <div className="filter-section">
            <label>Work Type</label>
            {TYPES.map(t => (
              <label key={t.value} className="filter-option">
                <input type="radio" name="type" value={t.value} checked={filters.type === t.value} onChange={() => handleFilterChange('type', t.value)} />
                <span>{t.icon} {t.label}</span>
              </label>
            ))}
          </div>

          <div className="filter-section">
            <label>Location</label>
            <input type="text" placeholder="City or state..." value={filters.location} onChange={e => handleFilterChange('location', e.target.value)} className="filter-input" />
          </div>

          <div className="filter-section">
            <label>Stipend Range (₹/month)</label>
            <div className="stipend-range">
              <input type="number" placeholder="Min" value={filters.minStipend} onChange={e => handleFilterChange('minStipend', e.target.value)} className="filter-input" />
              <span>to</span>
              <input type="number" placeholder="Max" value={filters.maxStipend} onChange={e => handleFilterChange('maxStipend', e.target.value)} className="filter-input" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="internships-content">
          {/* Toolbar */}
          <div className="content-toolbar">
            <div className="results-count">
              {loading ? 'Loading...' : `${pagination.total || internships.length} internships found`}
            </div>
            <div className="toolbar-right">
              <select className="sort-select" value={filters.sortBy} onChange={e => handleFilterChange('sortBy', e.target.value)}>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button className="filter-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <i className="fa-solid fa-sliders" aria-hidden></i> Filters
              </button>
            </div>
          </div>

          {/* Active filters */}
          <div className="active-filters">
            {filters.search && <span className="active-filter">{filters.search} <button onClick={() => handleFilterChange('search', '')}>×</button></span>}
            {filters.category !== 'all' && <span className="active-filter">{filters.category} <button onClick={() => handleFilterChange('category', 'all')}>×</button></span>}
            {filters.type !== 'all' && <span className="active-filter">{filters.type} <button onClick={() => handleFilterChange('type', 'all')}>×</button></span>}
            {filters.location && <span className="active-filter"><i className="fa-solid fa-location-dot" aria-hidden></i> {filters.location} <button onClick={() => handleFilterChange('location', '')}>×</button></span>}
          </div>

          {/* Cards */}
          {loading ? (
            <div className="cards-loading-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="card-skeleton"></div>)}
            </div>
          ) : internships.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><i className="fa-solid fa-magnifying-glass" aria-hidden></i></div>
              <h3>No internships found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button className="btn btn-primary" onClick={() => setFilters({ search: '', category: 'all', type: 'all', location: '', minStipend: '', maxStipend: '', sortBy: 'createdAt', page: 1 })}>
                <i className="fa-solid fa-xmark" aria-hidden></i> Clear Filters
              </button>
            </div>
          ) : (
            <div className="internships-results-grid">
              {internships.map(internship => (
                <InternshipCard
                  key={internship._id}
                  internship={internship}
                  showSave={user?.role === 'student'}
                  onSave={handleSave}
                  isSaved={savedIds.includes(internship._id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={pagination.page === 1} onClick={() => handleFilterChange('page', pagination.page - 1)}>‹</button>
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} className={pagination.page === p ? 'active' : ''} onClick={() => handleFilterChange('page', p)}>{p}</button>
              ))}
              <button disabled={pagination.page === pagination.pages} onClick={() => handleFilterChange('page', pagination.page + 1)}>›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Internships;
