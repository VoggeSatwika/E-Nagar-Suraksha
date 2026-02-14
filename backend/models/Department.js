const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide department name'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Please provide department code'],
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['police', 'municipal', 'other'],
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  contactEmail: {
    type: String,
    lowercase: true
  },
  contactPhone: {
    type: String
  },
  address: {
    type: String
  },
  // Jurisdiction area
  jurisdiction: {
    city: String,
    state: String,
    pincode: [String]
  },
  // Head of department
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Staff members
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Operating hours
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  // Categories handled by this department
  handledCategories: [{
    type: String,
    enum: [
      'road_issue',
      'garbage',
      'security',
      'water',
      'streetlight',
      'drainage',
      'noise_pollution',
      'illegal_construction',
      'other'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
departmentSchema.index({ type: 1 });
departmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Department', departmentSchema);
