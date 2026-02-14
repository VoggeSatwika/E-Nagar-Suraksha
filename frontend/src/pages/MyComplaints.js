import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import { getStatusDetails, getCategoryIcon, formatDate, CATEGORIES, STATUS } from '../utils/constants';

const MyComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchComplaints();
  }, [filter, page]);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getMyComplaints({
        status: filter.status || undefined,
        category: filter.category || undefined,
        page,
        limit: 10
      });
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Complaints</h1>
        <p style={styles.subtitle}>Track and manage your submitted complaints</p>
      </div>

      <div style={styles.filters}>
        <select
          value={filter.status}
          onChange={(e) => { setFilter({ ...filter, status: e.target.value }); setPage(1); }}
          style={styles.select}
        >
          <option value="">All Status</option>
          {Object.entries(STATUS).map(([key, value]) => (
            <option key={key} value={key}>{value.icon} {value.label}</option>
          ))}
        </select>

        <select
          value={filter.category}
          onChange={(e) => { setFilter({ ...filter, category: e.target.value }); setPage(1); }}
          style={styles.select}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div style={styles.empty}>
          <p>No complaints found</p>
        </div>
      ) : (
        <div style={styles.complaintList}>
          {complaints.map(complaint => (
            <div
              key={complaint._id}
              style={styles.complaintCard}
              onClick={() => navigate(`/complaint/${complaint._id}`)}
            >
              <div style={styles.cardHeader}>
                <span style={styles.categoryIcon}>{getCategoryIcon(complaint.category)}</span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusDetails(complaint.status).color + '20',
                  color: getStatusDetails(complaint.status).color
                }}>
                  {getStatusDetails(complaint.status).label}
                </span>
              </div>

              <h3 style={styles.complaintTitle}>{complaint.title}</h3>
              <p style={styles.complaintDesc}>{complaint.description}</p>

              <div style={styles.cardFooter}>
                <span style={styles.metaItem}>
                  📍 {complaint.location?.address || 'Location not specified'}
                </span>
                <span style={styles.metaItem}>
                  📅 {formatDate(complaint.createdAt)}
                </span>
              </div>

              {complaint.photos && complaint.photos.length > 0 && (
                <div style={styles.photoCount}>
                  📷 {complaint.photos.length} photo(s) attached
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={styles.pagination}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          style={styles.pageBtn}
        >
          Previous
        </button>
        <span style={styles.pageInfo}>Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={complaints.length < 10}
          style={styles.pageBtn}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280'
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  select: {
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fff'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    color: '#6b7280'
  },
  complaintList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  complaintCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  categoryIcon: {
    fontSize: '24px'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  complaintTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px'
  },
  complaintDesc: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  cardFooter: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  metaItem: {
    fontSize: '13px',
    color: '#6b7280'
  },
  photoCount: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#3b82f6'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '32px'
  },
  pageBtn: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  pageInfo: {
    fontSize: '14px',
    color: '#6b7280'
  }
};

export default MyComplaints;
