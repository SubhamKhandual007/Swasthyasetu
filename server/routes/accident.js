const express = require('express');
const router = express.Router();
const Accident = require('../models/Accident');

const crypto = require('crypto');

router.post('/accidents', async (req, res) => {
  const { location, description, city, state, lat, lng } = req.body;
  try {
    const trackingToken = crypto.randomBytes(16).toString('hex');
    const newAccident = new Accident({ 
      location, 
      description, 
      city, 
      state,
      coordinates: { lat, lng },
      status: 'Pending',
      statusTimeline: [{ status: 'Pending' }],
      trackingToken
    });
    await newAccident.save();
    res.status(201).json(newAccident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving accident' });
  }
});

router.get('/accidents', async (_req, res) => {
  try {
    const accidents = await Accident.find().sort({ time: -1 });
    res.json({ accidents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching accidents' });
  }
});

// Public tracking route
router.get('/track/:token', async (req, res) => {
  try {
    const accident = await Accident.findOne({ trackingToken: req.params.token });
    if (!accident) {
      return res.status(404).json({ message: 'Tracking session not found' });
    }
    res.json(accident);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tracking data' });
  }
});

router.put('/accidents/:id', async (req, res) => {
  const { status, lat, lng, eta } = req.body;
  const { id } = req.params;

  const validStatuses = ['Pending', 'Assigning', 'Ambulance Enroute', 'Near You', 'Reached', 'Completed'];

  try {
    const updateData = {};
    if (status && validStatuses.includes(status)) {
      updateData.status = status;
      updateData.$push = { statusTimeline: { status, timestamp: new Date() } };
    }
    if (lat !== undefined && lng !== undefined) {
      updateData.coordinates = { lat, lng };
    }
    if (eta) {
      updateData.eta = eta;
    }

    const accident = await Accident.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!accident) {
      return res.status(404).json({ error: 'Accident not found' });
    }

    res.status(200).json(accident);
  } catch (err) {
    console.error('Error updating accident:', err);
    res.status(500).json({ error: 'Failed to update the accident' });
  }
});

module.exports = router;