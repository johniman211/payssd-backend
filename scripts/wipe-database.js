// scripts/wipe-database.js
const mongoose = require('mongoose');
require('dotenv').config();

async function wipeAllDatabases() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    const client = mongoose.connection.getClient();
    const adminDb = client.db().admin();

    const { databases } = await adminDb.listDatabases();

    for (const db of databases) {
      const dbName = db.name;
      if (!['admin', 'local', 'config'].includes(dbName)) {
        const dbToDrop = client.db(dbName);
        await dbToDrop.dropDatabase();
        console.log(`✅ Dropped database: ${dbName}`);
      }
    }

    console.log('🎉 All non-system databases wiped!');
  } catch (err) {
    console.error('❌ Error wiping databases:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

wipeAllDatabases();
