const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize, isAdmin } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Departments
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);

// Officers
router.get('/officers/:departmentType', adminController.getOfficersByDepartment);

// Seed data (for development)
router.post('/seed', adminController.seedData);

module.exports = router;
