const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    // Total complaints
    const totalComplaints = await Complaint.countDocuments();

    // Complaints by status
    const statusStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Complaints by category
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Complaints by priority
    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Today's complaints
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayComplaints = await Complaint.countDocuments({
      createdAt: { $gte: today }
    });

    // This week's complaints
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekComplaints = await Complaint.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Resolved complaints
    const resolvedComplaints = await Complaint.countDocuments({
      status: 'resolved'
    });

    // Pending complaints
    const pendingComplaints = await Complaint.countDocuments({
      status: 'pending'
    });

    // Average resolution time (for resolved complaints)
    const resolvedWithTime = await Complaint.find({
      status: 'resolved',
      resolution: { $exists: true }
    });

    let avgResolutionTime = 0;
    if (resolvedWithTime.length > 0) {
      const totalTime = resolvedWithTime.reduce((sum, c) => {
        const created = new Date(c.createdAt).getTime();
        const resolved = new Date(c.resolution.resolvedAt).getTime();
        return sum + (resolved - created);
      }, 0);
      avgResolutionTime = totalTime / resolvedWithTime.length / (1000 * 60 * 60 * 24); // in days
    }

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent complaints
    const recentComplaints = await Complaint.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent resolved
    const recentResolved = await Complaint.find({ status: 'resolved' })
      .populate('user', 'name')
      .populate('resolution.resolvedBy', 'name')
      .sort({ 'resolution.resolvedAt': -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        total: totalComplaints,
        today: todayComplaints,
        thisWeek: weekComplaints,
        resolved: resolvedComplaints,
        pending: pendingComplaints,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        byStatus: statusStats,
        byCategory: categoryStats,
        byPriority: priorityStats,
        byUserRole: userStats,
        recentComplaints,
        recentResolved
      }
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get officers by department
// @route   GET /api/admin/officers/:departmentType
// @access  Private (Admin)
exports.getOfficersByDepartment = async (req, res) => {
  try {
    const { departmentType } = req.params;

    const officers = await User.find({
      role: departmentType,
      isActive: true
    }).select('name email phone department');

    res.json({
      success: true,
      officers
    });
  } catch (error) {
    console.error('GetOfficersByDepartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private (Admin)
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('head', 'name')
      .populate('staff', 'name');

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
};

// @desc    Create department
// @route   POST /api/admin/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, type, description, contactEmail, contactPhone, address, handledCategories } = req.body;

    const department = await Department.create({
      name,
      code,
      type,
      description,
      contactEmail,
      contactPhone,
      address,
      handledCategories
    });

    res.status(201).json({
      success: true,
      department
    });
  } catch (error) {
    console.error('CreateDepartment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get complaint analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    let groupFormat;
    switch (groupBy) {
      case 'month':
        groupFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        break;
      case 'year':
        groupFormat = { year: { $year: '$createdAt' } };
        break;
      default: // day
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const timeline = await Complaint.aggregate([
      {
        $match: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Category-wise resolution time
    const resolutionByCategory = await Complaint.aggregate([
      { $match: { status: 'resolved' } },
      {
        $project: {
          category: 1,
          resolutionTime: {
            $subtract: ['$resolution.resolvedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: '$category',
          avgTime: { $avg: '$resolutionTime' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Transform resolution time from milliseconds to days
    const categoryStats = resolutionByCategory.map(item => ({
      category: item._id,
      avgDays: Math.round(item.avgTime / (1000 * 60 * 60 * 24) * 10) / 10,
      count: item.count
    }));

    res.json({
      success: true,
      timeline,
      categoryStats
    });
  } catch (error) {
    console.error('GetAnalytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Seed initial data
// @route   POST /api/admin/seed
// @access  Private (Admin)
exports.seedData = async (req, res) => {
  try {
    // Create default departments
    const departments = await Department.insertMany([
      {
        name: 'Police Department',
        code: 'POLICE',
        type: 'police',
        description: 'Handle security and safety related complaints',
        handledCategories: ['security', 'illegal_construction', 'noise_pollution', 'other']
      },
      {
        name: 'Municipal Corporation',
        code: 'MUNICIPAL',
        type: 'municipal',
        description: 'Handle municipal services like roads, garbage, water, etc.',
        handledCategories: ['road_issue', 'garbage', 'water', 'streetlight', 'drainage', 'other']
      }
    ]);

    // Create admin user if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@enagarsuraksha.gov',
        phone: '9999999999',
        password: 'admin123',
        role: 'admin'
      });
    }

    // Create sample officers
    const policeDept = departments.find(d => d.type === 'police');
    const municipalDept = departments.find(d => d.type === 'municipal');

    const sampleUsers = [
      {
        name: 'Police Officer',
        email: 'police@enagarsuraksha.gov',
        phone: '8888888888',
        password: 'police123',
        role: 'police',
        department: policeDept._id
      },
      {
        name: 'Municipal Officer',
        email: 'municipal@enagarsuraksha.gov',
        phone: '7777777777',
        password: 'municipal123',
        role: 'municipal',
        department: municipalDept._id
      },
      {
        name: 'John Citizen',
        email: 'john@example.com',
        phone: '6666666666',
        password: 'citizen123',
        role: 'citizen'
      }
    ];

    for (const userData of sampleUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData);
      }
    }

    res.json({
      success: true,
      message: 'Seed data created successfully',
      departments: departments.length,
      message2: 'Default credentials: admin@enagarsuraksha.gov / admin123'
    });
  } catch (error) {
    console.error('SeedData error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
