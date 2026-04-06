/**
 * Stable display ID for audit logs (STF…, CUS…, ADM…).
 * @param {import("mongoose").Document | object} user
 */
function getAuditUserDisplayId(user) {
  if (!user) return "—";
  const at = String(user.accountType || "").toLowerCase();
  if (at === "admin") {
    return "ADM001";
  }
  if (at === "customer") {
    const sid = String(user.studentId || "").trim();
    if (sid && sid !== "—") return sid.length <= 12 ? `CUS${sid}` : sid;
    const n = (parseInt(String(user._id).slice(-4), 16) % 9000) + 1000;
    return `CUS${n}`;
  }
  if (at === "staff") {
    const rider = String(user.riderId || "").trim();
    if (rider) return rider;
    const fallbackNum = (parseInt(String(user._id).slice(-6), 16) % 998) + 1;
    return `STF${String(fallbackNum).padStart(3, "0")}`;
  }
  return String(user._id).slice(-8);
}

module.exports = { getAuditUserDisplayId };
