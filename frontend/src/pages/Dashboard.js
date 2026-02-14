import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { complaintAPI } from '../services/api';
import { getStatusDetails, getCategoryIcon, formatRelativeTime } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getMyComplaints({ limit: 5 });
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCitizenDashboard = () => (
    <div style={styles.dashboard}>
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeTitle}>Welcome, {user.name}!</h1>
        <p style={styles.welcomeText}>Submit and track your complaints easily</p>
      </div>

      <div style={styles.quickActions}>
        <Link to="/submit-complaint" style={styles.actionCard}>
          <span style={styles.actionIcon}>📝</span>
          <span style={styles.actionText}>Submit Complaint</span>
        </Link>
        <Link to="/my-complaints" style={styles.actionCard}>
          <span style={styles.actionIcon}>📋</span>
          <span style={styles.actionText}>My Complaints</span>
        </Link>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>⏳</span>
          <div>
            <span style={styles.statNumber}>
              {complaints.filter(c => c.status === 'pending').length}
            </span>
            <span style={styles.statLabel}>Pending</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>🔧</span>
          <div>
            <span style={styles.statNumber}>
              {complaints.filter(c => c.status === 'in_progress').length}
            </span>
            <span style={styles.statLabel}>In Progress</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>✅</span>
          <div>
            <span style={styles.statNumber}>
              {complaints.filter(c => c.status === 'resolved').length}
            </span>
            <span style={styles.statLabel}>Resolved</span>
          </div>
        </div>
      </div>

      <div style={styles.recentSection}>
        <h2 style={styles.sectionTitle}>Recent Complaints</h2>
        {loading ? (
          <p>Loading...</p>
        ) : complaints.length === 0 ? (
          <p style={styles.emptyText}>No complaints yet. Submit your first complaint!</p>
        ) : (
          <div style={styles.complaintList}>
            {complaints.map(complaint => (
              <div 
                key={complaint._id} 
                style={styles.complaintItem}
                onClick={() => navigate(`/complaint/${complaint._id}`)}
              >
                <span style={styles.complaintIcon}>
                  {getCategoryIcon(complaint.category)}
                </span>
                <div style={styles.complaintInfo}>
                  <h3 style={styles.complaintTitle}>{complaint.title}</h3>
                  <p style={styles.complaintMeta}>
                    {formatRelativeTime(complaint.createdAt)} • {complaint.category.replace('_', ' ')}
                  </p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusDetails(complaint.status).color + '20',
                  color: getStatusDetails(complaint.status).color
                }}>
                  {getStatusDetails(complaint.status).label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderOfficerDashboard = () => (
    <div style={styles.dashboard}>
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeTitle}>Welcome, Officer {user.name}!</h1>
        <p style={styles.welcomeText}>Manage and resolve assigned complaints</p>
      </div>

      <div style={styles.quickActions}>
        <Link to="/complaints" style={styles.actionCard}>
          <span style={styles.actionIcon}>📋</span>
          <span style={styles.actionText}>All Complaints</span>
        </Link>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>📥</span>
          <div>
            <span style={styles.statNumber}>
              {complaints.filter(c => c.status === 'assigned').length}
            </span>
            <span style={styles.statLabel}>Assigned</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>🔧</span>
          <div>
            <span style={styles.statNumber}>
              {complaints.filter(c => c.status === 'in_progress').length}
            </span>
            <span style={styles.statLabel}>In Progress</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>✅</span>
          <div>
            <span style={styles.statNumber}>
              {complaints.filter(c => c.status === 'resolved').length}
            </span>
            <span style={styles.statLabel}>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );

  return user?.role === 'citizen' ? renderCitizenDashboard() : renderOfficerDashboard();
};

const styles = {
  dashboard: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  welcomeSection: {
    marginBottom: '32px'
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  welcomeText: {
    fontSize: '16px',
    color: '#6b7280'
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  actionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: '#3b82f6',
    borderRadius: '12px',
    textDecoration: 'none',
    color: '#fff',
    transition: 'transform 0.2s'
  },
  actionIcon: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  actionText: {
    fontSize: '16px',
    fontWeight: '600'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statIcon: {
    fontSize: '28px'
  },
  statNumber: {
    display: 'block',
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280'
  },
  recentSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '20px'
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px'
  },
  complaintList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  complaintItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  complaintIcon: {
    fontSize: '24px'
  },
  complaintInfo: {
    flex: 1
  },
  complaintTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  complaintMeta: {
    fontSize: '13px',
    color: '#6b7280'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  }
};

export default Dashboard;
