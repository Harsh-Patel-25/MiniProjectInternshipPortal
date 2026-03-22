import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldAlt,
  faBuilding,
  faUserGraduate,
  faChevronDown,
  faUser,
  faClipboard,
  faChartSimple,
  faPlus,
  faRightFromBracket,
  faStar,
  faGem,
  faTrophy,
  faMedal,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';

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

  const getTrustBadgeIcon = (badge) => {
    const icons = {
      platinum: <FontAwesomeIcon icon={faGem} title="Platinum Verified Company" style={{ color: '#8b5cf6' }} />,
      gold: <FontAwesomeIcon icon={faTrophy} title="Gold Verified Company" style={{ color: '#F59E0B' }} />,
      silver: <FontAwesomeIcon icon={faMedal} title="Silver Verified Company" style={{ color: '#9CA3AF' }} />,
      bronze: <FontAwesomeIcon icon={faStar} title="Bronze Verified Company" style={{ color: '#D97706' }} />,
    };
    return icons[badge] || <FontAwesomeIcon icon={faCheckCircle} title="Verified Company" style={{ color: '#10B981' }} />;
  };

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
              <FontAwesomeIcon icon={faShieldAlt} style={{ marginRight: 8, color: '#F59E0B' }} /> Admin Panel
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
              <span className="user-name">
                {user.name?.split(' ')[0]}
                {user.role === 'company' && user.verificationStatus === 'verified' && (
                  <span className="user-verified-badge" style={{ marginLeft: '6px', fontSize: '0.9em' }}>
                    {getTrustBadgeIcon(user.trustBadge)}
                  </span>
                )}
              </span>
              {/* Role badge */}
              <span className={`role-chip role-${user.role}`}>
                {user.role === 'admin' ? <FontAwesomeIcon icon={faShieldAlt} style={{ color: '#F59E0B' }} aria-hidden />
                  : user.role === 'company' ? <FontAwesomeIcon icon={faBuilding} style={{ color: '#2563EB' }} aria-hidden />
                  : <FontAwesomeIcon icon={faUserGraduate} style={{ color: '#10B981' }} aria-hidden />}
              </span>
              <FontAwesomeIcon icon={faChevronDown} aria-hidden style={{ marginLeft: 8, color: '#6B7280' }} />

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span className={`role-badge-sm role-${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      {user.role === 'company' && user.verificationStatus === 'verified' && (
                        <span className="user-verified-badge" style={{ fontSize: '1.1em' }}>
                          {getTrustBadgeIcon(user.trustBadge)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                    <FontAwesomeIcon icon={faUser} style={{ marginRight: 8 }} /> My Profile
                  </Link>

                  {/* Student-only dropdown items */}
                  {user.role === 'student' && (
                    <>
                      <Link to="/my-applications" onClick={() => setDropdownOpen(false)}>
                        <FontAwesomeIcon icon={faClipboard} style={{ marginRight: 8 }} /> My Applications
                      </Link>
                      <Link to="/saved" onClick={() => setDropdownOpen(false)}>
                        <FontAwesomeIcon icon={faBookmark} style={{ marginRight: 8 }} /> Saved Internships
                      </Link>
                    </>
                  )}

                  {/* Company-only dropdown items */}
                  {user.role === 'company' && (
                    <>
                      <Link to="/company/dashboard" onClick={() => setDropdownOpen(false)}>
                        <FontAwesomeIcon icon={faChartSimple} style={{ marginRight: 8 }} /> Company Dashboard
                      </Link>
                      <Link to="/company/post-internship" onClick={() => setDropdownOpen(false)}>
                        <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} /> Post Internship
                      </Link>
                    </>
                  )}

                  {/* Admin-only dropdown items */}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}>
                      <FontAwesomeIcon icon={faShieldAlt} style={{ marginRight: 8, color: '#F59E0B' }} /> Admin Dashboard
                    </Link>
                  )}

                  <button onClick={handleLogout} className="logout-btn">
                    <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: 8 }} /> Sign Out
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
