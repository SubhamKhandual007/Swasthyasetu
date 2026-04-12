const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');
const connectDB = require('./config/db');
require('socket.io'); // If you're using Socket.IO, you'll need to implement it properly

const PORT = process.env.PORT || 2001;



const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Background processor for Blood Tests
  const BloodTest = require('./models/BloodTest');
  setInterval(async () => {
    try {
      const now = new Date();
      const pendingTests = await BloodTest.find({
        status: 'Pending',
        reportReadyAt: { $lte: now }
      });

      for (const test of pendingTests) {
        const testNames = test.tests.map(t => t.name.toLowerCase());
        const reportData = {};
        
        // Populate based on test types
        if (testNames.some(n => n.includes("cbc") || n.includes("count") || n.includes("full body") || n.includes("package"))) {
          reportData.rbc = (Math.random() * (6.0 - 4.0) + 4.0).toFixed(2);
          reportData.wbc = (Math.random() * (11000 - 4000) + 4000).toFixed(0);
          reportData.platelets = (Math.random() * (450000 - 150000) + 150000).toFixed(0);
          reportData.hemoglobin = (Math.random() * (17.0 - 12.0) + 12.0).toFixed(1);
        }
        
        if (testNames.some(n => n.includes("diabetic") || n.includes("glucose") || n.includes("sugar"))) {
          reportData.glucose = (Math.random() * (140 - 70) + 70).toFixed(0);
        }
        
        if (testNames.some(n => n.includes("lipid") || n.includes("cholesterol") || n.includes("fat"))) {
          reportData.cholesterol = (Math.random() * (240 - 150) + 150).toFixed(0);
        }

        // Default if none matched specifically (basic health metrics)
        if (Object.keys(reportData).length === 0) {
          reportData.rbc = (Math.random() * (6.0 - 4.0) + 4.0).toFixed(2);
          reportData.hemoglobin = (Math.random() * (17.0 - 12.0) + 12.0).toFixed(1);
        }

        test.reportData = reportData;
        test.status = 'Completed';
        await test.save();
        console.log(`Test-specific report generated for test: ${test._id}`);
      }
    } catch (error) {
      console.error('Error in blood test background processor:', error);
    }
  }, 10000); // Check every 10 seconds
};

startServer();