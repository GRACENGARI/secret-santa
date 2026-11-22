/**
 * In-memory data store with JSON file persistence.
 * On Render (and other ephemeral file systems), data.json is loaded from
 * the deployed file on startup. Changes are saved in-memory and to disk
 * but will reset on redeploy — that's fine for this use case since the
 * families/members are set up once before the draw.
 */

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data.json");

const defaultState = {
  adminPassword: "santa2024",
  families: [],
  members: [],
  registrations: [],
  assignments: [],
  meetupDate: "2026-11-28",
  drawDone: false,
  remindersSent: [],
  registrationOpen: true,
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
