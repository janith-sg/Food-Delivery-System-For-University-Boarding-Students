const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env"), override: true });

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const dbConnection = require("./config/connectDB");
const seedAdmin = require("./seed/seedAdmin");
const migrateVerificationFields = require("./seed/migrateVerificationFields");
const seedStaffRoles = require("./seed/seedStaffRoles");

const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/login");
const usersRoutes = require("./routes/users");
const passwordResetRoutes = require("./routes/passwordReset");
const orderRoutes = require("./routes/orderRoutes");
const groupOrderRoutes = require("./routes/groupOrderRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const foodMenuRoutes = require("./routes/FoodMenus");
const deliveryRoutes = require("./routes/deliveryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const staffRolesRoutes = require("./routes/staffRoles");
const auditLogsRoutes = require("./routes/auditLogs");

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
app.use("/api/orders", orderRoutes);
app.use("/api/group-orders", groupOrderRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/foodmenus", foodMenuRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/staff-roles", staffRolesRoutes);
app.use("/api/audit-logs", auditLogsRoutes);

app.get("/", (req, res) => res.send("UNI EATS API — OK"));

async function start() {
  await dbConnection();
  await migrateVerificationFields();
  await seedAdmin();
  await seedStaffRoles();
  app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
