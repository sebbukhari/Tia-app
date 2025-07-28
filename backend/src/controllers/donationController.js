const { validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create donation
exports.createDonation = async (req, res, next) => {
  try {
    const {
      amount,
      currency,
      type,
      category,
      campaign,
      isAnonymous,
      message,
      dedicatedTo,
      paymentMethodId
    } = req.body;
    
    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Donation amount must be at least $1'
      });
    }
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/payment-success`,
      metadata: {
        userId: req.user.id,
        type: type || 'one-time',
        category: category || 'general'
      }
    });
    
    // Create donation record
    const donation = await Donation.create({
      user: req.user.id,
      amount,
      currency: currency || 'USD',
      type: type || 'one-time',
      category: category || 'general',
      campaign,
      stripePaymentIntentId: paymentIntent.id,
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
      paymentMethod: 'card',
      isAnonymous: isAnonymous || false,
      message,
      dedicatedTo,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        source: 'mobile_app'
      }
    });
    
    // Update user's total donated amount if completed
    if (paymentIntent.status === 'succeeded') {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { totalDonated: amount }
      });
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        donation,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          clientSecret: paymentIntent.client_secret
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user donations
exports.getUserDonations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const type = req.query.type;
    
    let query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('campaign', 'title description');
    
    const total = await Donation.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    // Get donation statistics for this user
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

// Get donation by ID
exports.getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('campaign', 'title description');
    
    if (!donation) {
      return res.status(404).json({
        status: 'error',
        message: 'Donation not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        donation
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel donation (for recurring donations)
exports.cancelDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!donation) {
      return res.status(404).json({
        status: 'error',
        message: 'Donation not found'
      });
    }
    
    if (donation.type === 'one-time') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot cancel a one-time donation'
      });
    }
    
    if (donation.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: 'Donation is already cancelled'
      });
    }
    
    // Cancel subscription in Stripe if it exists
    if (donation.recurringSchedule?.subscriptionId) {
      try {
        await stripe.subscriptions.cancel(donation.recurringSchedule.subscriptionId);
      } catch (stripeError) {
        console.error('Stripe subscription cancellation error:', stripeError);
        // Continue with local cancellation even if Stripe fails
      }
    }
    
    // Update donation status
    donation.status = 'cancelled';
    donation.recurringSchedule.isActive = false;
    await donation.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Donation cancelled successfully',
      data: {
        donation
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get public donation statistics
exports.getPublicStats = async (req, res, next) => {
  try {
    const period = req.query.period || 'all';
    
    const stats = await Donation.getDonationStats(null, period);
    
    // Get top donation categories
    const categoryStats = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 }
    ]);
    
    // Get recent donations (anonymized)
    const recentDonations = await Donation.find({
      status: 'completed',
      isAnonymous: false
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstName lastName')
      .select('amount currency category message createdAt user');
    
    res.status(200).json({
      status: 'success',
      data: {
        stats,
        categoryStats,
        recentDonations
      }
    });
  } catch (error) {
    next(error);
  }
};