const express = require('express');
const authMiddleware = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/preferences', userController.updatePreferences);
router.get('/donations', userController.getDonationHistory);
router.get('/events', userController.getUserEvents);
router.delete('/account', userController.deactivateAccount);

module.exports = router;