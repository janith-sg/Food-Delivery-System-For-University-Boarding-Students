const nodemailer = require("nodemailer");

async function getSmtpTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "0");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Notify user that their registration was approved. Uses same SMTP_* env as password reset.
 * @returns {{ sent: boolean, reason?: string }}
 */
async function sendRegistrationApprovedEmail({ to, fullName, accountType }) {
  const transport = await getSmtpTransport();
  if (!transport) {
    console.warn("[email] Registration approved: SMTP not configured; skipping notification to", to);
    return { sent: false, reason: "smtp_not_configured" };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const name = String(fullName || "").trim() || "there";
  const isStaff = accountType === "staff";
  const roleLine = isStaff
    ? "Your staff account has been approved."
    : "Your student account has been approved.";

  const subject = "Your UNI EATS registration is approved";
  const text = `Hi ${name},

${roleLine}

You can now sign in using the email address and password you chose when you registered.

Open the UNI EATS login page and enter your credentials to access your account.

If you did not register for UNI EATS, you can ignore this email.

— UNI EATS`;

  const html = `
        <div style="font-family: Arial, sans-serif; background:#ffffff; padding:24px; color:#111;">
          <div style="background:#0B8E3A; color:#fff; padding:14px 16px; border-radius:12px; font-weight:700; font-size:16px;">
            UNI EATS
          </div>
          <h2 style="margin:18px 0 8px; font-size:18px;">Registration approved</h2>
          <p style="margin:0 0 14px; color:#333; line-height:1.5;">
            Hi ${name},
          </p>
          <p style="margin:0 0 14px; color:#333; line-height:1.5;">
            ${roleLine} You can now <strong>sign in</strong> using the email address and password you chose when you registered.
          </p>
          <p style="margin:0 0 14px; color:#333; line-height:1.5;">
            Open the UNI EATS login page and enter your credentials to access your account.
          </p>
          <p style="margin:0; color:#666; font-size:13px; line-height:1.5;">
            If you did not register for UNI EATS, you can safely ignore this email.
          </p>
        </div>`;

  try {
    await transport.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("[email] Registration approved: send failed:", err.message || err);
    return { sent: false, reason: "send_failed" };
  }
}

module.exports = { getSmtpTransport, sendRegistrationApprovedEmail };
