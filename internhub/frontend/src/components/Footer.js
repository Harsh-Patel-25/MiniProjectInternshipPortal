import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">🎯 <span>Intern<strong>Hub</strong></span></Link>
          <p>India's leading platform connecting students with top companies for internship opportunities.</p>
          <div className="social-links">
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>For Students</h4>
          <Link to="/internships">Browse Internships</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/my-applications">My Applications</Link>
          <Link to="/saved">Saved Internships</Link>
        </div>

        <div className="footer-col">
          <h4>For Companies</h4>
          <Link to="/register">Post Internship</Link>
          <Link to="/company/dashboard">Company Dashboard</Link>
          <Link to="/register">Sign Up Free</Link>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>Email: support@internhub.com</p>
          <p>Phone: +91 12345 67890</p>
          <p>Address: 123 InternHub Office, Anand, India</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 InternHub. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
