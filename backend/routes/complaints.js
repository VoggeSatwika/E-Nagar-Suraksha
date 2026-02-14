const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const complaintController = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPhoto, handleMulterError } = require('../middleware/multerConfig');

// Validation rules
const complaintValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn([
    'road_issue', 'garbage', 'security', 'water', 'streetlight',
    'drainage', 'noise_pollution', 'illegal_construction', 'other'
  ]).withMessage('Invalid category'),
  body('location').notEmpty().withMessage('Location is required')
];

// Public routes (none for complaints)

// Protected routes
// Citizen: Submit complaint
router.post('/', 
  protect, 
  uploadPhoto, 
  handleMulterError, 
  complaintValidation, 
  complaintController.createComplaint
);

// All authenticated users: Get their complaints
router.get('/my-complaints', protect, complaintController.getMyComplaints);

// Get single complaint
router.get('/:id', protect, complaintController.getComplaint);

// Get nearby complaints
router.get('/nearby/:longitude/:latitude', protect, complaintController.getNearbyComplaints);

// Officer/Admin: Update complaint status
router.put('/:id/update', 
  protect, 
  authorize('police', 'municipal', 'admin'), 
  [
    body('status').isIn(['pending', 'assigned', 'in_progress', 'resolved', 'rejected'])
      .withMessage('Invalid status')
  ],
  complaintController.updateComplaint
);

// Admin: Assign complaint
router.post('/:id/assign', 
  protect, 
  authorize('admin'), 
  complaintController.assignComplaint
);

// Citizen: Add feedback
router.put('/:id/feedback', 
  protect, 
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('feedback').optional()
  ],
  complaintController.addFeedback
);

// Admin: Get all complaints
router.get('/', 
  protect, 
  authorize('admin', 'police', 'municipal'), 
  complaintController.getAllComplaints
);

module.exports = router;
