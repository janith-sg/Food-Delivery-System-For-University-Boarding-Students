 HEAD
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const dbConnection = require("./config/connectDB");
const seedAdmin = require("./seed/seedAdmin");
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/login");
const usersRoutes = require("./routes/users");
const passwordResetRoutes = require("./routes/passwordReset");

const app = express();
const PORT = process.env.PORT || 3000;

fs.mkdirSync(path.join(__dirname, "uploads", "student-ids"), { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/register", registerRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/password-reset", passwordResetRoutes);

app.get("/", (req, res) => res.send("UNI EATS API — OK"));

async function start() {
  await dbConnection();
  await seedAdmin();
  app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const groupOrderRoutes = require("./routes/groupOrderRoutes");
const orderRoutes = require("./routes/orderRoutes");

const stripeRoutes = require("./routes/stripeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/orders", orderRoutes);
app.use("/api/group-orders", groupOrderRoutes);
app.use("/api/stripe", stripeRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
 Order-Management
