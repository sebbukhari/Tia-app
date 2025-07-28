const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['fundraising', 'awareness', 'volunteer', 'community', 'education', 'health', 'environment'],
    required: [true, 'Event category is required']
  },
  type: {
    type: String,
    enum: ['in-person', 'virtual', 'hybrid'],
    default: 'in-person'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(date) {
        return date > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  registrationDeadline: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date <= this.startDate;
      },
      message: 'Registration deadline must be before or on start date'
    }
  },
  location: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    virtualLink: String,
    instructions: String
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required']
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1'],
    required: [true, 'Event capacity is required']
  },
  registeredCount: {
    type: Number,
    default: 0,
    min: 0
  },
  price: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    }
  },
  images: [{
    url: String,
    caption: String,
    isMain: { type: Boolean, default: false }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  ageRestriction: {
    minimum: Number,
    maximum: Number
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  registrationRequired: {
    type: Boolean,
    default: true
  },
  allowWaitlist: {
    type: Boolean,
    default: true
  },
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  fundraisingGoal: {
    target: Number,
    current: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  volunteers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    registeredAt: { type: Date, default: Date.now }
  }],
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['registered', 'waitlist', 'attended', 'no-show', 'cancelled'],
      default: 'registered'
    },
    registeredAt: { type: Date, default: Date.now },
    checkedInAt: Date,
    notes: String
  }],
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: { type: Date, default: Date.now }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly']
    },
    interval: Number,
    endDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.capacity - this.registeredCount);
});

// Virtual for event duration
eventSchema.virtual('duration').get(function() {
  return this.endDate - this.startDate;
});

// Virtual for registration status
eventSchema.virtual('registrationOpen').get(function() {
  const now = new Date();
  return this.status === 'published' && 
         (!this.registrationDeadline || now <= this.registrationDeadline) &&
         (this.availableSpots > 0 || this.allowWaitlist);
});

// Index for better performance
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ 'location.coordinates': '2dsphere' });

// Static method to find nearby events
eventSchema.statics.findNearby = function(latitude, longitude, maxDistance = 50000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    status: 'published',
    startDate: { $gte: new Date() }
  });
};

// Method to register user for event
eventSchema.methods.registerUser = async function(userId, isVolunteer = false) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (isVolunteer) {
    // Check if already registered as volunteer
    const existingVolunteer = this.volunteers.find(v => v.user.toString() === userId);
    if (existingVolunteer) {
      throw new Error('User already registered as volunteer for this event');
    }
    
    this.volunteers.push({ user: userId });
  } else {
    // Check if already registered as attendee
    const existingAttendee = this.attendees.find(a => a.user.toString() === userId);
    if (existingAttendee) {
      throw new Error('User already registered for this event');
    }
    
    const status = this.availableSpots > 0 ? 'registered' : 'waitlist';
    this.attendees.push({ user: userId, status });
    
    if (status === 'registered') {
      this.registeredCount += 1;
    }
  }
  
  return await this.save();
};

module.exports = mongoose.model('Event', eventSchema);