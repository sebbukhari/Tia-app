const express = require('express');
const authMiddleware = require('../middleware/auth');
const eventController = require('../controllers/eventController');

const router = express.Router();

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected routes
router.use(authMiddleware);

router.post('/', eventController.createEvent);
router.patch('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/:id/register', eventController.registerForEvent);
router.post('/:id/volunteer', eventController.registerAsVolunteer);
router.delete('/:id/unregister', eventController.unregisterFromEvent);

module.exports = router;