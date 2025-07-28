const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/Donation');
const User = require('../models/User');

// Create payment intent
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency, metadata } = req.body;
    
    if (!amount || amount < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount must be at least $1'
      });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.user.id,
        ...metadata
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Confirm payment
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment intent ID is required'
      });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update donation status if exists
      const donation = await Donation.findOne({ stripePaymentIntentId: paymentIntentId });
      if (donation && donation.status !== 'completed') {
        donation.status = 'completed';
        donation.stripeChargeId = paymentIntent.latest_charge;
        await donation.save();
        
        // Update user's total donated amount
        await User.findByIdAndUpdate(donation.user, {
          $inc: { totalDonated: donation.amount }
        });
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's payment methods
exports.getPaymentMethods = async (req, res, next) => {
  try {
    // First, ensure user has a Stripe customer ID
    let user = await User.findById(req.user.id);
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        paymentMethods: paymentMethods.data
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add payment method
exports.addPaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment method ID is required'
      });
    }
    
    let user = await User.findById(req.user.id);
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }
    
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    res.status(200).json({
      status: 'success',
      data: {
        paymentMethod
      }
    });
  } catch (error) {
    next(error);
  }
};

// Remove payment method
exports.removePaymentMethod = async (req, res, next) => {
  try {
    const { id: paymentMethodId } = req.params;
    
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    // Verify that this payment method belongs to the user
    const user = await User.findById(req.user.id);
    if (paymentMethod.customer !== user.stripeCustomerId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only remove your own payment methods'
      });
    }
    
    await stripe.paymentMethods.detach(paymentMethodId);
    
    res.status(200).json({
      status: 'success',
      message: 'Payment method removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Stripe webhook handler
exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSucceeded(paymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailed(failedPayment);
        break;
        
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handleRecurringPaymentSucceeded(invoice);
        break;
        
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await handleSubscriptionCancelled(subscription);
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper functions for webhook handling
const handlePaymentSucceeded = async (paymentIntent) => {
  const donation = await Donation.findOne({ 
    stripePaymentIntentId: paymentIntent.id 
  });
  
  if (donation && donation.status !== 'completed') {
    donation.status = 'completed';
    donation.stripeChargeId = paymentIntent.latest_charge;
    await donation.save();
    
    // Update user's total donated amount
    await User.findByIdAndUpdate(donation.user, {
      $inc: { totalDonated: donation.amount }
    });
    
    // TODO: Send confirmation email
    console.log(`Payment succeeded for donation ${donation._id}`);
  }
};

const handlePaymentFailed = async (paymentIntent) => {
  const donation = await Donation.findOne({ 
    stripePaymentIntentId: paymentIntent.id 
  });
  
  if (donation) {
    donation.status = 'failed';
    await donation.save();
    
    // TODO: Send failure notification email
    console.log(`Payment failed for donation ${donation._id}`);
  }
};

const handleRecurringPaymentSucceeded = async (invoice) => {
  if (invoice.subscription) {
    // Handle recurring donation payment
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Find the original donation to get details
    const originalDonation = await Donation.findOne({
      'recurringSchedule.subscriptionId': subscription.id
    });
    
    if (originalDonation) {
      // Create a new donation record for this recurring payment
      const newDonation = await Donation.create({
        user: originalDonation.user,
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency.toUpperCase(),
        type: originalDonation.type,
        category: originalDonation.category,
        campaign: originalDonation.campaign,
        stripePaymentIntentId: invoice.payment_intent,
        status: 'completed',
        paymentMethod: 'card',
        isAnonymous: originalDonation.isAnonymous,
        metadata: {
          source: 'recurring_subscription',
          originalDonationId: originalDonation._id
        }
      });
      
      // Update user's total donated amount
      await User.findByIdAndUpdate(originalDonation.user, {
        $inc: { totalDonated: newDonation.amount }
      });
      
      console.log(`Recurring payment succeeded: ${newDonation._id}`);
    }
  }
};

const handleSubscriptionCancelled = async (subscription) => {
  const donation = await Donation.findOne({
    'recurringSchedule.subscriptionId': subscription.id
  });
  
  if (donation) {
    donation.status = 'cancelled';
    donation.recurringSchedule.isActive = false;
    await donation.save();
    
    console.log(`Subscription cancelled for donation ${donation._id}`);
  }
};