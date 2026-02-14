import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Landing Page
const Landing = () => {
  return (
    <div style={styles.landing}>
      <div style={styles.landingContent}>
        <h1 style={styles.landingTitle}>🏛️ e-Nagar Suraksha</h1>
        <p style={styles.landingSubtitle}>
          Your voice matters. Submit complaints about civic issues and track their resolution in real-time.
        </p>
        <div style={styles.landingFeatures}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📍</span>
            <span>Geo-tagged complaints</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>📷</span>
            <span>Photo evidence</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🔔</span>
            <span>Real-time updates</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>✅</span>
            <span>Track resolution</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={styles.app}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/submit-complaint" 
              element={
                <ProtectedRoute roles={['citizen']}>
                  <SubmitComplaint />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-complaints" 
              element={
                <ProtectedRoute roles={['citizen']}>
                  <MyComplaints />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/complaints" 
              element={
                <ProtectedRoute roles={['police', 'municipal', 'admin']}>
                  <MyComplaints />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute roles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    color: '#6b7280'
  },
  landing: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px'
  },
  landingContent: {
    textAlign: 'center',
    maxWidth: '600px'
  },
  landingTitle: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '16px'
  },
  landingSubtitle: {
    fontSize: '18px',
    color: '#6b7280',
    marginBottom: '40px',
    lineHeight: '1.6'
  },
  landingFeatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    fontSize: '14px',
    color: '#374151'
  },
  featureIcon: {
    fontSize: '20px'
  }
};

export default App;
