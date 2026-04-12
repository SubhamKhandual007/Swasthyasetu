const express = require('express');
const router = express.Router();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe = null;

if (stripeSecretKey) {
  stripe = require('stripe')(stripeSecretKey);
} else {
  console.warn("WARNING: STRIPE_SECRET_KEY is not defined. Stripe functionality will be disabled.");
}

const Order = require('../models/Order');
const Medicine = require('../models/Medicine');

// @route   POST /api/orders/create-payment-intent
// @desc    Create a payment intent for checkout
// @access  Public (should optionally be authenticated)
router.post('/create-payment-intent', async (req, res) => {
  const { items, userId, userModel } = req.body;

  try {
    // 1. Calculate order total on the backend to prevent tampering
    let totalAmount = 0;
    const orderItems = [];

    for (let item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        // Fallback for mock/JSON medicines if they weren't seeded yet
        if (item.medicineId.startsWith('med_')) {
          orderItems.push({
            medicine: item.medicineId,
            name: "Mock Medicine " + item.medicineId,
            quantity: item.quantity,
            price: 100 // Default fallback price
          });
          totalAmount += 100 * item.quantity;
          continue;
        }
        return res.status(404).json({ msg: `Medicine with ID ${item.medicineId} not found` });
      }
      
      // Real price from DB
      const itemTotal = medicine.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        medicine: medicine._id,
        name: medicine.name,
        quantity: item.quantity,
        price: medicine.price
      });
    }

    // Stripe expects amount in cents/smallest currency unit
    const amountInCents = Math.round(totalAmount * 100);

    // 2. Create PaymentIntent
    if (!stripe) {
      console.error("Stripe is not initialized. Cannot create payment intent.");
      return res.status(500).json({ error: "Payment service is currently unavailable. Please contact support." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'inr', // Change to usd, eur, or other if needed; INR is often appropriate in India context
      payment_method_types: ['card'], // explicitly state card only to disable link by default
      metadata: {
        userId: userId || 'guest',
        userModel: userModel || 'patient'
      }
    });

    // 3. Send client secret back to frontend
    res.json({
      clientSecret: paymentIntent.client_secret,
      totalAmount: totalAmount,
      orderItems: orderItems
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/orders
// @desc    Create an order after successful payment intent or confirmation
// @access  Public (requires intent validation in a real app)
router.post('/', async (req, res) => {
  const { userId, userModel, items, totalAmount, paymentIntentId, shippingAddress } = req.body;

  try {
    const newOrder = new Order({
      userId: userId || '651abcd1234abcd1234abcd1', // generic fallback id if none provided
      userModel: userModel || 'patient', // generic fallback
      items,
      totalAmount,
      status: paymentIntentId ? 'Paid' : 'Pending',
      paymentIntentId,
      shippingAddress
    });

    const order = await newOrder.save();

    // Decrease medicine stock (optional extra step)
    for (let item of items) {
      if (item.medicine && !item.medicine.startsWith('med_')) {
        await Medicine.findByIdAndUpdate(item.medicine, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/orders
// @desc    Get all orders (admin view)
// @access  Admin Placeholder
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/orders/user/:userId
// @desc    Get orders by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Admin Placeholder
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
