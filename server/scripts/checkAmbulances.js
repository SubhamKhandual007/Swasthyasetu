const mongoose = require('mongoose');
const Ambulance = require('../models/Ambulance');
require('dotenv').config({ path: '../.env' });

async function checkAmbulances() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB...");
    
    const count = await Ambulance.countDocuments();
    console.log(`Total Ambulances: ${count}`);
    
    const all = await Ambulance.find({});
    console.log("All Ambulances in DB:");
    all.forEach(a => {
      console.log(`- ${a.number} | Type: ${a.type} | Status: ${a.status}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Check failed:", err);
    process.exit(1);
  }
}

checkAmbulances();
