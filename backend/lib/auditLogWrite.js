const AuditLog = require("../models/AuditLog");
const { getAuditUserDisplayId } = require("./userDisplayId");

function getClientIp(req) {
  const x = req.headers["x-forwarded-for"];
  if (x) return String(x).split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "";
}

/**
 * @param {import("express").Request} req
 * @param {import("mongoose").Document} user
 * @param {string} action
 */
async function writeAuditLog(req, user, action) {
  if (!user?._id) return;
  try {
    const last = await AuditLog.findOne().sort({ seq: -1 }).select("seq").lean();
    const seq = (last?.seq || 0) + 1;
    const userId = getAuditUserDisplayId(user);
    await AuditLog.create({
      seq,
      userRef: user._id,
      userId,
      action,
      ipAddress: getClientIp(req) || "—",
    });
  } catch (err) {
    console.error("audit log write failed:", err.message);
  }
}

module.exports = { writeAuditLog, getClientIp };
