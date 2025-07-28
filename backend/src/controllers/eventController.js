const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');

// Get all events (public)
exports.getAllEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const {
      category,
      type,
      status,
      startDate,
      endDate,
      search,
      latitude,
      longitude,
      maxDistance
    } = req.query;
    
    let query = { status: 'published' };
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        query.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startDate.$lte = new Date(endDate);
      }
    }
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    let eventsQuery = Event.find(query)
      .populate('organizer', 'firstName lastName')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);
    
    // Add geospatial query if coordinates provided
    if (latitude && longitude) {
      const distance = maxDistance || 50000; // Default 50km
      eventsQuery = Event.find({
        ...query,
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: distance
          }
        }
      })
        .populate('organizer', 'firstName lastName')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit);
    }
    
    const events = await eventsQuery;
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

// Get event by ID
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email phone')
      .populate('attendees.user', 'firstName lastName')
      .populate('volunteers.user', 'firstName lastName');
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create event (authenticated users only)
exports.createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user.id
    };
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'startDate', 'endDate', 'capacity'];
    const missingFields = requiredFields.filter(field => !eventData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const event = await Event.create(eventData);
    
    await event.populate('organizer', 'firstName lastName email');
    
    res.status(201).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update event
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update events you organized'
      });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName');
    
    res.status(200).json({
      status: 'success',
      data: {
        event: updatedEvent
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete events you organized'
      });
    }
    
    // Don't allow deletion if event has started or has attendees
    if (event.startDate <= new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete events that have already started'
      });
    }
    
    if (event.attendees.length > 0 || event.volunteers.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete events with registered attendees or volunteers'
      });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Register for event
exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    if (event.status !== 'published') {
      return res.status(400).json({
        status: 'error',
        message: 'Event is not open for registration'
      });
    }
    
    if (!event.registrationOpen) {
      return res.status(400).json({
        status: 'error',
        message: 'Registration is closed for this event'
      });
    }
    
    try {
      await event.registerUser(req.user.id, false);
      
      res.status(200).json({
        status: 'success',
        message: 'Successfully registered for event',
        data: {
          event
        }
      });
    } catch (registrationError) {
      return res.status(400).json({
        status: 'error',
        message: registrationError.message
      });
    }
  } catch (error) {
    next(error);
  }
};

// Register as volunteer
exports.registerAsVolunteer = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    if (event.status !== 'published') {
      return res.status(400).json({
        status: 'error',
        message: 'Event is not open for volunteer registration'
      });
    }
    
    try {
      await event.registerUser(req.user.id, true);
      
      res.status(200).json({
        status: 'success',
        message: 'Successfully registered as volunteer',
        data: {
          event
        }
      });
    } catch (registrationError) {
      return res.status(400).json({
        status: 'error',
        message: registrationError.message
      });
    }
  } catch (error) {
    next(error);
  }
};

// Unregister from event
exports.unregisterFromEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Remove from attendees
    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.toString() === req.user.id
    );
    
    // Remove from volunteers
    const volunteerIndex = event.volunteers.findIndex(
      volunteer => volunteer.user.toString() === req.user.id
    );
    
    if (attendeeIndex === -1 && volunteerIndex === -1) {
      return res.status(400).json({
        status: 'error',
        message: 'You are not registered for this event'
      });
    }
    
    // Check if event has already started
    if (event.startDate <= new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot unregister from events that have already started'
      });
    }
    
    if (attendeeIndex !== -1) {
      event.attendees.splice(attendeeIndex, 1);
      if (event.attendees[attendeeIndex]?.status === 'registered') {
        event.registeredCount -= 1;
      }
    }
    
    if (volunteerIndex !== -1) {
      event.volunteers.splice(volunteerIndex, 1);
    }
    
    await event.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Successfully unregistered from event',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};