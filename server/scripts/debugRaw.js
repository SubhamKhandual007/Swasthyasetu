const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

async function debugRaw() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('test');
    const ambulances = await db.collection('ambulances').find({}).toArray();
    console.log(`Total: ${ambulances.length}`);
    ambulances.forEach(a => {
      console.log(`ID: ${a._id} | Number: ${a.number} | Type: ${a.type} | Status: "${a.status}"`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

debugRaw();
