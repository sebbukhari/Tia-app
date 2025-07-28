const { validationResult } = require('express-validator');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Event = require('../models/Event');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('totalDonated')
      .populate('volunteerHours');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'dateOfBirth',
      'address',
      'profileImage'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({
        status: 'error',
        message: 'Preferences are required'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user donation history
exports.getDonationHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const donations = await Donation.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('campaign', 'title description');
    
    const total = await Donation.countDocuments({ user: req.user.id });
    const totalPages = Math.ceil(total / limit);
    
    // Get donation statistics
    const stats = await Donation.getDonationStats(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        donations,
        stats,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user events (registered and volunteering)
exports.getUserEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type || 'all'; // 'registered', 'volunteering', 'all'
    
    let query = {};
    
    if (type === 'registered') {
      query = { 'attendees.user': req.user.id };
    } else if (type === 'volunteering') {
      query = { 'volunteers.user': req.user.id };
    } else {
      query = {
        $or: [
          { 'attendees.user': req.user.id },
          { 'volunteers.user': req.user.id }
        ]
      };
    }
    
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate('organizer', 'firstName lastName');
    
    const total = await Event.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      status: 'success',
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Deactivate user account
exports.deactivateAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required to deactivate account'
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Verify password
    if (!(await user.comparePassword(password))) {
      return res.status(400).json({
        status: 'error',
        message: 'Incorrect password'
      });
    }
    
    // Deactivate account
    user.isActive = false;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};