const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  bloodType: { type: String, required: true, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  quantity: { type: Number, required: true },
  patientName: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  priority: { type: String, default: 'Normal' },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending', enum: ["Pending", "PartiallyFulfilled", "Fulfilled", "Accessed", "Completed", "Approved", "Not Available"] },
  allocatedFrom: [{
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Blood", required: true },
    bloodType: { type: String, required: true, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    quantity: { type: Number, required: true }
  }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional, for notifications
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);