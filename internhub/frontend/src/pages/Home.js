import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { internshipAPI } from '../utils/api';
import InternshipCard from '../components/InternshipCard';
import './Home.css';

const stats = [
  { number: '10,000+', label: 'Active Internships' },
  { number: '5,000+', label: 'Companies' },
  { number: '50,000+', label: 'Students Placed' },
  { number: '95%', label: 'Success Rate' }
];

const categories = [
  { icon: <i className="fa-solid fa-laptop-code" aria-hidden></i>, name: 'Technology', value: 'technology', color: '#5B4FE9' },
  { icon: <i className="fa-solid fa-chart-line" aria-hidden></i>, name: 'Marketing', value: 'marketing', color: '#F97316' },
  { icon: <i className="fa-solid fa-palette" aria-hidden></i>, name: 'Design', value: 'design', color: '#EC4899' },
  { icon: <i className="fa-solid fa-indian-rupee-sign" aria-hidden></i>, name: 'Finance', value: 'finance', color: '#10B981' },
  { icon: <i className="fa-solid fa-users" aria-hidden></i>, name: 'Human Resources', value: 'hr', color: '#06B6D4' },
  { icon: <i className="fa-solid fa-chart-simple" aria-hidden></i>, name: 'Sales', value: 'sales', color: '#8B5CF6' },
  { icon: <i className="fa-solid fa-gears" aria-hidden></i>, name: 'Engineering', value: 'engineering', color: '#EF4444' },
  { icon: <i className="fa-solid fa-database" aria-hidden></i>, name: 'Data Science', value: 'data', color: '#F59E0B' }
];

const howItWorks = [
  { step: '01', icon: <i className="fa-solid fa-magnifying-glass" aria-hidden></i>, title: 'Search & Discover', desc: 'Browse thousands of internships filtered by your skills, location, and interests.' },
  { step: '02', icon: <i className="fa-solid fa-pen-to-square" aria-hidden></i>, title: 'Build Your Profile', desc: 'Create a compelling profile highlighting your skills, education, and experience.' },
  { step: '03', icon: <i className="fa-solid fa-paper-plane" aria-hidden></i>, title: 'Apply in One Click', desc: 'Send tailored applications to your dream companies with ease.' },
  { step: '04', icon: <i class="fa-solid fa-user-check"></i>, title: 'Get Hired', desc: 'Land the internship and kickstart your professional career journey.' }
];

