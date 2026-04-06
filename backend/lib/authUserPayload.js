/**
 * Shape returned to the client after login and profile updates (no secrets).
 */
function toAuthUserPayload(user) {
  if (!user) return null;
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    accountType: user.accountType,
    phone: user.phone || "",
    studentPhotoUrl: user.studentPhotoUrl || "",
    staffRole: user.staffRole || "",
    riderId: user.riderId || "",
    createdAt: user.createdAt ? user.createdAt.toISOString() : "",
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : "",
    emailVerified: Boolean(user.emailVerified),
    phoneVerified: Boolean(user.phoneVerified),
    accountActive: user.accountActive !== false,
  };
}

module.exports = { toAuthUserPayload };
