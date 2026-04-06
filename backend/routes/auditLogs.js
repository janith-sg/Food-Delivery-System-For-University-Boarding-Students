const express = require("express");
const AuditLog = require("../models/AuditLog");
const { requireAdmin } = require("../middleware/requireAdmin");
const { requireAuthUser } = require("../middleware/requireAuthUser");
const { writeAuditLog } = require("../lib/auditLogWrite");

const router = express.Router();

/** Admin: list audit logs with optional search and date filter */
router.get("/", requireAdmin, async (req, res) => {
  try {
    const q = String(req.query.q || "")
      .trim()
      .toLowerCase();
    const dateStr = String(req.query.date || "").trim();

    const filter = {};
    if (dateStr) {
      const d = new Date(dateStr + "T00:00:00.000Z");
      if (!Number.isNaN(d.getTime())) {
        const end = new Date(d);
        end.setUTCDate(end.getUTCDate() + 1);
        filter.createdAt = { $gte: d, $lt: end };
      }
    }

    let query = AuditLog.find(filter).sort({ createdAt: -1 }).limit(500).lean();

    const docs = await query.exec();

    let rows = docs.map((doc) => ({
      id: doc._id.toString(),
      logId: doc.seq,
      userId: doc.userId,
      timestamp: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
      action: doc.action,
      ipAddress: doc.ipAddress || "—",
    }));

    if (q) {
      rows = rows.filter((r) => {
        const idMatch = String(r.logId).includes(q) || r.id.toLowerCase().includes(q);
        const userMatch = (r.userId || "").toLowerCase().includes(q);
        const actionMatch = (r.action || "").toLowerCase().includes(q);
        return idMatch || userMatch || actionMatch;
      });
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not load audit logs." });
  }
});

/** Authenticated user: record logout (call before clearing token on client) */
router.post("/logout-event", requireAuthUser, async (req, res) => {
  try {
    await writeAuditLog(req, req.authUserDoc, "Logged Out");
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Could not write audit log." });
  }
});

module.exports = router;
