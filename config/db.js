const mongoose = require('mongoose');

// MongoDB connection with retry logic for robustness
// Reads connection details from environment variables
const MONGO_URI = process.env.MONGO_URI;
const MAX_RETRIES = 5; // configurable retry count
let attempts = 0;

async function connectDB() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    attempts += 1;
    console.error(`MongoDB connection error (attempt ${attempts}):`, err.message);
    if (attempts < MAX_RETRIES) {
      // wait 5 seconds before retrying
      await new Promise((res) => setTimeout(res, 5000));
      return connectDB();
    }
    throw err;
  }
}

module.exports = connectDB;
