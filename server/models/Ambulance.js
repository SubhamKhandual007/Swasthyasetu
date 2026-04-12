const mongoose = require('mongoose');

const ambulanceSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  type: { type: String, enum: ['BLS', 'ALS', 'Air', 'Government', 'Private'], required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  paramedicName: String,
  status: { type: String, enum: ['Available', 'En Route', 'Busy'], default: 'Available' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  cost: Number, // For private ambulances
  baseHospital: String
}, { timestamps: true });

module.exports = mongoose.model('Ambulance', ambulanceSchema);
