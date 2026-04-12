const mongoose = require('mongoose');

const BloodTestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  tests: [{
    name: String,
    price: Number
  }],
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  reportReadyAt: {
    type: Date,
    required: true
  },
  reportData: {
    rbc: String,
    wbc: String,
    platelets: String,
    hemoglobin: String,
    glucose: String,
    cholesterol: String
  },
  location: {
    latitude: String,
    longitude: String,
    address: String
  },
  labName: String
}, { timestamps: true });

module.exports = mongoose.model('BloodTest', BloodTestSchema);
