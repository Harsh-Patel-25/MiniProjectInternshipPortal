import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          <span>Intern<strong>Hub</strong></span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/internships" className={isActive('/internships') ? 'active' : ''}>Internships</Link>

          {/* Student nav */}
          {user?.role === 'student' && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
              <Link to="/my-applications" className={isActive('/my-applications') ? 'active' : ''}>Applications</Link>
              <Link to="/resume-builder" className={isActive('/resume-builder') ? 'active' : ''}>Resume Builder</Link>
            </>
          )}

          {/* Company nav — only company, NOT admin */}
          {user?.role === 'company' && (
            <>
              <Link to="/company/dashboard" className={isActive('/company/dashboard') ? 'active' : ''}>Dashboard</Link>
              <Link to="/company/post-internship" className={isActive('/company/post-internship') ? 'active' : ''}>Post Internship</Link>
            </>
          )}

          {/* Admin nav — separate from company */}
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>
              <i className="fa-solid fa-shield" style={{ marginRight: 8 }}></i> Admin Panel
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="user-avatar">
                {user.profilePicture
                  ? <img src={user.profilePicture} alt={user.name} />
                  : <span>{user.name?.charAt(0).toUpperCase()}</span>
                }
              </div>
              <span className="user-name">{user.name?.split(' ')[0]}</span>
              {/* Role badge */}
              <span className={`role-chip role-${user.role}`}>
                {user.role === 'admin' ? <i className="fa-solid fa-shield" aria-hidden></i>
                  : user.role === 'company' ? <i className="fa-solid fa-building" aria-hidden></i>
                  : <i className="fa-solid fa-user-graduate" aria-hidden></i>}
              </span>
              <i className="fa-solid fa-chevron-down" aria-hidden></i>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                    <span className={`role-badge-sm role-${user.role}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>

                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                    <i className="fa-solid fa-user" aria-hidden></i> My Profile
                  </Link>

                  {/* Student-only dropdown items */}
                  {user.role === 'student' && (
                    <>
                      <Link to="/my-applications" onClick={() => setDropdownOpen(false)}>
                        <i className="fa-solid fa-clipboard" aria-hidden></i> My Applications
                      </Link>
                      <Link to="/saved" onClick={() => setDropdownOpen(false)}>
                        <i className="fa-regular fa-bookmark" aria-hidden></i> Saved Internships
                      </Link>
                    </>
                  )}

                  {/* Company-only dropdown items */}
                  {user.role === 'company' && (
                    <>
                      <Link to="/company/dashboard" onClick={() => setDropdownOpen(false)}>
                        <i className="fa-solid fa-chart-simple" aria-hidden></i> Company Dashboard
                      </Link>
                      <Link to="/company/post-internship" onClick={() => setDropdownOpen(false)}>
                        <i className="fa-solid fa-plus" aria-hidden></i> Post Internship
                      </Link>
                    </>
                  )}

                  {/* Admin-only dropdown items */}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}>
                      <i className="fa-solid fa-shield" aria-hidden></i> Admin Dashboard
                    </Link>
                  )}

                  <button onClick={handleLogout} className="logout-btn">
                    <i className="fa-solid fa-right-from-bracket" aria-hidden></i> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
