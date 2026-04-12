const express = require('express');
const router = express.Router();
const BloodTest = require('../models/BloodTest');

// Book a blood test
router.post('/book', async (req, res) => {
  try {
    const { userId, patientName, email, tests, reportReadyAt, location, labName } = req.body;
    
    const newTest = new BloodTest({
      userId,
      patientName,
      email,
      tests,
      reportReadyAt: new Date(reportReadyAt),
      location,
      labName,
      status: 'Pending'
    });

    await newTest.save();
    res.status(201).json({ message: 'Blood test booked successfully', test: newTest });
  } catch (error) {
    console.error('Error booking blood test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tests for a user
router.get('/my-tests/:userId', async (req, res) => {
  try {
    const tests = await BloodTest.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
