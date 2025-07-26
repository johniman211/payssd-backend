const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async (uri) => {
  if (isConnected) {
    console.log('⚠️  Using existing MongoDB connection');
    return;
  }

  try {
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // ✅ Forces IPv4 to avoid DNS issues on Windows
    });
    isConnected = db.connections[0].readyState === 1;
    console.log(`✅ MongoDB connected [${db.connection.name}]`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
