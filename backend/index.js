const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const dbConnection = require("./config/connectDB");

const app = express();

const PORT = process.env.PORT || 3000;

async function start() {
  await dbConnection();

  app.get("/", (req, res) => res.send("Hello"));

  app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
