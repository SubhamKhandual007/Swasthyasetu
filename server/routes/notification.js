const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// @route   GET api/notifications/:userId
// @desc    Get all notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate if userId is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn(`Invalid userId received: ${userId}`);
      return res.json([]); // Return empty array for invalid IDs instead of crashing
    }

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Error in GET /api/notifications/:userId:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/user/:userId/read-all
// @desc    Mark all notifications as read for a user
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.params.userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/notifications/:id
// @desc    Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Notification removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/notifications
// @desc    Create a notification (Internal or Admin use)
router.post('/', async (req, res) => {
  const { recipient, recipientModel, type, title, message, data } = req.body;
  try {
    const newNotification = new Notification({
      recipient,
      recipientModel,
      type,
      title,
      message,
      data
    });
    const notification = await newNotification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
