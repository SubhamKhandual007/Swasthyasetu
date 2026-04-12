const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function listCollections() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB...");
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:");
    collections.forEach(c => console.log(`- ${c.name}`));
    
    process.exit(0);
  } catch (err) {
    console.error("List failed:", err);
    process.exit(1);
  }
}

listCollections();
