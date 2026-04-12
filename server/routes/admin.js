const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { isAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/stats
 * @desc    Get counts of registered users and doctors
 * @access  Private (Admin only)
 */
router.get('/stats', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const doctorCount = await Doctor.countDocuments();

        res.status(200).json({
            success: true,
            stats: {
                totalUsers: userCount,
                totalDoctors: doctorCount
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all registered users
 * @access  Private (Admin only)
 */
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route   GET /api/admin/doctors
 * @desc    Get all registered doctors
 * @access  Private (Admin only)
 */
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
