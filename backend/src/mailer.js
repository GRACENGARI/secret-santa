/**
 * Email sender using Nodemailer + Gmail.
 * Uses App Password (set in .env) so your real password is never stored.
 */

const nodemailer = require("nodemailer");

function createTransport() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

/**
 * Send the assignment email to a giver.
 */
async function sendAssignmentEmail({ giverName, giverEmail, receiverName, receiverFamily, meetupDate, isSharedEmail }) {
  const transport = createTransport();
  const dateStr = meetupDate
    ? new Date(meetupDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "the family meetup";

  const parentNote = isSharedEmail
    ? `This email was sent on behalf of <strong>${giverName}</strong>. Please pass this message to them (or tell them who they're gifting — keeping it secret from everyone else!).`
    : null;

  await transport.sendMail({
    from: `"Secret Santa 🎅" <${process.env.GMAIL_USER}>`,
    to: giverEmail,
    subject: `🎁 Secret Santa Assignment for ${giverName}`,
    html: assignmentEmailHtml({ giverName, receiverName, receiverFamily, dateStr, parentNote }),
  });
}

/**
 * Send a reminder email.
 * @param {string} stage - "6weeks" | "2weeks" | "3days"
 */
async function sendReminderEmail({ giverName, giverEmail, receiverName, receiverFamily, meetupDate, stage }) {
  const transport = createTransport();
  const dateStr = new Date(meetupDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const subjects = {
    "6weeks": "🎅 Secret Santa Reminder — 6 weeks to go!",
    "2weeks": "🎁 Secret Santa Reminder — 2 weeks left!",
    "3days":  "⏰ Secret Santa — only 3 days to go!",
  };

  await transport.sendMail({
    from: `"Secret Santa 🎅" <${process.env.GMAIL_USER}>`,
    to: giverEmail,
    subject: subjects[stage] || "Secret Santa Reminder",
    html: reminderEmailHtml({ giverName, receiverName, receiverFamily, dateStr, stage }),
  });
}

// ─── HTML Templates ────────────────────────────────────────────────────────────

function assignmentEmailHtml({ giverName, receiverName, receiverFamily, dateStr, parentNote }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 500px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #c0392b; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px;">🎅 Secret Santa</h1>
    </div>
    <div style="padding: 30px;">
      ${parentNote ? `<div style="background:#fef9e7;border:1px solid #f39c12;border-radius:7px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#7d6608;">📬 <strong>Note:</strong> ${parentNote}</div>` : ""}
      <p style="font-size: 18px; color: #333;">Hey <strong>${giverName}</strong>! 🎉</p>
      <p style="font-size: 16px; color: #555;">The draw has been done and you are gifting:</p>
      <div style="background: #fef9e7; border: 2px dashed #f39c12; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <p style="font-size: 28px; font-weight: bold; color: #c0392b; margin: 0;">${receiverName}</p>
        <p style="font-size: 14px; color: #888; margin: 6px 0 0;">${receiverFamily} family</p>
      </div>
      <p style="font-size: 15px; color: #555;">Keep it a secret until the meetup on <strong>${dateStr}</strong>! 🤫</p>
      <p style="font-size: 13px; color: #aaa; margin-top: 30px;">This email was sent by the family Secret Santa app. Replies go nowhere — keep the mystery! 🎁</p>
    </div>
  </div>
</body>
</html>`;
}

function reminderEmailHtml({ giverName, receiverName, receiverFamily, dateStr, stage }) {
  const messages = {
    "6weeks": `Just a friendly heads-up — the family meetup is <strong>6 weeks away</strong>. Plenty of time to find the perfect gift!`,
    "2weeks": `The meetup is in <strong>2 weeks</strong>. If you haven't sorted a gift yet, now's the time!`,
    "3days":  `The meetup is in <strong>3 days</strong>! Make sure your gift is ready to go. 🎁`,
  };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 500px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #27ae60; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎁 Secret Santa Reminder</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #333;">Hey <strong>${giverName}</strong>!</p>
      <p style="font-size: 16px; color: #555;">${messages[stage]}</p>
      <div style="background: #fef9e7; border: 2px dashed #f39c12; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <p style="font-size: 14px; color: #888; margin: 0;">You are gifting</p>
        <p style="font-size: 26px; font-weight: bold; color: #c0392b; margin: 6px 0;">${receiverName}</p>
        <p style="font-size: 14px; color: #888; margin: 0;">${receiverFamily} family</p>
      </div>
      <p style="font-size: 15px; color: #555;">See you on <strong>${dateStr}</strong>! 🎉</p>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { sendAssignmentEmail, sendReminderEmail, sendConfirmationEmail };

/**
 * Send a confirmation email when someone registers their email.
 */
async function sendConfirmationEmail({ name, email, meetupDate }) {
  const transport = createTransport();

  const dateStr = meetupDate
    ? new Date(meetupDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "28th November 2026";

  await transport.sendMail({
    from: `"Ndegwa Secret Santa 🎅" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🎁 You're registered for Secret Santa!",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 500px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: #c0392b; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎅 Secret Santa 2026</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #333;">Hey <strong>${name}</strong>! 🎉</p>
      <p style="font-size: 16px; color: #555;">You're officially registered for the Ndegwa Family Secret Santa!</p>
      <div style="background: #eafaf1; border: 1px solid #a9dfbf; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; color: #555; margin: 0 0 6px;">📅 Mark your calendar</p>
        <p style="font-size: 20px; font-weight: bold; color: #27ae60; margin: 0;">${dateStr}</p>
      </div>
      <p style="font-size: 15px; color: #555;">Here's what happens next:</p>
      <ul style="font-size: 14px; color: #555; line-height: 2;">
        <li>🎲 The draw will be done soon — you'll get an email with who you're gifting</li>
        <li>🔔 You'll get reminder emails as the meetup gets closer</li>
        <li>🤫 Keep your assignment secret until the day!</li>
      </ul>
      <p style="font-size: 13px; color: #aaa; margin-top: 24px;">
        This email was sent by the Ndegwa Family Secret Santa app — familyndegwa4@gmail.com
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}
