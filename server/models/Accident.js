const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
  location: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['Pending', 'Assigning', 'Ambulance Enroute', 'Near You', 'Reached', 'Completed'], default: 'Pending' },
  time: { type: Date, default: Date.now },
  coordinates: {
    lat: Number,
    lng: Number
  },
  ambulanceId: String,
  eta: String,
  statusTimeline: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  trackingToken: { type: String, unique: true }
});

module.exports = mongoose.model('Accident', accidentSchema);