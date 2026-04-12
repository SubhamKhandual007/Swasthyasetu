const mongoose = require('mongoose');

const ambulanceBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Optional for guest bookings
  patientName: String,
  ambulanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance', required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Dispatched', 'Near You', 'Reached', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  location: String, // Text address
  coordinates: {
    lat: Number,
    lng: Number
  },
  hospital: String,
  urgency: String,
  ambulanceType: String,
  paymentMethod: String,
  trackingToken: { type: String, unique: true, required: true },
  eta: String,
  statusTimeline: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('AmbulanceBooking', ambulanceBookingSchema);
