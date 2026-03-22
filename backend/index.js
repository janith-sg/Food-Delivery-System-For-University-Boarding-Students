const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/connectDB");
const deliveryRoutes = require("./routes/deliveryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});