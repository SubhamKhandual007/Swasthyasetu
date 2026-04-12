const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const listDBs = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const conn = await mongoose.createConnection(mongoURI).asPromise();
    const admin = conn.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map(d => d.name));
    
    for (const db of dbs.databases) {
      if (['admin', 'local', 'config'].includes(db.name)) continue;
      const dbConn = conn.useDb(db.name);
      const collections = await dbConn.db.listCollections().toArray();
      const hasBloodTests = collections.some(c => c.name === 'bloodtests');
      if (hasBloodTests) {
        const count = await dbConn.collection('bloodtests').countDocuments();
        console.log(`DB: ${db.name}, bloodtests count: ${count}`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

listDBs();
