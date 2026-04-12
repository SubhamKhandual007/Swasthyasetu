const mongoose = require('mongoose');

const BloodSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ["Donate", "Request", "RequestCheck"] 
  },
  bloodType: { 
    type: String, 
    required: true, 
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] 
  },
  quantity:{
    type:Number,
    required:true,
  },
  donaerName:{
    type:String,
    required:true
  },
  contact:{
    type:String,
    required:true,
  },
  location:{
    type:String,
    required:true,
  },
  lastDonationDate: { 
    type: Date, 
    default: Date.now 
  },
  // Optional request-side fields (kept for backward compatibility)
  priority: { type: String },
  checkedAt: { type: Date },
  available: { type: Boolean }
}, { timestamps: true });

module.exports = mongoose.model("Blood", BloodSchema);