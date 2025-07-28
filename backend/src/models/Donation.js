const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for donation']
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [1, 'Donation amount must be at least $1']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  type: {
    type: String,
    enum: ['one-time', 'monthly', 'yearly'],
    default: 'one-time'
  },
  category: {
    type: String,
    enum: ['general', 'education', 'healthcare', 'emergency', 'environment', 'food', 'shelter'],
    default: 'general'
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  stripeChargeId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'apple_pay', 'google_pay'],
    default: 'card'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    trim: true
  },
  dedicatedTo: {
    name: String,
    email: String,
    message: String
  },
  recurringSchedule: {
    frequency: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: function() { return this.type !== 'one-time'; }
    },
    nextPaymentDate: {
      type: Date,
      required: function() { return this.type !== 'one-time'; }
    },
    subscriptionId: String,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  receipt: {
    receiptNumber: {
      type: String,
      unique: true
    },
    taxDeductible: {
      type: Boolean,
      default: true
    },
    receiptUrl: String,
    emailSent: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      enum: ['mobile_app', 'website', 'email_campaign', 'social_media'],
      default: 'mobile_app'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted amount
donationSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Index for better performance
donationSchema.index({ user: 1, createdAt: -1 });
donationSchema.index({ status: 1 });
donationSchema.index({ type: 1 });
donationSchema.index({ stripePaymentIntentId: 1 });
donationSchema.index({ 'receipt.receiptNumber': 1 });

// Pre-save middleware to generate receipt number
donationSchema.pre('save', async function(next) {
  if (!this.receipt.receiptNumber && this.status === 'completed') {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.receipt.receiptNumber = `TIA-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Static method to get donation statistics
donationSchema.statics.getDonationStats = async function(userId = null, period = 'all') {
  const matchStage = { status: 'completed' };
  
  if (userId) {
    matchStage.user = new mongoose.Types.ObjectId(userId);
  }
  
  if (period !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    matchStage.createdAt = { $gte: startDate };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
        maxAmount: { $max: '$amount' },
        minAmount: { $min: '$amount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalAmount: 0,
    totalDonations: 0,
    avgAmount: 0,
    maxAmount: 0,
    minAmount: 0
  };
};

module.exports = mongoose.model('Donation', donationSchema);