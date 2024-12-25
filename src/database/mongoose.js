const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/auth", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.error("Could not connect to MongoDB. Please check your connection settings.");
    console.error("Error details:", err.message);
    process.exit(1); // Exit the process to avoid further issues
  }
};

// Optionally handle disconnection events
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost. Attempting to reconnect...");
});

// Optional: Handle connection errors outside initial connection
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

module.exports = connectDB;

// Usage in your main app file:
const connectDB = require("./path/to/this/file");

connectDB();
