// ═══════════════════════════════════════════════════════
// CREWHUB AUTH — Simple local auth + Supabase optional
// ═══════════════════════════════════════════════════════

const SUPABASE_URL = 'https://wosvhwqomhvdudvjizsnvf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvc3Zod3FvbWh2ZHVkdmppenNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTE5OTEsImV4cCI6MjA5MjAyNzk5MX0.gqUbZRSRIVP7lFRM0wJHZdaDMcBxr6GIhpFYscZJqgQ';
const ADMIN_EMAIL = 'oscar6williams@gmail.com';

// ── Simple session stored in localStorage ─────────────
function saveSession(data) {
  if (data) localStorage.setItem('ch_session', JSON.stringify(data));
  else localStorage.removeItem('ch_session');
}
function loadSession() {
  try { return JSON.parse(localStorage.getItem('ch_session')); } catch { return null; }
}

let currentSession = loadSession();
let currentUser = currentSession?.user || null;

// ── Try Supabase, fall back to local user store ────────
async function trySupabase(path, body, token) {
  try {
    const res = await fetch(SUPABASE_URL + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${token || SUPABASE_KEY}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { ok: !data.error, data };
  } catch {
    return { ok: false, data: null };
  }
}

// ── Local user store (fallback) ───────────────────────
function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem('ch_users') || '[]'); } catch { return []; }
}
function saveLocalUsers(users) { localStorage.setItem('ch_users', JSON.stringify(users)); }

function hashPass(pass) {
  // Simple hash — good enough for localStorage
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    hash = ((hash << 5) - hash) + pass.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

async function signUp(email, password, username) {
  // Try Supabase first
  const result = await trySupabase('/auth/v1/signup', {
    email, password, data: { username }
  });

  if (result.ok && result.data?.access_token) {
    const session = result.data;
    currentSession = session;
    currentUser = session.user;
    saveSession(session);
    return session;
  }

  // Fallback: store locally
  const users = getLocalUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('An account with this email already exists');
  }
  const user = {
    id: 'local_' + Date.now(),
    email,
    user_metadata: { username },
    created_at: new Date().toISOString()
  };
  users.push({ ...user, passHash: hashPass(password) });
  saveLocalUsers(users);
  const session = { user, access_token: 'local_' + Date.now(), local: true };
  currentSession = session;
  currentUser = user;
  saveSession(session);
  return session;
}

async function signIn(email, password) {
  // Try Supabase first
  const result = await trySupabase('/auth/v1/token?grant_type=password', { email, password });

  if (result.ok && result.data?.access_token) {
    const session = result.data;
    currentSession = session;
    currentUser = session.user;
    saveSession(session);
    return session;
  }

  // Fallback: check local users
  const users = getLocalUsers();
  const user = users.find(u => u.email === email && u.passHash === hashPass(password));
  if (!user) throw new Error('Incorrect email or password');

  const { passHash, ...safeUser } = user;
  const session = { user: safeUser, access_token: 'local_' + Date.now(), local: true };
  currentSession = session;
  currentUser = safeUser;
  saveSession(session);
  return session;
}

async function signOut() {
  if (currentSession?.access_token && !currentSession.local) {
    try {
      await fetch(SUPABASE_URL + '/auth/v1/logout', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${currentSession.access_token}` }
      });
    } catch {}
  }
  currentSession = null;
  currentUser = null;
  saveSession(null);
}

// ── Approval system ───────────────────────────────────
function getPendingUsers() {
  try { return JSON.parse(localStorage.getItem('ch_pending') || '[]'); } catch { return []; }
}
function savePendingUsers(list) { localStorage.setItem('ch_pending', JSON.stringify(list)); }
function getApprovedEmails() {
  try { return JSON.parse(localStorage.getItem('ch_approved') || '[]'); } catch { return []; }
}
function saveApprovedEmails(list) { localStorage.setItem('ch_approved', JSON.stringify(list)); }
function getDeniedEmails() {
  try { return JSON.parse(localStorage.getItem('ch_denied') || '[]'); } catch { return []; }
}
function saveDeniedEmails(list) { localStorage.setItem('ch_denied', JSON.stringify(list)); }

function isAdmin() { return currentUser?.email === ADMIN_EMAIL; }
function isApproved(email) {
  if (email === ADMIN_EMAIL) return true;
  return getApprovedEmails().includes(email);
}
function isDenied(email) { return getDeniedEmails().includes(email); }
function isPending(email) { return getPendingUsers().some(u => u.email === email); }

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
  savePendingUsers(getPendingUsers().filter(u => u.email !== email));
  saveDeniedEmails(getDeniedEmails().filter(e => e !== email));
}
function denyUser(email) {
  const denied = getDeniedEmails();
  if (!denied.includes(email)) denied.push(email);
  saveDeniedEmails(denied);
  savePendingUsers(getPendingUsers().filter(u => u.email !== email));
  saveApprovedEmails(getApprovedEmails().filter(e => e !== email));
}
function revokeUser(email) {
  saveApprovedEmails(getApprovedEmails().filter(e => e !== email));
}

function getUserName() {
  return currentUser?.user_metadata?.username
    || currentUser?.email?.split('@')[0]
    || 'Friend';
}
function getUserInitials() {
  return getUserName().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function getUserEmail() { return currentUser?.email || ''; }
