const mongoose = require('mongoose');
const BloodTest = require('../models/BloodTest');
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const checkTests = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    const tests = await BloodTest.find({});
    let output = `Total Tests found: ${tests.length}\n`;
    for (const t of tests) {
      output += `ID: ${t._id}\n`;
      output += `User ID: ${t.userId}\n`;
      output += `Patient: ${t.patientName}\n`;
      output += `Status: ${t.status}\n`;
      output += `CreatedAt: ${t.createdAt}\n`;
      output += `ReportReadyAt: ${t.reportReadyAt}\n`;
      output += `Tests: ${JSON.stringify(t.tests)}\n`;
      output += '-------------------\n';
    }
    const outputPath = path.join(__dirname, '../tests_debug.txt');
    fs.writeFileSync(outputPath, output);
    console.log(`Results written to ${outputPath}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkTests();
