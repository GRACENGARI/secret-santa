/**
 * Reminder scheduler using node-cron.
 * Runs a check every day at 8am and sends reminder emails
 * at 6 weeks, 2 weeks, and 3 days before the meetup date.
 */

const cron = require("node-cron");
const { getState, setState } = require("./store");
const { sendReminderEmail } = require("./mailer");

const STAGES = [
  { key: "6weeks", days: 42 },
  { key: "2weeks", days: 14 },
  { key: "3days",  days: 3  },
];

function startScheduler() {
  // Run every day at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    await checkAndSendReminders();
  });

  console.log("Reminder scheduler started — checks daily at 8am.");
}

async function checkAndSendReminders() {
  const state = getState();

  if (!state.drawDone || !state.meetupDate) return;

  const meetup = new Date(state.meetupDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  meetup.setHours(0, 0, 0, 0);

  const daysUntil = Math.round((meetup - today) / (1000 * 60 * 60 * 24));

  for (const stage of STAGES) {
    if (daysUntil === stage.days && !state.remindersSent.includes(stage.key)) {
      console.log(`Sending ${stage.key} reminders (${daysUntil} days to meetup)...`);
      await sendRemindersForStage(stage.key, state);
      setState({ remindersSent: [...state.remindersSent, stage.key] });
      console.log(`${stage.key} reminders sent.`);
    }
  }
}

async function sendRemindersForStage(stage, state) {
  const errors = [];

  for (const assignment of state.assignments) {
    const giver = state.members.find(m => m.id === assignment.giverId);
    const receiver = state.members.find(m => m.id === assignment.receiverId);
    const receiverFamily = state.families.find(f => f.id === receiver.familyId);

    // Skip people with no smartphone (no email) — they have a printed slip
    if (!giver.email || giver.noSmartphone) continue;

    try {
      await sendReminderEmail({
        giverName: giver.name,
        giverEmail: giver.email,
        receiverName: receiver.name,
        receiverFamily: receiverFamily ? receiverFamily.name : "",
        meetupDate: state.meetupDate,
        stage,
      });
    } catch (err) {
      errors.push({ name: giver.name, error: err.message });
    }
  }

  if (errors.length > 0) {
    console.error("Some reminder emails failed:", errors);
  }
}

// Export so the API can trigger a manual test send
module.exports = { startScheduler, checkAndSendReminders, sendRemindersForStage };
