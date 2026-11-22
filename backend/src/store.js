const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data.json");

// ─── Seed data — all 11 families and 38 members ───────────────────────────────
// This is the source of truth. If data.json is missing or empty on Render,
// this seed is loaded automatically so nothing is ever lost on redeploy.

const SEED = {
  adminPassword: "santa2024",
  meetupDate: "2026-11-28",
  drawDone: false,
  remindersSent: [],
  registrationOpen: true,
  registrations: [],
  assignments: [],
  families: [
    { id: "db2b7746-8520-4cf5-8e02-a4fb9ecf6224", name: "CECILIA NDEGWA" },
    { id: "4a500e55-a25d-4147-a9af-03f58bda28c0", name: "WANJIRU NDEGWA" },
    { id: "0cfb4145-be21-4db0-941d-8cca0ecfe7c0", name: "MOSES NDEGWA" },
    { id: "448db1b6-2503-4949-abce-1c7391235318", name: "PETER NDEGWA" },
    { id: "bf483e96-c9c8-43c5-a45e-f97423515559", name: "MESHACK NDEGWA" },
    { id: "52876019-4e9d-4371-a781-7a75e0f4e7e5", name: "PHILLIP NDEGWA" },
    { id: "4adc7b14-8cd4-4325-ac45-442c65e11c39", name: "STEPHEN NDEGWA" },
    { id: "89b43e8b-bdb1-4488-a7aa-e86c3eed83c1", name: "DAVID NDEGWA" },
    { id: "3fb1f0ce-a64a-489a-b4e8-3615991a4878", name: "JAMES NDEGWA" },
    { id: "6341fe6c-b8b4-418e-875a-cd66a9574293", name: "NYAKWEA MUCHIRI" },
    { id: "f7fab9a3-8270-44f0-886d-8f34bf369246", name: "WAMUYU MUCHIRI" },
  ],
  members: [
    // WANJIRU NDEGWA family
    { id: "323e909f-905f-4e17-b72f-e8b631aaae7f", familyId: "4a500e55-a25d-4147-a9af-03f58bda28c0", name: "MR MUCHIRI",      email: null, noSmartphone: false },
    { id: "7ba6e02c-47d9-49f8-bab3-4a56b9829e2d", familyId: "4a500e55-a25d-4147-a9af-03f58bda28c0", name: "WANJIRU NDEGWA",  email: null, noSmartphone: false },
    { id: "eb41ea0b-8762-4424-a871-7bed5ef7961b", familyId: "4a500e55-a25d-4147-a9af-03f58bda28c0", name: "NYAWIRA MUCHIRI", email: null, noSmartphone: false },
    // MOSES NDEGWA family
    { id: "f7f2e095-4fc8-4ee6-93b5-745827fa8d07", familyId: "0cfb4145-be21-4db0-941d-8cca0ecfe7c0", name: "MOSES NGARI",    email: null, noSmartphone: false },
    { id: "bb8a92ac-98da-4085-936c-48c778e3ad5f", familyId: "0cfb4145-be21-4db0-941d-8cca0ecfe7c0", name: "BELLAH NGARI",   email: null, noSmartphone: false },
    { id: "6c07665c-8870-42e3-8cb3-406e10346440", familyId: "0cfb4145-be21-4db0-941d-8cca0ecfe7c0", name: "GRACE NGARI",    email: null, noSmartphone: false },
    { id: "df746026-b0d0-4945-9183-f5a3e9c9e000", familyId: "0cfb4145-be21-4db0-941d-8cca0ecfe7c0", name: "STEPHEN GACHIE", email: null, noSmartphone: false },
    { id: "e1765ac2-15c3-4e95-b9c2-8623992a6f1d", familyId: "0cfb4145-be21-4db0-941d-8cca0ecfe7c0", name: "JUSTUS NGARI",   email: null, noSmartphone: false },
    { id: "e7b08ec5-253b-4b01-81ba-d5aa5817a880", familyId: "0cfb4145-be21-4db0-941d-8cca0ecfe7c0", name: "SAMMY NGARI",    email: null, noSmartphone: false },
    // PETER NDEGWA family
    { id: "270f5e7f-d935-4fc3-aa63-87d188f6fced", familyId: "448db1b6-2503-4949-abce-1c7391235318", name: "PETER NDEGWA",   email: null, noSmartphone: false },
    // MESHACK NDEGWA family
    { id: "d2831320-c87f-4918-aaa7-3041856508f5", familyId: "bf483e96-c9c8-43c5-a45e-f97423515559", name: "MESHACK NDEGWA",  email: null, noSmartphone: false },
    { id: "ca5c8a86-deb3-4cf7-abef-4e1ed01eea72", familyId: "bf483e96-c9c8-43c5-a45e-f97423515559", name: "DORCAS WANYEKI",  email: null, noSmartphone: false },
    { id: "aff16f4c-e9ed-490c-8bd0-ba777567d838", familyId: "bf483e96-c9c8-43c5-a45e-f97423515559", name: "LILIAN WANYEKI",  email: null, noSmartphone: false },
    { id: "ac8b0120-3449-46fd-979e-70fc30c74588", familyId: "bf483e96-c9c8-43c5-a45e-f97423515559", name: "LINDA WANYEKI",   email: null, noSmartphone: false },
    { id: "28652c37-ebbf-42ce-a5f9-eb693679171a", familyId: "bf483e96-c9c8-43c5-a45e-f97423515559", name: "TIMOTHY NDEGWA",  email: null, noSmartphone: false },
    { id: "7fded8a9-8f59-4cfe-8e35-f2efb856d6c5", familyId: "bf483e96-c9c8-43c5-a45e-f97423515559", name: "JESSE WANYEKI",   email: null, noSmartphone: false },
    // PHILLIP NDEGWA family
    { id: "6692e41d-716a-40cd-aa6d-fcf03a386ddd", familyId: "52876019-4e9d-4371-a781-7a75e0f4e7e5", name: "PHILLIP MAINGI",       email: null, noSmartphone: false },
    { id: "5c168118-aa95-4d80-84b6-2cdf61c1a040", familyId: "52876019-4e9d-4371-a781-7a75e0f4e7e5", name: "LOISE MAINGI",         email: null, noSmartphone: false },
    { id: "a6bcfbc5-c60b-45f4-a4b5-0b7df160ecac", familyId: "52876019-4e9d-4371-a781-7a75e0f4e7e5", name: "CHARITY NEEMA MAINGI", email: null, noSmartphone: false },
    { id: "2d8c62da-9929-441c-a26d-3b78d11e52a3", familyId: "52876019-4e9d-4371-a781-7a75e0f4e7e5", name: "TAMARA ABIGAIL MAINGI",email: null, noSmartphone: false },
    { id: "b2067c9d-34a7-4265-b9b9-1b87ad713419", familyId: "52876019-4e9d-4371-a781-7a75e0f4e7e5", name: "JASON ETHAN MAINGI",   email: null, noSmartphone: false },
    { id: "064304fc-849e-4fb2-87f8-9dcccbaf102e", familyId: "52876019-4e9d-4371-a781-7a75e0f4e7e5", name: "SHARON JOY MAINGI",    email: null, noSmartphone: false },
    // STEPHEN NDEGWA family
    { id: "bc84ccdf-eef4-4a51-9ed7-8cc8b4dcd397", familyId: "4adc7b14-8cd4-4325-ac45-442c65e11c39", name: "STEPHEN NDEGWA", email: null, noSmartphone: false },
    { id: "25444bad-4037-408a-89d8-3afa9c2a0800", familyId: "4adc7b14-8cd4-4325-ac45-442c65e11c39", name: "ESTHER MUTHUI",  email: null, noSmartphone: false },
    { id: "27faaf21-06a5-4ae5-b915-22e3d16516b5", familyId: "4adc7b14-8cd4-4325-ac45-442c65e11c39", name: "CELINE MUTHUI",  email: null, noSmartphone: false },
    { id: "84488fdf-f4f4-423c-8165-7180efd4c246", familyId: "4adc7b14-8cd4-4325-ac45-442c65e11c39", name: "VICTORIA MUTHUI",email: null, noSmartphone: false },
    { id: "afe73cbf-f223-4492-b901-7a0c3fa56b84", familyId: "4adc7b14-8cd4-4325-ac45-442c65e11c39", name: "JUSTUS MUTHUI",  email: null, noSmartphone: false },
    // DAVID NDEGWA family
    { id: "a73caa90-36cc-41b5-a07a-30f9fac8d171", familyId: "89b43e8b-bdb1-4488-a7aa-e86c3eed83c1", name: "DAVID NDEGWA",   email: null, noSmartphone: false },
    { id: "40463661-431b-4c79-b2bf-8ec6e8523680", familyId: "89b43e8b-bdb1-4488-a7aa-e86c3eed83c1", name: "SARAH WAMBUGU",  email: null, noSmartphone: false },
    { id: "eefbad5c-7c2c-44c7-88f2-01850674958c", familyId: "89b43e8b-bdb1-4488-a7aa-e86c3eed83c1", name: "LEMUEL WAMBUGU", email: null, noSmartphone: false },
    { id: "fada831d-5eb2-4b6f-89c2-69ef57059dcc", familyId: "89b43e8b-bdb1-4488-a7aa-e86c3eed83c1", name: "JAEL WAMBUGU",   email: null, noSmartphone: false },
    { id: "918fa109-8eb2-4793-93f3-b0dd1b11c811", familyId: "89b43e8b-bdb1-4488-a7aa-e86c3eed83c1", name: "JOANNA WAMBUGU", email: null, noSmartphone: false },
    // JAMES NDEGWA family
    { id: "39dd22c9-1cb2-40e5-81a8-c2820b64e51e", familyId: "3fb1f0ce-a64a-489a-b4e8-3615991a4878", name: "JAMES NDEGWA",   email: null, noSmartphone: false },
    // CECILIA NDEGWA family
    { id: "0ef3e290-c65a-44e6-9fc3-3ab88e00ee77", familyId: "db2b7746-8520-4cf5-8e02-a4fb9ecf6224", name: "CECILIA NDEGWA", email: null, noSmartphone: false },
    // NYAKWEA MUCHIRI family
    { id: "c3bcd8ae-815e-4070-9fb7-e2ed02fb7f3c", familyId: "6341fe6c-b8b4-418e-875a-cd66a9574293", name: "NYAKWEA MUCHIRI", email: null, noSmartphone: false },
    { id: "047d7d00-7f38-42e0-983c-cb0324b359c4", familyId: "6341fe6c-b8b4-418e-875a-cd66a9574293", name: "ETHAN MURIMI",    email: null, noSmartphone: false },
    // WAMUYU MUCHIRI family
    { id: "c61f0899-037c-43ca-89f7-3131770167c4", familyId: "f7fab9a3-8270-44f0-886d-8f34bf369246", name: "WAMUYU MUCHIRI",  email: null, noSmartphone: false },
    { id: "92a35d28-f80f-4b05-8ead-d8f6dd4ecff3", familyId: "f7fab9a3-8270-44f0-886d-8f34bf369246", name: "CLAUDIA",         email: null, noSmartphone: false },
  ],
};

// ─── State ────────────────────────────────────────────────────────────────────

let state = { ...SEED };

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed.families && parsed.families.length > 0) {
        // Merge: keep seed families/members but overlay any saved emails/assignments
        state = { ...SEED, ...parsed };
        console.log(`Loaded ${state.families.length} families, ${state.members.length} members from data.json`);
        return;
      }
    }
  } catch (e) {
    console.error("Could not load data.json:", e.message);
  }
  console.log(`Seed loaded: ${SEED.families.length} families, ${SEED.members.length} members`);
  state = { ...SEED };
  save();
}

function save() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {
    console.error("Could not save data.json:", e.message);
  }
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
