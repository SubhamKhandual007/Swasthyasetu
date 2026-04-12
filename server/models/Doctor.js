const mongoose = require('mongoose');

const DrAuthSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  contact: { type: String, required: true, unique: true },
  experience: { type: Number, required: true },
  currenthospital: { type: String, required: true },
  address: { type: String, required: true }
});

module.exports = mongoose.model("Doctors", DrAuthSchema);