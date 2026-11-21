/**
 * In-memory data store with JSON file persistence.
 * Saves to data.json next to this file so data survives server restarts.
 */

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data.json");

const defaultState = {
  adminPassword: "santa2024", // admin can change this in .env
  families: [],       // [{ id, name }]
  members: [],        // [{ id, familyId, name, email, noSmartphone, isParent, isChild, parentId }]
  registrations: [],  // [{ id, name, email, familyId, submittedAt }] — pending admin approval
  assignments: [],    // [{ giverId, receiverId }]
  meetupDate: null,   // ISO date string e.g. "2026-12-20"
  drawDone: false,
  remindersSent: [],  // ["6weeks", "2weeks", "3days"]
  registrationOpen: true, // admin can open/close registration
};

let state = { ...defaultState };

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      state = { ...defaultState, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error("Could not load data.json, starting fresh:", e.message);
  }
}

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
}

function getState() {
  return state;
}

function setState(partial) {
  state = { ...state, ...partial };
  save();
}

load();

module.exports = { getState, setState, save };
