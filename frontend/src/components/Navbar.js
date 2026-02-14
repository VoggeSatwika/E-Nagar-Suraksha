import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { ROLES } from '../utils/constants';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🏛️</span>
          <span style={styles.logoText}>e-Nagar Suraksha</span>
        </Link>

        {user && (
          <div style={styles.navLinks}>
            <Link 
              to="/dashboard" 
              style={{
                ...styles.navLink,
                ...(isActive('/dashboard') ? styles.activeLink : {})
              }}
            >
              Dashboard
            </Link>
            
            {user.role === 'citizen' && (
              <>
                <Link 
                  to="/submit-complaint" 
                  style={{
                    ...styles.navLink,
                    ...(isActive('/submit-complaint') ? styles.activeLink : {})
                  }}
                >
                  Submit Complaint
                </Link>
                <Link 
                  to="/my-complaints" 
                  style={{
                    ...styles.navLink,
                    ...(isActive('/my-complaints') ? styles.activeLink : {})
                  }}
                >
                  My Complaints
                </Link>
              </>
            )}

            {(user.role === 'police' || user.role === 'municipal' || user.role === 'admin') && (
              <Link 
                to="/complaints" 
                style={{
                  ...styles.navLink,
                  ...(isActive('/complaints') ? styles.activeLink : {})
                }}
              >
                Complaints
              </Link>
            )}

            {user.role === 'admin' && (
              <Link 
                to="/admin" 
                style={{
                  ...styles.navLink,
                  ...(isActive('/admin') ? styles.activeLink : {})
                }}
              >
                Admin
              </Link>
            )}
          </div>
        )}

        <div style={styles.authSection}>
          {user ? (
            <div style={styles.userMenu}>
              <span style={styles.userInfo}>
                <span style={styles.userRole}>{ROLES[user.role]?.label}</span>
                {user.name}
              </span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#1f2937'
  },
  logoIcon: {
    fontSize: '24px',
    marginRight: '8px'
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937'
  },
  navLinks: {
    display: 'flex',
    gap: '24px'
  },
  navLink: {
    textDecoration: 'none',
    color: '#6b7280',
    fontSize: '15px',
    fontWeight: '500',
    padding: '8px 0',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
  },
  activeLink: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
  },
  authSection: {
    display: 'flex',
    alignItems: 'center'
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  userRole: {
    fontSize: '11px',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  authLinks: {
    display: 'flex',
    gap: '12px'
  },
  loginBtn: {
    padding: '8px 16px',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500'
  },
  registerBtn: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default Navbar;
