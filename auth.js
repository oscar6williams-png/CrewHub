// ═══════════════════════════════════════════════════════
// CREWHUB AUTH
// ═══════════════════════════════════════════════════════

const SUPABASE_URL = 'https://wosvhwqomhvdudvjizsnvf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvc3Zod3FvbWh2ZHVkdmppenNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTE5OTEsImV4cCI6MjA5MjAyNzk5MX0.gqUbZRSRIVP7lFRM0wJHZdaDMcBxr6GIhpFYscZJqgQ';
const ADMIN_EMAIL = 'oscar6williams@gmail.com';
const ADMIN_PW_HASH = 1430816194; // Oscar.UTVandSkye

function hashPass(pass) {
  let h = 0;
  for (let i = 0; i < pass.length; i++) {
    h = ((h << 5) - h) + pass.charCodeAt(i);
    h &= 0xFFFFFFFF;
  }
  return h >>> 0;
}

function checkAdminPassword(pass) {
  return hashPass(pass) === ADMIN_PW_HASH;
}

function saveSession(data) {
  if (data) localStorage.setItem('ch_session', JSON.stringify(data));
  else localStorage.removeItem('ch_session');
}
function loadSession() {
  try { return JSON.parse(localStorage.getItem('ch_session')); } catch { return null; }
}

let currentSession = loadSession();
let currentUser = currentSession?.user || null;

async function trySupabase(path, body, token) {
  try {
    const res = await fetch(SUPABASE_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${token || SUPABASE_KEY}` },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { ok: !data.error, data };
  } catch { return { ok: false, data: null }; }
}

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem('ch_users') || '[]'); } catch { return []; }
}
function saveLocalUsers(u) { localStorage.setItem('ch_users', JSON.stringify(u)); }

async function signUp(email, password, username) {
  const result = await trySupabase('/auth/v1/signup', { email, password, data: { username } });
  if (result.ok && result.data?.access_token) {
    currentSession = result.data; currentUser = result.data.user; saveSession(result.data); return result.data;
  }
  const users = getLocalUsers();
  if (users.find(u => u.email === email)) throw new Error('An account with this email already exists');
  const user = { id: 'local_' + Date.now(), email, user_metadata: { username }, created_at: new Date().toISOString() };
  users.push({ ...user, passHash: hashPass(password) });
  saveLocalUsers(users);
  const session = { user, access_token: 'local_' + Date.now(), local: true };
  currentSession = session; currentUser = user; saveSession(session);
  return session;
}

async function signIn(email, password) {
  const result = await trySupabase('/auth/v1/token?grant_type=password', { email, password });
  if (result.ok && result.data?.access_token) {
    currentSession = result.data; currentUser = result.data.user; saveSession(result.data); return result.data;
  }
  const users = getLocalUsers();
  const user = users.find(u => u.email === email && u.passHash === hashPass(password));
  if (!user) throw new Error('Incorrect email or password');
  const { passHash, ...safeUser } = user;
  const session = { user: safeUser, access_token: 'local_' + Date.now(), local: true };
  currentSession = session; currentUser = safeUser; saveSession(session);
  return session;
}

async function signOut() {
  if (currentSession?.access_token && !currentSession.local) {
    try { await fetch(SUPABASE_URL + '/auth/v1/logout', { method: 'POST', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${currentSession.access_token}` } }); } catch {}
  }
  currentSession = null; currentUser = null; saveSession(null);
}

function getPendingUsers() { try { return JSON.parse(localStorage.getItem('ch_pending') || '[]'); } catch { return []; } }
function savePendingUsers(l) { localStorage.setItem('ch_pending', JSON.stringify(l)); }
function getApprovedEmails() { try { return JSON.parse(localStorage.getItem('ch_approved') || '[]'); } catch { return []; } }
function saveApprovedEmails(l) { localStorage.setItem('ch_approved', JSON.stringify(l)); }
function getDeniedEmails() { try { return JSON.parse(localStorage.getItem('ch_denied') || '[]'); } catch { return []; } }
function saveDeniedEmails(l) { localStorage.setItem('ch_denied', JSON.stringify(l)); }

function isAdmin() { return currentUser?.email === ADMIN_EMAIL; }
function isApproved(email) { if (email === ADMIN_EMAIL) return true; return getApprovedEmails().includes(email); }
function isDenied(email) { return getDeniedEmails().includes(email); }
function isPending(email) { return getPendingUsers().some(u => u.email === email); }

function requestAccess(email, username) {
  const p = getPendingUsers();
  if (!p.some(u => u.email === email)) { p.push({ email, username, requestedAt: new Date().toISOString() }); savePendingUsers(p); }
}
function approveUser(email) {
  const a = getApprovedEmails(); if (!a.includes(email)) a.push(email); saveApprovedEmails(a);
  savePendingUsers(getPendingUsers().filter(u => u.email !== email));
  saveDeniedEmails(getDeniedEmails().filter(e => e !== email));
}
function denyUser(email) {
  const d = getDeniedEmails(); if (!d.includes(email)) d.push(email); saveDeniedEmails(d);
  savePendingUsers(getPendingUsers().filter(u => u.email !== email));
  saveApprovedEmails(getApprovedEmails().filter(e => e !== email));
}
function revokeUser(email) { saveApprovedEmails(getApprovedEmails().filter(e => e !== email)); }

function getUserName() { return currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || 'Friend'; }
function getUserInitials() { return getUserName().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
function getUserEmail() { return currentUser?.email || ''; }
