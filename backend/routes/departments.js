const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/auth');

// Get all active departments
router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .select('name code type description contactEmail contactPhone handledCategories');
    
    res.json({
      success: true,
      departments
    });
  } catch (error) {
    console.error('GetDepartments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get department by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name email phone')
      .populate('staff', 'name email phone');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      department
    });
  } catch (error) {
    console.error('GetDepartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get departments by type
router.get('/type/:type', protect, async (req, res) => {
  try {
    const { type } = req.params;
    
    const departments = await Department.find({ 
      type, 
      isActive: true 
    }).select('name code handledCategories');
    
    res.json({
      success: true,
      departments
    });
  } catch (error) {
    console.error('GetDepartmentsByType error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
