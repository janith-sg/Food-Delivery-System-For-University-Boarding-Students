const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const connection = async () => {
  const dburl = process.env.MONGODB_URI;
  if (!dburl || !String(dburl).trim()) {
    console.error(
      "Missing MONGODB_URI. Copy .env.example to .env in the backend folder and set your MongoDB connection string."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(dburl);
    console.log("MongoDB Connected~");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

module.exports = connection;
