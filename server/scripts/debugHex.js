const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

async function debugHex() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('test');
    const a = await db.collection('ambulances').findOne({ number: "AMB-PVT-BLS-01" });
    if (a) {
      console.log(`JSON: ${JSON.stringify(a)}`);
      console.log(`Type Hex: ${Buffer.from(a.type).toString('hex')}`);
      console.log(`Status Hex: ${Buffer.from(a.status).toString('hex')}`);
    } else {
      console.log("Not found!");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

debugHex();
