const express = require('express');
const authMiddleware = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Stripe webhook (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

// Protected routes
router.use(authMiddleware);

router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/confirm-payment', paymentController.confirmPayment);
router.get('/payment-methods', paymentController.getPaymentMethods);
router.post('/payment-methods', paymentController.addPaymentMethod);
router.delete('/payment-methods/:id', paymentController.removePaymentMethod);

module.exports = router;