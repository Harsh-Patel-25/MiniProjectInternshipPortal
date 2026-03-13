import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      
      // ✅ FIX: Navigate based on role including admin
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true }); // replace prevents going back to login
      } else if (data.user.role === 'company') {
        navigate('/company/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
          <div className="auth-promo">
          <Link to="/" className="auth-logo"><i className="fa-solid fa-bullseye" aria-hidden></i> <strong>Intern<span>Hub</span></strong></Link>
          <h2>Find Your Dream Internship Today</h2>
          <p>Join 50,000+ students who launched their careers with InternHub</p>
          <div className="auth-features">
            {['10,000+ live internships', 'Top companies across India', 'Apply in one click', 'Track all applications'].map((f, i) => (
              <div key={i} className="auth-feature-item"><i className="fa-solid fa-circle-check" style={{ color: '#10B981', marginRight: 8 }} aria-hidden></i> {f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your internship journey</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <div className="auth-divider"><span>OR</span></div>
          <div className="demo-accounts">
            <p>Demo accounts:</p>
            <button className="demo-btn" onClick={() => setForm({ email: 'student@demo.com', password: 'demo123' })}><i className="fa-solid fa-user-graduate" aria-hidden></i> Student Demo</button>
            <button className="demo-btn" onClick={() => setForm({ email: 'company@demo.com', password: 'demo123' })}><i className="fa-solid fa-building" aria-hidden></i> Company Demo</button>
            <button className="demo-btn" onClick={() => setForm({ email: 'admin@internhub.com', password: 'admin123' })}><i className="fa-solid fa-shield" aria-hidden></i> Admin Demo</button>
          </div>
          <p className="auth-switch">Don't have an account? <Link to="/register">Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
};

export const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password, form.role);
      toast.success(`Welcome to InternHub, ${data.user.name}!`);
      
      // ✅ FIX: Navigate with replace to prevent back button to register
      if (data.user.role === 'company') {
        navigate('/company/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-promo">
          <Link to="/" className="auth-logo"><i className="fa-solid fa-bullseye" aria-hidden></i> <strong>Intern<span>Hub</span></strong></Link>
          <h2>Start Your Career Journey</h2>
          <p>Join thousands of students and companies on InternHub</p>
          <div className="auth-features">
            {['Free forever', 'No credit card required', 'Instant approval', 'Trusted by 1000+ companies'].map((f, i) => (
              <div key={i} className="auth-feature-item"><i className="fa-solid fa-circle-check" style={{ color: '#10B981', marginRight: 8 }} aria-hidden></i> {f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p className="auth-subtitle">Join InternHub to find your perfect internship</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>I am a...</label>
              <div className="role-selector">
                <label className={`role-option ${form.role === 'student' ? 'active' : ''}`}>
                  <input type="radio" name="role" value="student" checked={form.role === 'student'} onChange={e => setForm({...form, role: e.target.value})} />
                  <div className="role-card"><i className="fa-solid fa-user-graduate" aria-hidden></i> <span>Student</span></div>
                </label>
                <label className={`role-option ${form.role === 'company' ? 'active' : ''}`}>
                  <input type="radio" name="role" value="company" checked={form.role === 'company'} onChange={e => setForm({...form, role: e.target.value})} />
                  <div className="role-card"><i className="fa-solid fa-building" aria-hidden></i> <span>Company</span></div>
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>{form.role === 'company' ? 'Company Name' : 'Full Name'}</label>
              <input type="text" placeholder={form.role === 'company' ? 'Your Company Name' : 'Your Full Name'} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Create a password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};
