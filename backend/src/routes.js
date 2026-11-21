/**
 * All API routes.
 *
 * Public:
 *   GET  /api/status          — is draw done? meetup date?
 *
 * Admin (requires x-admin-password header):
 *   GET    /api/families              — list all families
 *   POST   /api/families              — add a family         { name }
 *   DELETE /api/families/:id          — delete family + its members
 *
 *   GET    /api/members               — list all members
 *   POST   /api/members               — add member           { familyId, name, email, noSmartphone }
 *   PUT    /api/members/:id           — update member
 *   DELETE /api/members/:id           — delete member
 *
 *   POST   /api/settings              — set meetupDate, adminPassword
 *
 *   POST   /api/draw                  — run the draw + send assignment emails
 *   DELETE /api/draw                  — reset draw
 *
 *   GET    /api/assignments           — full assignment list (admin only)
 *   GET    /api/slip/:memberId        — get slip data for one person (for printing)
 *
 *   POST   /api/test-email            — send a test email to the admin
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getState, setState } = require("./store");
const { runDraw } = require("./algorithm");
const { sendAssignmentEmail } = require("./mailer");

const router = express.Router();

// ─── Auth middleware ───────────────────────────────────────────────────────────

function requireAdmin(req, res, next) {
  const { adminPassword } = getState();
  const provided = req.headers["x-admin-password"];
  if (provided !== adminPassword) {
    return res.status(401).json({ error: "Invalid admin password." });
  }
  next();
}

// ─── Public registration ──────────────────────────────────────────────────────

// Get families list (public — needed for the registration form dropdown)
router.get("/public/families", (req, res) => {
  const { families, registrationOpen } = getState();
  res.json({ families, registrationOpen });
});

// Get members for a family (public — only name + id, no emails exposed)
router.get("/public/members/:familyId", (req, res) => {
  const { members } = getState();
  const familyMembers = members
    .filter(m => m.familyId === req.params.familyId)
    .map(m => ({
      id: m.id,
      name: m.name,
      hasEmail: !!m.email,       // tells frontend if they already have an email
      noSmartphone: m.noSmartphone,
    }));
  res.json(familyMembers);
});

// Member check-in — person finds their name and submits their email
router.post("/checkin", (req, res) => {
  const { memberId, email } = req.body;
  if (!memberId) return res.status(400).json({ error: "Please select your name." });
  if (!email || !email.trim()) return res.status(400).json({ error: "Email is required." });

  const { members } = getState();
  const idx = members.findIndex(m => m.id === memberId);
  if (idx === -1) return res.status(404).json({ error: "Member not found." });

  const member = members[idx];

  if (member.noSmartphone) {
    return res.status(400).json({ error: "This person is set up for a printed slip — no email needed." });
  }

  const updated = { ...member, email: email.trim().toLowerCase() };
  const newMembers = [...members];
  newMembers[idx] = updated;
  setState({ members: newMembers });

  res.json({ ok: true, name: member.name });
});



// Submit a registration (public)
router.post("/register", (req, res) => {
  const { name, email, familyId } = req.body;
  const { registrationOpen, families, registrations, members } = getState();

  if (!registrationOpen) {
    return res.status(403).json({ error: "Registration is currently closed." });
  }
  if (!name || !name.trim()) return res.status(400).json({ error: "Name is required." });
  if (!email || !email.trim()) return res.status(400).json({ error: "Email is required." });
  if (!familyId) return res.status(400).json({ error: "Please select your family." });
  if (!families.find(f => f.id === familyId)) {
    return res.status(400).json({ error: "Invalid family." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName  = name.trim();

  // Prevent duplicate submissions (same name + family already pending or approved)
  const alreadyPending = registrations.find(
    r => r.name.toLowerCase() === cleanName.toLowerCase() && r.familyId === familyId
  );
  const alreadyMember = members.find(
    m => m.name.toLowerCase() === cleanName.toLowerCase() && m.familyId === familyId
  );
  if (alreadyPending || alreadyMember) {
    return res.status(400).json({ error: "This name has already been registered for that family." });
  }

  const reg = {
    id: uuidv4(),
    name: cleanName,
    email: cleanEmail,
    familyId,
    submittedAt: new Date().toISOString(),
  };

  setState({ registrations: [...registrations, reg] });
  res.status(201).json({ ok: true, message: `Thanks ${cleanName}! You're registered. The admin will confirm your spot.` });
});

// Admin: get all pending registrations
router.get("/registrations", requireAdmin, (req, res) => {
  const { registrations, families } = getState();
  const result = registrations.map(r => ({
    ...r,
    familyName: (families.find(f => f.id === r.familyId) || {}).name || "Unknown",
  }));
  res.json(result);
});

// Admin: approve a registration → converts it to a full member
router.post("/registrations/:id/approve", requireAdmin, (req, res) => {
  const { registrations, members, families } = getState();
  const reg = registrations.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ error: "Registration not found." });

  const newMember = {
    id: uuidv4(),
    familyId: reg.familyId,
    name: reg.name,
    email: reg.email,
    noSmartphone: false,
    isChild: false,
    isParent: false,
    parentId: null,
  };

  setState({
    members: [...members, newMember],
    registrations: registrations.filter(r => r.id !== req.params.id),
  });

  res.json({ ok: true, member: newMember });
});

// Admin: reject a registration
router.delete("/registrations/:id", requireAdmin, (req, res) => {
  const { registrations } = getState();
  if (!registrations.find(r => r.id === req.params.id)) {
    return res.status(404).json({ error: "Registration not found." });
  }
  setState({ registrations: registrations.filter(r => r.id !== req.params.id) });
  res.json({ ok: true });
});

// Admin: open or close registration
router.post("/registration-status", requireAdmin, (req, res) => {
  const { open } = req.body;
  setState({ registrationOpen: !!open });
  res.json({ ok: true, registrationOpen: !!open });
});



router.get("/status", (req, res) => {
  const { drawDone, meetupDate, members, families, registrations, registrationOpen } = getState();
  res.json({
    drawDone,
    meetupDate,
    memberCount: members.length,
    familyCount: families.length,
    pendingRegistrations: (registrations || []).length,
    registrationOpen,
  });
});

// ─── Families ─────────────────────────────────────────────────────────────────

router.get("/families", requireAdmin, (req, res) => {
  const { families, members } = getState();
  // Attach member count to each family
  const result = families.map(f => ({
    ...f,
    memberCount: members.filter(m => m.familyId === f.id).length,
  }));
  res.json(result);
});

router.post("/families", requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Family name is required." });

  const { families } = getState();
  const newFamily = { id: uuidv4(), name: name.trim() };
  setState({ families: [...families, newFamily] });
  res.status(201).json(newFamily);
});

router.delete("/families/:id", requireAdmin, (req, res) => {
  const { families, members } = getState();
  const exists = families.find(f => f.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Family not found." });

  setState({
    families: families.filter(f => f.id !== req.params.id),
    members: members.filter(m => m.familyId !== req.params.id),
  });
  res.json({ ok: true });
});

// ─── Members ──────────────────────────────────────────────────────────────────

router.get("/members", requireAdmin, (req, res) => {
  const { members, families } = getState();
  const result = members.map(m => ({
    ...m,
    familyName: (families.find(f => f.id === m.familyId) || {}).name || "Unknown",
  }));
  res.json(result);
});

router.post("/members", requireAdmin, (req, res) => {
  const { familyId, name, email, noSmartphone, isChild, isParent, parentId } = req.body;
  if (!familyId || !name || !name.trim()) {
    return res.status(400).json({ error: "familyId and name are required." });
  }

  const { families, members } = getState();
  if (!families.find(f => f.id === familyId)) {
    return res.status(400).json({ error: "Family not found." });
  }

  // Resolve email: for children, inherit from parent
  let resolvedEmail = email ? email.trim().toLowerCase() : null;
  let resolvedParentId = null;

  if (isChild && parentId) {
    const parent = members.find(m => m.id === parentId);
    if (!parent) return res.status(400).json({ error: "Parent member not found." });
    resolvedEmail = parent.email;
    resolvedParentId = parentId;
  }

  // Email required unless noSmartphone
  if (!noSmartphone && !isChild && !resolvedEmail) {
    return res.status(400).json({ error: "Email is required unless noSmartphone is checked." });
  }

  const newMember = {
    id: uuidv4(),
    familyId,
    name: name.trim(),
    email: resolvedEmail,
    noSmartphone: !!noSmartphone,
    isChild: !!isChild,
    isParent: !!isParent,
    parentId: resolvedParentId,
  };

  setState({ members: [...members, newMember] });
  res.status(201).json(newMember);
});

router.put("/members/:id", requireAdmin, (req, res) => {
  const { members } = getState();
  const idx = members.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Member not found." });

  const { name, email, noSmartphone, isChild, isParent, parentId } = req.body;

  // Resolve email for children
  let resolvedEmail = email !== undefined ? (email ? email.trim().toLowerCase() : null) : members[idx].email;
  let resolvedParentId = members[idx].parentId;

  if (isChild && parentId) {
    const parent = members.find(m => m.id === parentId);
    if (parent) {
      resolvedEmail = parent.email;
      resolvedParentId = parentId;
    }
  } else if (!isChild) {
    resolvedParentId = null;
  }

  const updated = {
    ...members[idx],
    name: name ? name.trim() : members[idx].name,
    email: resolvedEmail,
    noSmartphone: noSmartphone !== undefined ? !!noSmartphone : members[idx].noSmartphone,
    isChild: isChild !== undefined ? !!isChild : members[idx].isChild,
    isParent: isParent !== undefined ? !!isParent : members[idx].isParent,
    parentId: resolvedParentId,
  };

  const newMembers = [...members];
  newMembers[idx] = updated;
  setState({ members: newMembers });
  res.json(updated);
});

router.delete("/members/:id", requireAdmin, (req, res) => {
  const { members } = getState();
  if (!members.find(m => m.id === req.params.id)) {
    return res.status(404).json({ error: "Member not found." });
  }
  setState({ members: members.filter(m => m.id !== req.params.id) });
  res.json({ ok: true });
});

// ─── Settings ─────────────────────────────────────────────────────────────────

router.post("/settings", requireAdmin, (req, res) => {
  const { meetupDate, adminPassword } = req.body;
  const updates = {};

  if (meetupDate) {
    const d = new Date(meetupDate);
    if (isNaN(d)) return res.status(400).json({ error: "Invalid meetupDate." });
    updates.meetupDate = meetupDate;
  }

  if (adminPassword && adminPassword.trim().length >= 4) {
    updates.adminPassword = adminPassword.trim();
  }

  setState(updates);
  res.json({ ok: true, ...updates });
});

// ─── Draw ─────────────────────────────────────────────────────────────────────

router.post("/draw", requireAdmin, async (req, res) => {
  const state = getState();

  if (state.drawDone) {
    return res.status(400).json({ error: "Draw already done. Reset it first." });
  }

  if (state.members.length < 2) {
    return res.status(400).json({ error: "Need at least 2 participants." });
  }

  if (!state.meetupDate) {
    return res.status(400).json({ error: "Set a meetup date before running the draw." });
  }

  let assignments;
  try {
    assignments = runDraw(state.members);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  setState({ assignments, drawDone: true, remindersSent: [] });

  // Send assignment emails (skip no-smartphone members)
  const emailResults = [];
  for (const assignment of assignments) {
    const giver = state.members.find(m => m.id === assignment.giverId);
    const receiver = state.members.find(m => m.id === assignment.receiverId);
    const receiverFamily = state.families.find(f => f.id === receiver.familyId);

    if (giver.noSmartphone || !giver.email) {
      emailResults.push({ name: giver.name, status: "skipped (no smartphone — print slip)" });
      continue;
    }

    try {
      await sendAssignmentEmail({
        giverName: giver.name,
        giverEmail: giver.email,
        receiverName: receiver.name,
        receiverFamily: receiverFamily ? receiverFamily.name : "",
        meetupDate: state.meetupDate,
        isSharedEmail: state.members.filter(m => m.email === giver.email && m.id !== giver.id).length > 0,
      });
      emailResults.push({ name: giver.name, status: "sent" });
    } catch (err) {
      emailResults.push({ name: giver.name, status: `failed: ${err.message}` });
    }
  }

  res.json({ ok: true, assignmentCount: assignments.length, emailResults });
});

router.delete("/draw", requireAdmin, (req, res) => {
  setState({ assignments: [], drawDone: false, remindersSent: [] });
  res.json({ ok: true });
});

// ─── Assignments (admin view) ─────────────────────────────────────────────────

router.get("/assignments", requireAdmin, (req, res) => {
  const { assignments, members, families } = getState();

  const result = assignments.map(a => {
    const giver = members.find(m => m.id === a.giverId);
    const receiver = members.find(m => m.id === a.receiverId);
    const giverFamily = families.find(f => f.id === giver.familyId);
    const receiverFamily = families.find(f => f.id === receiver.familyId);

    return {
      giverName: giver.name,
      giverFamily: giverFamily ? giverFamily.name : "",
      giverNoSmartphone: giver.noSmartphone,
      receiverName: receiver.name,
      receiverFamily: receiverFamily ? receiverFamily.name : "",
    };
  });

  res.json(result);
});

// ─── Print slip ───────────────────────────────────────────────────────────────

router.get("/slip/:memberId", requireAdmin, (req, res) => {
  const { assignments, members, families, meetupDate } = getState();

  const giver = members.find(m => m.id === req.params.memberId);
  if (!giver) return res.status(404).json({ error: "Member not found." });

  const assignment = assignments.find(a => a.giverId === req.params.memberId);
  if (!assignment) return res.status(404).json({ error: "No assignment found. Run the draw first." });

  const receiver = members.find(m => m.id === assignment.receiverId);
  const receiverFamily = families.find(f => f.id === receiver.familyId);

  res.json({
    giverName: giver.name,
    receiverName: receiver.name,
    receiverFamily: receiverFamily ? receiverFamily.name : "",
    meetupDate,
  });
});

// ─── Test email ───────────────────────────────────────────────────────────────

router.post("/test-email", requireAdmin, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Provide an email address to test." });

  try {
    await sendAssignmentEmail({
      giverName: "Test Person",
      giverEmail: email,
      receiverName: "Another Person",
      receiverFamily: "Test Family",
      meetupDate: new Date().toISOString(),
    });
    res.json({ ok: true, message: `Test email sent to ${email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
