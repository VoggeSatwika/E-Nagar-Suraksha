const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');
const { validationResult } = require('express-validator');

// @desc    Submit a new complaint (Citizen)
// @route   POST /api/complaints
// @access  Private (Citizen)
exports.createComplaint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, category, location, priority, isAnonymous } = req.body;

    // Parse location if it's a string
    let locationData = location;
    if (typeof location === 'string') {
      locationData = JSON.parse(location);
    }

    // Create complaint
    const complaint = await Complaint.create({
      user: req.user.id,
      title,
      description,
      category,
      priority: priority || 'medium',
      location: {
        type: 'Point',
        coordinates: [locationData.longitude, locationData.latitude],
        address: locationData.address,
        city: locationData.city || '',
        state: locationData.state || '',
        pincode: locationData.pincode || ''
      },
      photos: req.files ? req.files.map(file => `/uploads/${file.filename}`) : [],
      isAnonymous: isAnonymous || false
    });

    // Populate user details
    await complaint.populate('user', 'name email phone');

    // Emit socket event for real-time notification
    if (req.io) {
      req.io.emit('complaintCreated', {
        complaint: {
          id: complaint._id,
          title: complaint.title,
          category: complaint.category,
          status: complaint.status,
          createdAt: complaint.createdAt
        }
      });
    }

    res.status(201).json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('CreateComplaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating complaint'
    });
  }
};

// @desc    Get current user's complaints
// @route   GET /api/complaints/my-complaints
// @access  Private
exports.getMyComplaints = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate('assignedDepartment', 'name code type')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Complaint.countDocuments(query);

    res.json({
      success: true,
      complaints,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('GetMyComplaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('assignedDepartment', 'name code type')
      .populate('assignedTo', 'name email phone')
      .populate('statusHistory.updatedBy', 'name role')
      .populate('resolution.resolvedBy', 'name');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user has access to this complaint
    const isOwner = complaint.user._id.toString() === req.user.id;
    const isAssigned = complaint.assignedTo && complaint.assignedTo._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this complaint'
      });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('GetComplaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/update
// @access  Private (Officer/Admin)
exports.updateComplaint = async (req, res) => {
  try {
    const { status, comment } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check authorization
    const isAssigned = complaint.assignedTo && complaint.assignedTo.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this complaint'
      });
    }

    // Update status
    complaint.status = status;
    complaint.statusHistory.push({
      status,
      comment,
      updatedBy: req.user.id
    });

    // If resolving, add resolution details
    if (status === 'resolved') {
      complaint.resolution = {
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
        comment
      };
    }

    await complaint.save();

    // Populate for response
    await complaint.populate('user', 'name email phone');
    await complaint.populate('assignedTo', 'name');
    await complaint.populate('statusHistory.updatedBy', 'name role');

    // Emit socket event
    if (req.io) {
      req.io.emit('complaintUpdated', {
        complaintId: complaint._id,
        status: complaint.status,
        userId: complaint.user._id
      });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('UpdateComplaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all complaints (Admin view)
// @route   GET /api/complaints/all
// @access  Private (Admin/Officer)
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, department, page = 1, limit = 20 } = req.query;

    const query = {};

    // Officers see only their assigned complaints
    if (req.user.role === 'police' || req.user.role === 'municipal') {
      query.assignedTo = req.user.id;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (department) query.assignedDepartment = department;

    const complaints = await Complaint.find(query)
      .populate('user', 'name email phone')
      .populate('assignedDepartment', 'name code type')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Complaint.countDocuments(query);

    // Get statistics
    const stats = await Complaint.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      complaints,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
      stats
    });
  } catch (error) {
    console.error('GetAllComplaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Assign complaint to department/officer
// @route   POST /api/complaints/:id/assign
// @access  Private (Admin)
exports.assignComplaint = async (req, res) => {
  try {
    const { departmentId, officerId, dueDate } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update assignment
    if (departmentId) {
      complaint.assignedDepartment = departmentId;
    }
    if (officerId) {
      complaint.assignedTo = officerId;
    }
    if (dueDate) {
      complaint.dueDate = dueDate;
    }

    // Update status if not already assigned
    if (complaint.status === 'pending') {
      complaint.status = 'assigned';
      complaint.statusHistory.push({
        status: 'assigned',
        comment: 'Complaint assigned to department',
        updatedBy: req.user.id
      });
    }

    await complaint.save();

    // Populate for response
    await complaint.populate('user', 'name email phone');
    await complaint.populate('assignedDepartment', 'name code type');
    await complaint.populate('assignedTo', 'name email');

    // Emit socket event
    if (req.io) {
      req.io.emit('complaintAssigned', {
        complaintId: complaint._id,
        assignedTo: complaint.assignedTo,
        status: complaint.status
      });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('AssignComplaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add feedback/rating to resolved complaint
// @route   PUT /api/complaints/:id/feedback
// @access  Private (Citizen)
exports.addFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check ownership
    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if complaint is resolved
    if (complaint.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate resolved complaints'
      });
    }

    complaint.resolution.rating = rating;
    complaint.resolution.feedback = feedback;
    await complaint.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('AddFeedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get complaints by location (nearby)
// @route   GET /api/complaints/nearby
// @access  Private
exports.getNearbyComplaints = async (req, res) => {
  try {
    const { longitude, latitude, radius = 5000 } = req.query;

    const complaints = await Complaint.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
      .populate('user', 'name')
      .limit(20);

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('GetNearbyComplaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
