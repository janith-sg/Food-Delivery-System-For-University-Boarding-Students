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
