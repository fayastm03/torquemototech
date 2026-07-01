// config/db.js
// WHY: This file handles the MongoDB connection using Mongoose.
// We keep it separate so server.js stays clean.
// If DB connection fails, the whole server stops — that's intentional.

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the process with failure code if DB doesn't connect
    process.exit(1);
  }
};

export default connectDB;
