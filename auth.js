// ═══════════════════════════════════════════════════════
// CREWHUB AUTH — Supabase login/signup + admin system
// ═══════════════════════════════════════════════════════

const SUPABASE_URL = 'https://wosvhwqomhvdudvjizsnvf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvc3Zod3FvbWh2ZHVkdmppenNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTE5OTEsImV4cCI6MjA5MjAyNzk5MX0.gqUbZRSRIVP7lFRM0wJHZdaDMcBxr6GIhpFYscZJqgQ';
const ADMIN_EMAIL = 'oscar6williams@gmail.com';

async function sbFetch(path, options = {}) {
  const res = await fetch(SUPABASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${options.token || SUPABASE_KEY}`,
      ...options.headers,
    }
  });
  return res.json();
}

function saveSession(session) {
  if (session) localStorage.setItem('ch_session', JSON.stringify(session));
  else localStorage.removeItem('ch_session');
}
function loadSession() {
  try { return JSON.parse(localStorage.getItem('ch_session')); } catch { return null; }
}

let currentSession = loadSession();
let currentUser = currentSession?.user || null;

function isAdmin() {
  return currentUser?.email === ADMIN_EMAIL;
}

async function signUp(email, password, username) {
  const data = await sbFetch('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, data: { username } })
  });
  if (data.error) throw new Error(data.error.message || data.msg);
  if (data.access_token) {
    currentSession = data; currentUser = data.user; saveSession(data);
  }
  return data;
}

async function signIn(email, password) {
  const data = await sbFetch('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (data.error) throw new Error(data.error.message || data.msg || 'Invalid login');
  currentSession = data; currentUser = data.user; saveSession(data);
  return data;
}

async function signOut() {
  if (currentSession?.access_token) {
    await sbFetch('/auth/v1/logout', { method: 'POST', token: currentSession.access_token }).catch(() => {});
  }
  currentSession = null; currentUser = null; saveSession(null);
}

// ── Pending users (stored in localStorage for admin to manage) ──
function getPendingUsers() {
  try { return JSON.parse(localStorage.getItem('ch_pending') || '[]'); } catch { return []; }
}
function savePendingUsers(list) {
  localStorage.setItem('ch_pending', JSON.stringify(list));
}
function getApprovedEmails() {
  try { return JSON.parse(localStorage.getItem('ch_approved') || '[]'); } catch { return []; }
}
function saveApprovedEmails(list) {
  localStorage.setItem('ch_approved', JSON.stringify(list));
}
function getDeniedEmails() {
  try { return JSON.parse(localStorage.getItem('ch_denied') || '[]'); } catch { return []; }
}
function saveDeniedEmails(list) {
  localStorage.setItem('ch_denied', JSON.stringify(list));
}

function isApproved(email) {
  if (email === ADMIN_EMAIL) return true;
  return getApprovedEmails().includes(email);
}
function isDenied(email) {
  return getDeniedEmails().includes(email);
}
function isPending(email) {
  return getPendingUsers().some(u => u.email === email);
}

function requestAccess(email, username) {
  const pending = getPendingUsers();
  if (!pending.some(u => u.email === email)) {
    pending.push({ email, username, requestedAt: new Date().toISOString() });
    savePendingUsers(pending);
  }
}

function approveUser(email) {
  const approved = getApprovedEmails();
  if (!approved.includes(email)) approved.push(email);
  saveApprovedEmails(approved);
  const pending = getPendingUsers().filter(u => u.email !== email);
  savePendingUsers(pending);
  const denied = getDeniedEmails().filter(e => e !== email);
  saveDeniedEmails(denied);
}

function denyUser(email) {
  const denied = getDeniedEmails();
  if (!denied.includes(email)) denied.push(email);
  saveDeniedEmails(denied);
  const pending = getPendingUsers().filter(u => u.email !== email);
  savePendingUsers(pending);
  const approved = getApprovedEmails().filter(e => e !== email);
  saveApprovedEmails(approved);
}

function revokeUser(email) {
  const approved = getApprovedEmails().filter(e => e !== email);
  saveApprovedEmails(approved);
}

function getUserName() {
  return currentUser?.user_metadata?.username
    || currentUser?.email?.split('@')[0]
    || 'Friend';
}
function getUserInitials() {
  const name = getUserName();
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function getUserEmail() { return currentUser?.email || ''; }
