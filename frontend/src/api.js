/**
 * API client — thin wrapper around axios.
 * Reads admin password from sessionStorage so it persists across page navigations
 * but clears when the browser tab is closed.
 */

import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://secret-santa-t50p.onrender.com/api";

function adminHeaders() {
  const pw = sessionStorage.getItem("adminPassword") || "";
  return { "x-admin-password": pw };
}

const api = {
  // ── Status ────────────────────────────────────────────────────────────────
  getStatus: () => axios.get(`${BASE}/status`),

  // ── Families ──────────────────────────────────────────────────────────────
  getFamilies: () => axios.get(`${BASE}/families`, { headers: adminHeaders() }),
  addFamily: (name) => axios.post(`${BASE}/families`, { name }, { headers: adminHeaders() }),
  deleteFamily: (id) => axios.delete(`${BASE}/families/${id}`, { headers: adminHeaders() }),

  // ── Members ───────────────────────────────────────────────────────────────
  getMembers: () => axios.get(`${BASE}/members`, { headers: adminHeaders() }),
  addMember: (data) => axios.post(`${BASE}/members`, data, { headers: adminHeaders() }),
  updateMember: (id, data) => axios.put(`${BASE}/members/${id}`, data, { headers: adminHeaders() }),
  deleteMember: (id) => axios.delete(`${BASE}/members/${id}`, { headers: adminHeaders() }),

  // ── Settings ──────────────────────────────────────────────────────────────
  saveSettings: (data) => axios.post(`${BASE}/settings`, data, { headers: adminHeaders() }),

  // ── Draw ──────────────────────────────────────────────────────────────────
  runDraw: () => axios.post(`${BASE}/draw`, {}, { headers: adminHeaders(), timeout: 60000 }),
  resetDraw: () => axios.delete(`${BASE}/draw`, { headers: adminHeaders() }),
  getAssignments: () => axios.get(`${BASE}/assignments`, { headers: adminHeaders() }),

  // ── Slip ──────────────────────────────────────────────────────────────────
  getSlip: (memberId) => axios.get(`${BASE}/slip/${memberId}`, { headers: adminHeaders() }),

  // ── Registration ──────────────────────────────────────────────────────────
  getPublicFamilies: () => axios.get(`${BASE}/public/families`),
  getMembersPublic: (familyId) => axios.get(`${BASE}/public/members/${familyId}`),
  memberCheckin: (data) => axios.post(`${BASE}/checkin`, data, { timeout: 30000 }),
  submitRegistration: (data) => axios.post(`${BASE}/register`, data),
  getRegistrations: () => axios.get(`${BASE}/registrations`, { headers: adminHeaders() }),
  approveRegistration: (id) => axios.post(`${BASE}/registrations/${id}/approve`, {}, { headers: adminHeaders() }),
  rejectRegistration: (id) => axios.delete(`${BASE}/registrations/${id}`, { headers: adminHeaders() }),
  setRegistrationStatus: (open) => axios.post(`${BASE}/registration-status`, { open }, { headers: adminHeaders() }),


  testEmail: (email) => axios.post(`${BASE}/test-email`, { email }, { headers: adminHeaders(), timeout: 30000 }),
};

export default api;