const testimonials = [
  { name: 'Arjun Sharma', role: 'Software Intern @ Google', avatar: 'A', text: 'InternHub made the entire process seamless. I found my dream internship within 2 weeks!', stars: 5 },
  { name: 'Priya Patel', role: 'Marketing Intern @ Flipkart', avatar: 'P', text: 'The platform is incredibly intuitive and the quality of internships listed here is unmatched.', stars: 5 },
  { name: 'Rahul Gupta', role: 'Finance Intern @ HDFC', avatar: 'R', text: 'Got multiple responses from top companies. The profile builder was super helpful!', stars: 5 }
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [featuredInternships, setFeaturedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await internshipAPI.getAll({ limit: 6, sortBy: 'createdAt' });
      setFeaturedInternships(res.data.internships || []);
    } catch (err) {
      // Use mock data if API fails
      setFeaturedInternships(getMockInternships());
    } finally {
      setLoading(false);
    }
  };

  const getMockInternships = () => [
    { _id: '1', title: 'Frontend Developer Intern', company: 'TechCorp India', location: 'Bangalore, Karnataka', type: 'hybrid', category: 'technology', stipend: { amount: 15000, currency: 'INR', type: 'paid' }, duration: '3 months', applicationDeadline: new Date(Date.now() + 30*24*60*60*1000), skills: ['React', 'JavaScript', 'CSS'], isFeatured: true, applicationsCount: 45 },
    { _id: '2', title: 'Digital Marketing Intern', company: 'GrowthAgency', location: 'Mumbai, Maharashtra', type: 'remote', category: 'marketing', stipend: { amount: 10000, currency: 'INR', type: 'paid' }, duration: '2 months', applicationDeadline: new Date(Date.now() + 20*24*60*60*1000), skills: ['SEO', 'Social Media', 'Analytics'], isFeatured: true, applicationsCount: 32 },
    { _id: '3', title: 'UI/UX Design Intern', company: 'DesignStudio', location: 'Hyderabad, Telangana', type: 'onsite', category: 'design', stipend: { amount: 12000, currency: 'INR', type: 'paid' }, duration: '3 months', applicationDeadline: new Date(Date.now() + 25*24*60*60*1000), skills: ['Figma', 'Adobe XD', 'Prototyping'], isFeatured: false, applicationsCount: 28 },
    { _id: '4', title: 'Data Science Intern', company: 'Analytics Pro', location: 'Pune, Maharashtra', type: 'hybrid', category: 'data', stipend: { amount: 20000, currency: 'INR', type: 'paid' }, duration: '6 months', applicationDeadline: new Date(Date.now() + 35*24*60*60*1000), skills: ['Python', 'Machine Learning', 'SQL'], isFeatured: true, applicationsCount: 60 },
    { _id: '5', title: 'Business Development Intern', company: 'StartupHub', location: 'Delhi, NCR', type: 'onsite', category: 'sales', stipend: { amount: 8000, currency: 'INR', type: 'paid' }, duration: '2 months', applicationDeadline: new Date(Date.now() + 15*24*60*60*1000), skills: ['Communication', 'MS Excel', 'Research'], isFeatured: false, applicationsCount: 19 },
    { _id: '6', title: 'Full Stack Developer Intern', company: 'CodeBase Labs', location: 'Chennai, Tamil Nadu', type: 'remote', category: 'technology', stipend: { amount: 18000, currency: 'INR', type: 'paid' }, duration: '4 months', applicationDeadline: new Date(Date.now() + 40*24*60*60*1000), skills: ['Node.js', 'React', 'MongoDB'], isFeatured: true, applicationsCount: 72 },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/internships?search=${searchQuery}&location=${location}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/internships?category=${category}`);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob blob-1"></div>
          <div className="hero-blob blob-2"></div>
          <div className="hero-dots"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge"><i className="fa-solid fa-rocket" aria-hidden></i> <span>India's #1 Internship Platform</span></div>
          <h1>Find Your Dream<br /><span className="gradient-text">Internship</span> Today</h1>
          <p className="hero-desc">Connect with 5,000+ top companies and discover internship opportunities that match your skills and passion. Launch your career with InternHub.</p>

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-field">
              <span className="search-icon"><i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i></span>
              <input
                type="text"
                placeholder="Job title, skills, or company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="search-divider"></div>
            <div className="search-field">
              <span className="search-icon"><i className="fa-solid fa-location-dot" aria-hidden="true"></i></span>
              <input
                type="text"
                placeholder="Location or Remote"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg search-btn">
              Find Internships
            </button>
          </form>

          <div className="hero-tags">
            <span>Popular:</span>
            {['React Developer', 'Data Science', 'UI/UX Design', 'Digital Marketing', 'Remote'].map(tag => (
              <button key={tag} onClick={() => navigate(`/internships?search=${tag}`)} className="hero-tag">{tag}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <strong>{stat.number}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="label">Categories</span>
            <h2>Browse by Industry</h2>
            <p>Explore internships across diverse industries and find your perfect match</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <button key={i} className="category-card" onClick={() => handleCategoryClick(cat.value)} style={{ '--cat-color': cat.color }}>
                <div className="cat-icon">{cat.icon}</div>
                <span>{cat.name}</span>
                <i className="fa-solid fa-arrow-right" aria-hidden></i>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="label">Featured</span>
              <h2>Latest Internships</h2>
            </div>
            <Link to="/internships" className="btn btn-outline">View All →</Link>
          </div>
          {loading ? (
            <div className="cards-loading">
              {[1,2,3,4,5,6].map(i => <div key={i} className="card-skeleton"></div>)}
            </div>
          ) : (
            <div className="internships-grid">
              {featuredInternships.map(internship => (
                <InternshipCard key={internship._id} internship={internship} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="label">Process</span>
            <h2>How InternHub Works</h2>
            <p>Getting your dream internship has never been easier. Follow these simple steps.</p>
          </div>
          <div className="steps-grid">
            {howItWorks.map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < howItWorks.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="label">Success Stories</span>
            <h2>Students Love InternHub</h2>
            <p>Join thousands of students who found their dream internship through our platform</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="stars">{'⭐'.repeat(t.stars)}</div>
                <p>"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-blob"></div>
            <div className="cta-content">
              <h2>Ready to Start Your Journey?</h2>
              <p>Join over 50,000 students who have launched their careers through InternHub</p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
                <Link to="/internships" className="btn btn-lg cta-outline-btn">Browse Internships</Link>
              </div>
            </div>
            <div className="cta-image">🚀</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
