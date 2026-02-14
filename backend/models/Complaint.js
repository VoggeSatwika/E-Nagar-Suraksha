const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
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
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Location - Geo tagging
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    pincode: {
      type: String,
      default: ''
    }
  },
  // Photo upload
  photos: [{
    type: String
  }],
  // Department assignment
  assignedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Status timeline
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected']
    },
    comment: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Resolution details
  resolution: {
    comment: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },
  // Admin notes
  adminNotes: {
    type: String
  },
  // Due date for resolution
  dueDate: {
    type: Date
  },
  // Anonymous complaint
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for geospatial queries
complaintSchema.index({ 'location': '2dsphere' });

// Index for faster queries
complaintSchema.index({ status: 1, category: 1 });
complaintSchema.index({ user: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ createdAt: -1 });

// Virtual for status timeline
complaintSchema.virtual('timeline').get(function() {
  return this.statusHistory.sort((a, b) => b.updatedAt - a.updatedAt);
});

// Add initial status to history
complaintSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: 'pending',
      comment: 'Complaint submitted',
      updatedAt: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
