const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

// Async await function
// Waits for mongoose to get connected to mongoURI
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify:false
    });
    console.log("MongoDB connected...");
  } catch (err) {
    console.error(err.message);
    // End the process
    process.exit(1);
  }
};

module.exports = connectDB;
