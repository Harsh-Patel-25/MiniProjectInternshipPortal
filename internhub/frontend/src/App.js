import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import { Login, Register } from './pages/Auth';
import Internships from './pages/Internships';
import InternshipDetail from './pages/InternshipDetail';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PostInternship from './pages/PostInternship';
import { MyApplications } from './pages/MyApplications';
import SavedInternships from './pages/SavedInternships';
import './styles/App.css';
import ResumeBuilder from './pages/ResumeBuilder';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/internships/:id" element={<InternshipDetail />} />

            {/* All authenticated users */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Student only */}
            <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><Dashboard /></ProtectedRoute>} />
            <Route path="/my-applications" element={<ProtectedRoute roles={['student']}><MyApplications /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute roles={['student']}><SavedInternships /></ProtectedRoute>} />
            <Route path="/resume-builder" element={<ProtectedRoute roles={['student']}><ResumeBuilder /></ProtectedRoute>} />

            {/* Company only — admin cannot access these */}
            <Route path="/company/dashboard" element={<ProtectedRoute roles={['company']}><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/company/post-internship" element={<ProtectedRoute roles={['company']}><PostInternship /></ProtectedRoute>} />

            {/* Admin only */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
