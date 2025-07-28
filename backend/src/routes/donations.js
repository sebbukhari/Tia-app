const express = require('express');
const authMiddleware = require('../middleware/auth');
const donationController = require('../controllers/donationController');

const router = express.Router();

// Public routes
router.get('/stats', donationController.getPublicStats);

// Protected routes
router.use(authMiddleware);

router.post('/', donationController.createDonation);
router.get('/', donationController.getUserDonations);
router.get('/:id', donationController.getDonationById);
router.patch('/:id/cancel', donationController.cancelDonation);

module.exports = router;