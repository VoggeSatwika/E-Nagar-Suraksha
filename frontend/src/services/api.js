import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  getAllUsers: (params) => api.get('/auth/users', { params })
};

// Complaints API
export const complaintAPI = {
  create: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyComplaints: (params) => api.get('/complaints/my-complaints', { params }),
  getComplaint: (id) => api.get(`/complaints/${id}`),
  getAllComplaints: (params) => api.get('/complaints', { params }),
  updateComplaint: (id, data) => api.put(`/complaints/${id}/update`, data),
  assignComplaint: (id, data) => api.post(`/complaints/${id}/assign`, data),
  addFeedback: (id, data) => api.put(`/complaints/${id}/feedback`, data),
  getNearby: (longitude, latitude) => api.get(`/complaints/nearby/${longitude}/${latitude}`)
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  getOfficers: (type) => api.get(`/admin/officers/${type}`),
  seedData: () => api.post('/admin/seed')
};

// Departments API
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  getByType: (type) => api.get(`/departments/type/${type}`)
};

export default api;
