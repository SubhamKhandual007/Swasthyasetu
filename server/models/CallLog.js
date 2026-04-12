const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'AmbulanceBooking', required: true },
  userId: { type: String, required: true }, // Can be userId or name for guests
  driverPhone: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CallLog', callLogSchema);
