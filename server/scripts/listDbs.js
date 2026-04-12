const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

async function listDbs() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const dbs = await client.db().admin().listDatabases();
    console.log("Databases:");
    dbs.databases.forEach(db => console.log(`- ${db.name}`));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

listDbs();
