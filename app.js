// ═══ AUTH GUARD ══════════════════════════════════════
if (typeof currentUser !== 'undefined') {
  if (!currentUser) {
    window.location.href = 'login.html';
  } else if (currentUser.email !== ADMIN_EMAIL && !isApproved(currentUser.email)) {
    window.location.href = 'login.html';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (typeof getUserName === 'function') {
    const unEl = document.getElementById('sidebar-username');
    const emEl = document.getElementById('sidebar-email');
    const avEl = document.querySelector('.user-avatar');
    if (unEl) unEl.textContent = getUserName();
    if (emEl) emEl.textContent = getUserEmail();
    if (avEl) avEl.textContent = getUserInitials();
    // Show admin link if admin
    if (typeof isAdmin === 'function' && isAdmin()) {
      const footer = document.querySelector('.sidebar-footer');
      if (footer) {
        const adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.style.cssText = 'display:block;margin-top:6px;text-align:center;font-size:11px;font-weight:800;color:var(--pink);text-decoration:none;padding:5px;border-radius:10px;background:var(--pink-light)';
        adminLink.textContent = '⚙️ Admin panel';
        footer.appendChild(adminLink);
      }
    }
  }
});

async function doLogout() {
  if (typeof signOut === 'function') await signOut();
  window.location.href = 'login.html';
}

// ═══════════════════════════════════════════════════════
// CREWHUB — app.js
// ═══════════════════════════════════════════════════════

// ── DATE ────────────────────────────────────────────────
const today = new Date();
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
document.getElementById('todays-date').textContent =
  DAYS[today.getDay()] + ' · ' + MONTHS_SHORT[today.getMonth()] + ' ' + today.getDate();

// ═══ CREWS ══════════════════════════════════════════════
const CREW_COLORS = [
  {bg:'#fbeaf0',accent:'#d4537e',text:'#993556'},
  {bg:'#eeedfe',accent:'#7f77dd',text:'#3c3489'},
  {bg:'#e1f5ee',accent:'#1d9e75',text:'#085041'},
  {bg:'#faeeda',accent:'#ba7517',text:'#633806'},
  {bg:'#e6f1fb',accent:'#378add',text:'#0c447c'},
  {bg:'#faece7',accent:'#d85a30',text:'#712b13'},
];
let selCrewColor = 0;
let crews = [
  {id:'c1',name:'Sunday Ballers',desc:'Football, running, and anything active on weekends. All fitness levels welcome!',leader:'Jordan K.',color:0,members:['Jordan K.','Priya M.','Sam T.'],requests:[],joined:true},
  {id:'c2',name:'FIFA Night Club',desc:'Competitive FIFA sessions every Saturday. Bring your A-game.',leader:'Marcus R.',color:1,members:['Marcus R.','Dev P.','Leila S.'],requests:[],joined:false},
  {id:'c3',name:'Book & Brunch',desc:'Monthly book club followed by brunch. Currently reading Pachinko.',leader:'Cleo R.',color:2,members:['Cleo R.','Nina A.','Yusuf B.'],requests:[{name:'Alex W.',reason:'Love reading!',id:'r1'}],joined:false},
  {id:'c4',name:'Rooftop Socials',desc:'Spontaneous rooftop meetups, drinks and good vibes.',leader:'Jordan K.',color:3,members:['Jordan K.','Priya M.'],requests:[{name:'Sam T.',reason:'Sounds amazing!',id:'r2'}],joined:true},
];
let pendingJoinId = null;

function renderSidebarCrews() {
  const mine = crews.filter(c => c.joined || c.leader === 'Jordan K.');
  document.getElementById('sidebar-crews').innerHTML = mine.map(c => {
    const col = CREW_COLORS[c.color];
    const ini = c.name.split(' ').map(w => w[0]).join('').slice(0,2);
    return `<div class="crew-nav-item" onclick="viewCrew('${c.id}')">
      <div class="crew-icon" style="background:${col.bg};color:${col.accent}">${ini}</div>
      <div style="flex:1;min-width:0">
        <div class="crew-nav-name">${c.name}</div>
        <div class="crew-nav-role">${c.leader==='Jordan K.'?'leader':'member'}</div>
      </div>
    </div>`;
  }).join('');
  updateInboxBadge();
}

function updateInboxBadge() {
  const total = crews.filter(c => c.leader === 'Jordan K.').reduce((s,c) => s+c.requests.length, 0);
  const b = document.getElementById('inbox-badge');
  if (total) { b.style.display = ''; b.textContent = total; } else b.style.display = 'none';
  const sr = document.getElementById('stat-reqs');
  if (sr) sr.textContent = total;
}

function renderDiscover() {
  const q = (document.getElementById('search-input')?.value || '').toLowerCase();
  const filtered = crews.filter(c => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  const list = document.getElementById('discover-list');
  if (!filtered.length) { list.innerHTML = `<div class="empty-state">No crews found.</div>`; return; }
  list.innerHTML = filtered.map(c => {
    const col = CREW_COLORS[c.color];
    const isMember = c.joined || c.members.includes('Jordan K.');
    const isLeader = c.leader === 'Jordan K.';
    const ini = c.name.split(' ').map(w => w[0]).join('').slice(0,3);
    return `<div class="crew-card ${isMember?'joined':''}" onclick="viewCrew('${c.id}')">
      <div class="crew-banner" style="background:${col.bg};color:${col.accent}">${ini}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div>
          <div style="font-size:14px;font-weight:800;color:var(--text)">${c.name}</div>
          <div style="font-size:12px;color:var(--text-mid);margin-top:2px">${c.members.length} members · ${c.leader}</div>
          <div style="font-size:12px;color:#7a5060;margin-top:6px;line-height:1.45">${c.desc}</div>
        </div>
        <div style="flex-shrink:0">
          ${isLeader ? `<span class="pill pill-pink">Leader</span>`
            : isMember ? `<span class="pill pill-green">Joined</span>`
            : `<span class="pill pill-gray">Join</span>`}
        </div>
      </div>
    </div>`;
  }).join('');
}

function viewCrew(id) {
  const c = crews.find(x => x.id === id);
  const col = CREW_COLORS[c.color];
  const isMember = c.joined || c.members.includes('Jordan K.');
  const isLeader = c.leader === 'Jordan K.';
  const ini = c.name.split(' ').map(w => w[0]).join('').slice(0,3);
  document.getElementById('topbar-title').textContent = c.name;
  document.getElementById('topbar-sub').textContent = `${c.members.length} members · ${c.leader}`;
  document.getElementById('topbar-actions').innerHTML = '';
  document.getElementById('crew-detail-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <div style="width:68px;height:68px;border-radius:14px;background:${col.bg};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:${col.accent};flex-shrink:0">${ini}</div>
      <div><div style="font-size:20px;font-weight:800;color:var(--text)">${c.name}</div><div style="font-size:13px;color:var(--text-mid);margin-top:3px">${c.desc}</div></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${isLeader ? `<span class="pill pill-pink" style="font-size:12px;padding:5px 12px">You lead this crew</span>`
        : isMember ? `<button class="btn btn-ghost btn-sm" onclick="leaveCrew('${id}')">Leave crew</button>`
        : `<button class="btn btn-pink" onclick="openJoin('${id}')">Request to join</button>`}
    </div>
    <div class="card">
      <div class="card-label">Members (${c.members.length})</div>
      ${c.members.map((m,i) => `<div class="member-row">
        <div class="avatar" style="background:${col.bg};color:${col.accent}">${m.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--text)">${m}</div><div style="font-size:11px;color:var(--text-mid)">${i===0?'leader':'member'}</div></div>
        ${isLeader&&i>0 ? `<button class="btn btn-danger btn-sm" onclick="kickMember('${id}','${m}')">Remove</button>` : ''}
      </div>`).join('')}
    </div>
    ${isLeader && c.requests.length ? `<div class="card">
      <div class="card-label">Join requests (${c.requests.length})</div>
      ${c.requests.map(r => `<div class="req-row">
        <div class="avatar" style="background:#f5eeff;color:#3c3489">${r.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--text)">${r.name}</div>${r.reason?`<div style="font-size:11px;color:var(--text-mid)">"${r.reason}"</div>`:''}</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-pink btn-sm" onclick="approveReq('${id}','${r.id}')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="denyReq('${id}','${r.id}')">Deny</button>
        </div>
      </div>`).join('')}
    </div>` : ''}
  `;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('screen-crew').classList.add('active');
  document.getElementById('nav-discover').classList.add('active');
}

function openJoin(id) {
  const c = crews.find(x => x.id === id); pendingJoinId = id;
  document.getElementById('join-modal-title').textContent = `Join "${c.name}"`;
  document.getElementById('join-modal-desc').textContent = `Your request will be sent to ${c.leader} for approval.`;
  document.getElementById('join-name').value = ''; document.getElementById('join-reason').value = '';
  openModal('modal-join');
}
function submitJoin() {
  const name = document.getElementById('join-name').value.trim();
  if (!name) { document.getElementById('join-name').style.borderColor='var(--pink)'; return; }
  crews.find(x => x.id === pendingJoinId).requests.push({name, reason: document.getElementById('join-reason').value.trim(), id:'r'+Date.now()});
  closeModal('modal-join'); showToast('Request sent!'); updateInboxBadge(); viewCrew(pendingJoinId);
}
function approveReq(crewId, reqId) {
  const c = crews.find(x => x.id === crewId), req = c.requests.find(r => r.id === reqId);
  c.members.push(req.name); c.requests = c.requests.filter(r => r.id !== reqId);
  showToast(`${req.name} approved!`); updateInboxBadge(); renderSidebarCrews(); viewCrew(crewId); renderInbox();
}
function denyReq(crewId, reqId) {
  const c = crews.find(x => x.id === crewId), req = c.requests.find(r => r.id === reqId);
  c.requests = c.requests.filter(r => r.id !== reqId);
  showToast(`${req.name} declined.`); updateInboxBadge(); viewCrew(crewId); renderInbox();
}
function kickMember(crewId, name) {
  crews.find(x => x.id === crewId).members = crews.find(x => x.id === crewId).members.filter(m => m !== name);
  showToast(`${name} removed.`); viewCrew(crewId);
}
function leaveCrew(crewId) {
  const c = crews.find(x => x.id === crewId); c.joined = false; c.members = c.members.filter(m => m !== 'Jordan K.');
  showToast(`Left ${c.name}.`); renderSidebarCrews(); goTo('discover', document.getElementById('nav-discover'));
}
function createCrew() {
  const name = document.getElementById('new-name').value.trim(), leader = document.getElementById('new-leader').value.trim();
  if (!name || !leader) { if(!name) document.getElementById('new-name').style.borderColor='var(--pink)'; if(!leader) document.getElementById('new-leader').style.borderColor='var(--pink)'; return; }
  crews.unshift({id:'c'+Date.now(), name, desc: document.getElementById('new-desc').value.trim()||'A brand new crew.', leader, color: selCrewColor, members:[leader], requests:[], joined: leader==='Jordan K.'});
  closeModal('modal-create'); document.getElementById('new-name').value=''; document.getElementById('new-desc').value=''; document.getElementById('new-leader').value='';
  showToast(`"${name}" created!`); renderSidebarCrews(); renderDiscover();
}
function renderInbox() {
  const reqs = crews.filter(c => c.leader==='Jordan K.').flatMap(c => c.requests.map(r => ({...r, crewId:c.id, crewName:c.name})));
  const list = document.getElementById('inbox-list');
  if (!reqs.length) { list.innerHTML=`<div class="empty-state">No pending requests.<br/>Join requests for your crews appear here.</div>`; return; }
  list.innerHTML = reqs.map(r => `<div class="inbox-card">
    <div style="font-size:10px;font-weight:800;color:var(--text-mid);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">${r.crewName}</div>
    <div class="req-row" style="padding:0">
      <div class="avatar" style="background:#f5eeff;color:#3c3489">${r.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--text)">${r.name}</div>${r.reason?`<div style="font-size:12px;color:var(--text-mid)">"${r.reason}"</div>`:''}</div>
      <div style="display:flex;gap:7px">
        <button class="btn btn-pink btn-sm" onclick="approveReq('${r.crewId}','${r.id}');renderInbox()">Approve</button>
        <button class="btn btn-danger btn-sm" onclick="denyReq('${r.crewId}','${r.id}');renderInbox()">Deny</button>
      </div>
    </div>
  </div>`).join('');
}

// ═══ CALENDAR ═══════════════════════════════════════════
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
let viewYear = today.getFullYear(), viewMonth = today.getMonth(), selDate = null, diaryEntries = {}, diaryImgData = null;
function dateKey(y,m,d) { return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
function renderCalendar() {
  document.getElementById('month-label').textContent = `${MONTHS[viewMonth]} ${viewYear}`;
  const grid = document.getElementById('cal-grid');
  const headers = Array.from(grid.querySelectorAll('.day-label'));
  grid.innerHTML = ''; headers.forEach(h => grid.appendChild(h));
  const first = new Date(viewYear,viewMonth,1).getDay(), dim = new Date(viewYear,viewMonth+1,0).getDate(), prev = new Date(viewYear,viewMonth,0).getDate();
  for (let i=0; i<first; i++) grid.appendChild(mkCell(prev-first+1+i, true));
  for (let d=1; d<=dim; d++) {
    const c = mkCell(d, false);
    if (d===today.getDate()&&viewMonth===today.getMonth()&&viewYear===today.getFullYear()) c.classList.add('today');
    if (diaryEntries[dateKey(viewYear,viewMonth,d)]?.length) c.classList.add('has-entry');
    if (selDate&&selDate.d===d&&selDate.m===viewMonth&&selDate.y===viewYear) c.classList.add('selected');
    c.onclick = () => selectDay(d); grid.appendChild(c);
  }
  const rem = 42-first-dim; for (let d=1; d<=rem; d++) grid.appendChild(mkCell(d, true));
}
function mkCell(d, other) { const el=document.createElement('div'); el.className='day-cell'+(other?' other-month':''); el.innerHTML=`<span class="day-num">${d}</span>`; return el; }
function selectDay(d) {
  selDate = {d, m:viewMonth, y:viewYear}; renderCalendar();
  const key = dateKey(selDate.y,selDate.m,selDate.d);
  document.getElementById('cal-date-header').textContent = `${d} ${MONTHS[viewMonth]}`;
  document.getElementById('add-entry-btn').style.display = 'block';
  const entries = diaryEntries[key] || [];
  const container = document.getElementById('cal-entries');
  if (!entries.length) { container.innerHTML=`<div style="color:var(--text-light);font-size:13px;padding:14px 0">Nothing here yet — add a memory!</div>`; return; }
  container.innerHTML = entries.map((e,i) => `<div class="entry-card">
    ${e.img ? `<img class="entry-img" src="${e.img}" alt=""/>` : ''}
    <div class="entry-body">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          ${e.time ? `<div class="entry-time">${fmtTime(e.time)}</div>` : ''}
          <div class="entry-title" style="border-left:3px solid ${e.color};padding-left:7px">${e.title}</div>
          ${e.note ? `<div class="entry-note">${e.note}</div>` : ''}
        </div>
        <button onclick="delEntry('${key}',${i})" style="background:none;border:none;cursor:pointer;color:var(--text-light);font-size:16px;padding:0 0 0 8px">&times;</button>
      </div>
    </div>
  </div>`).join('');
}
function fmtTime(t) { if(!t) return ''; const [h,m]=t.split(':').map(Number); return `${h%12||12}:${String(m).padStart(2,'0')}${h>=12?'pm':'am'}`; }
function delEntry(key,idx) { diaryEntries[key].splice(idx,1); renderCalendar(); selectDay(selDate.d); }
function changeMonth(dir) { viewMonth+=dir; if(viewMonth>11){viewMonth=0;viewYear++;} if(viewMonth<0){viewMonth=11;viewYear--;} renderCalendar(); if(selDate&&(selDate.m!==viewMonth||selDate.y!==viewYear)){document.getElementById('cal-date-header').textContent='Select a date';document.getElementById('cal-entries').innerHTML='';document.getElementById('add-entry-btn').style.display='none';} }
function triggerDiaryImg() { document.getElementById('diary-img-file').click(); }
function handleDiaryImg(e) { const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{diaryImgData=ev.target.result; const p=document.getElementById('diary-img-preview'); p.src=diaryImgData; p.style.display='block';}; r.readAsDataURL(f); e.target.value=''; }
function saveDiaryEntry() {
  const title = document.getElementById('diary-title').value.trim();
  if (!title) { document.getElementById('diary-title').style.borderColor='var(--pink)'; return; }
  const key = dateKey(selDate.y,selDate.m,selDate.d);
  if (!diaryEntries[key]) diaryEntries[key] = [];
  diaryEntries[key].push({title, time:document.getElementById('diary-time').value, note:document.getElementById('diary-note').value.trim(), color:document.getElementById('diary-color').value, img:diaryImgData});
  diaryEntries[key].sort((a,b) => a.time.localeCompare(b.time));
  closeModal('modal-diary'); document.getElementById('diary-title').value=''; document.getElementById('diary-note').value=''; document.getElementById('diary-time').value='';
  diaryImgData=null; document.getElementById('diary-img-preview').style.display='none';
  renderCalendar(); selectDay(selDate.d); showToast('Memory saved!');
}
diaryEntries[dateKey(today.getFullYear(),today.getMonth(),today.getDate())] = [{title:'Football practice',time:'17:00',note:'Marshfield Park — bring water!',color:'#d4537e',img:null}];

// ═══ CHAT CANVAS ════════════════════════════════════════
const TEXT_COLORS = ['#3a2030','#d4537e','#993556','#c96aaa','#7f77dd','#378add','#1d9e75','#ba7517','#e07040','#ffffff','#f4c0d1','#000000'];
const OUTLINE_COLORS = ['#d4537e','#993556','#ffffff','#3a2030','#7f77dd','#1d9e75','#ba7517','#378add','#e07040','#c96aaa','#000000','#f4c0d1'];
let moveMode=false, chatSelected=null, nextZ=10, chatFontSize=22;
let chatStyles = {bold:false,italic:false,underline:false,strike:false};
let chatTextColor='#3a2030', chatOutline='none', chatOutlineColor='#d4537e';

function toggleMoveMode() { moveMode=!moveMode; const pill=document.getElementById('move-pill'); if(moveMode){pill.textContent='chat mode';pill.classList.add('btn-pink');pill.classList.remove('btn-outline');}else{pill.textContent='move mode';pill.classList.remove('btn-pink');pill.classList.add('btn-outline');} }
function showChatPanel(id,btn) { document.querySelectorAll('.chat-panel').forEach(p=>p.classList.remove('active')); document.querySelectorAll('.chat-tab').forEach(t=>t.classList.remove('active')); document.getElementById(id).classList.add('active'); btn.classList.add('active'); }
function chatKey(e) { if(e.key==='Enter') addChatText(); }
function addChatText() { const inp=document.getElementById('chat-input'); const txt=inp.value.trim(); if(!txt) return; inp.value=''; const canvas=document.getElementById('canvas'); const r=canvas.getBoundingClientRect(); spawnText(txt,Math.round(20+Math.random()*(r.width-240)),Math.round(20+Math.random()*(Math.max(60,r.height-100)))); }
function spawnText(txt,x,y) {
  const id='i'+Date.now()+Math.floor(Math.random()*9999);
  const el=document.createElement('div'); el.className='free-item free-text'; el.id=id; el.style.cssText=`left:${x}px;top:${y}px;z-index:${nextZ++};`;
  el.dataset.txt=txt; el.dataset.color=chatTextColor; el.dataset.outlineType=chatOutline; el.dataset.outlineColor=chatOutlineColor; el.dataset.fontSize=chatFontSize;
  el.dataset.bold=chatStyles.bold; el.dataset.italic=chatStyles.italic; el.dataset.underline=chatStyles.underline; el.dataset.strike=chatStyles.strike;
  el.innerHTML=`<button class="del-btn" onclick="delChatItem('${id}',event)">&times;</button><div class="item-inner"></div>`;
  renderTextEl(el); attachChatDrag(el); document.getElementById('canvas').appendChild(el); chatSelectItem(el);
}
function renderTextEl(el) {
  const inner=el.querySelector('.item-inner'), c=el.dataset.color||'#3a2030', ot=el.dataset.outlineType||'none', oc=el.dataset.outlineColor||'#d4537e';
  const fs=parseInt(el.dataset.fontSize)||22, bold=el.dataset.bold==='true', italic=el.dataset.italic==='true', underline=el.dataset.underline==='true', strike=el.dataset.strike==='true';
  let ts='none';
  if(ot==='thin') ts=`-1px -1px 0 ${oc},1px -1px 0 ${oc},-1px 1px 0 ${oc},1px 1px 0 ${oc}`;
  else if(ot==='thick') ts=`-2px -2px 0 ${oc},2px -2px 0 ${oc},-2px 2px 0 ${oc},2px 2px 0 ${oc},-2px 0 0 ${oc},2px 0 0 ${oc},0 -2px 0 ${oc},0 2px 0 ${oc}`;
  else if(ot==='glow') ts=`0 0 8px ${oc},0 0 18px ${oc},0 0 3px ${oc}`;
  let deco=[]; if(underline) deco.push('underline'); if(strike) deco.push('line-through');
  inner.style.cssText=`color:${c};font-size:${fs}px;font-weight:${bold?'800':'400'};font-style:${italic?'italic':'normal'};text-decoration:${deco.length?deco.join(' '):'none'};text-shadow:${ts};white-space:nowrap;padding:4px 2px;line-height:1.2;font-family:var(--font);pointer-events:none;`;
  inner.textContent=el.dataset.txt;
}
function triggerChatImg() { document.getElementById('chat-img-file').click(); }
function handleChatImgs(e) { Array.from(e.target.files).forEach(f=>{const r=new FileReader();r.onload=ev=>{const canvas=document.getElementById('canvas');const cr=canvas.getBoundingClientRect();spawnChatImg(ev.target.result,Math.round(20+Math.random()*(cr.width-220)),Math.round(20+Math.random()*(Math.max(60,cr.height-200))));};r.readAsDataURL(f);}); e.target.value=''; }
function spawnChatImg(src,x,y) { const id='i'+Date.now()+Math.floor(Math.random()*9999); const el=document.createElement('div'); el.className='free-item free-img'; el.id=id; el.style.cssText=`left:${x}px;top:${y}px;z-index:${nextZ++};`; el.innerHTML=`<button class="del-btn" onclick="delChatItem('${id}',event)">&times;</button><div class="item-inner"><img src="${src}" draggable="false" style="max-width:200px;border-radius:13px;display:block;pointer-events:none"/></div>`; attachChatDrag(el); document.getElementById('canvas').appendChild(el); chatSelectItem(el); }
function delChatItem(id,e) { e.stopPropagation(); const el=document.getElementById(id); if(el){el.remove(); if(chatSelected?.id===id) chatSelected=null;} }
function chatSelectItem(el) { if(chatSelected) chatSelected.classList.remove('selected'); chatSelected=el; el.classList.add('selected'); el.style.zIndex=nextZ++; if(el.classList.contains('free-text')) syncChatStyleBtns(el); }
function canvasClick(e) { if(e.target===document.getElementById('canvas')&&chatSelected){chatSelected.classList.remove('selected');chatSelected=null;} }
function syncChatStyleBtns(el) { ['bold','italic','underline','strike'].forEach(s=>document.getElementById('btn-'+s)?.classList.toggle('on',el.dataset[s]==='true')); ['none','thin','thick','glow'].forEach(t=>document.getElementById('out-'+t)?.classList.toggle('on',(el.dataset.outlineType||'none')===t)); chatTextColor=el.dataset.color||'#3a2030'; chatOutlineColor=el.dataset.outlineColor||'#d4537e'; chatFontSize=parseInt(el.dataset.fontSize)||22; document.getElementById('sz-label').textContent=chatFontSize; renderChatColorDots(); }
function toggleStyle(s) { chatStyles[s]=!chatStyles[s]; document.getElementById('btn-'+s)?.classList.toggle('on',chatStyles[s]); if(chatSelected?.classList.contains('free-text')){chatSelected.dataset[s]=chatStyles[s];renderTextEl(chatSelected);} }
function setOutline(t) { chatOutline=t; ['none','thin','thick','glow'].forEach(x=>document.getElementById('out-'+x)?.classList.toggle('on',x===t)); if(chatSelected?.classList.contains('free-text')){chatSelected.dataset.outlineType=t;renderTextEl(chatSelected);} }
function changeSize(d) { chatFontSize=Math.max(10,Math.min(96,chatFontSize+d)); document.getElementById('sz-label').textContent=chatFontSize; if(chatSelected?.classList.contains('free-text')){chatSelected.dataset.fontSize=chatFontSize;renderTextEl(chatSelected);} }
function renderChatColorDots() {
  const mkDots=(id,colors,getSelected,fn)=>{const el=document.getElementById(id);if(!el)return;el.innerHTML=colors.map(c=>`<div class="c-dot ${getSelected()===c?'sel':''}" style="background:${c};${c==='#ffffff'?'border:1px solid #ddd':''}" onclick="${fn}('${c}')"></div>`).join('');};
  mkDots('text-colors',TEXT_COLORS,()=>chatTextColor,'pickTextColor');
  mkDots('outline-colors',OUTLINE_COLORS,()=>chatOutlineColor,'pickOutlineColor');
}
window.pickTextColor = c => { chatTextColor=c; if(chatSelected?.classList.contains('free-text')){chatSelected.dataset.color=c;renderTextEl(chatSelected);} renderChatColorDots(); };
window.pickOutlineColor = c => { chatOutlineColor=c; if(chatSelected?.classList.contains('free-text')){chatSelected.dataset.outlineColor=c;renderTextEl(chatSelected);} renderChatColorDots(); };
function attachChatDrag(el) {
  let sx,sy,sl,st,dragging=false;
  const xy = ev => ev.touches ? {x:ev.touches[0].clientX,y:ev.touches[0].clientY} : {x:ev.clientX,y:ev.clientY};
  const down = ev => {
    if(ev.target.classList.contains('del-btn')) return;
    ev.stopPropagation(); chatSelectItem(el);
    const p=xy(ev); sx=p.x; sy=p.y; sl=parseInt(el.style.left)||0; st=parseInt(el.style.top)||0; dragging=false;
    const move = mv => { const p=xy(mv),dx=p.x-sx,dy=p.y-sy; if(!dragging&&Math.abs(dx)+Math.abs(dy)>3)dragging=true; if(dragging){mv.preventDefault();const cr=document.getElementById('canvas').getBoundingClientRect();el.style.left=Math.max(0,Math.min(cr.width-el.offsetWidth,sl+dx))+'px';el.style.top=Math.max(0,Math.min(cr.height-el.offsetHeight,st+dy))+'px';} };
    const up = () => { document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);document.removeEventListener('touchmove',move);document.removeEventListener('touchend',up); };
    document.addEventListener('mousemove',move); document.addEventListener('mouseup',up); document.addEventListener('touchmove',move,{passive:false}); document.addEventListener('touchend',up);
  };
  el.addEventListener('mousedown',down); el.addEventListener('touchstart',down,{passive:true});
}
function seedChat() {
  const seeds=[{txt:'hey crew!',x:28,y:18,color:'#d4537e',ot:'thick',oc:'#993556',fs:30,bold:true},{txt:'Sunday picnic',x:78,y:96,color:'#7f77dd',ot:'thin',oc:'#fff',fs:22},{txt:"who's in?",x:36,y:176,color:'#1d9e75',ot:'glow',oc:'#1d9e75',fs:19,italic:true},{txt:'bring snacks!',x:170,y:260,color:'#ba7517',ot:'none',oc:'#d4537e',fs:17,underline:true}];
  seeds.forEach(s=>{const id='i'+Date.now()+Math.floor(Math.random()*9999);const el=document.createElement('div');el.className='free-item free-text';el.id=id;el.style.cssText=`left:${s.x}px;top:${s.y}px;z-index:${nextZ++};`;el.dataset.txt=s.txt;el.dataset.color=s.color;el.dataset.outlineType=s.ot;el.dataset.outlineColor=s.oc;el.dataset.fontSize=s.fs||18;el.dataset.bold=s.bold||false;el.dataset.italic=s.italic||false;el.dataset.underline=s.underline||false;el.dataset.strike=false;el.innerHTML=`<button class="del-btn" onclick="delChatItem('${id}',event)">&times;</button><div class="item-inner"></div>`;renderTextEl(el);attachChatDrag(el);document.getElementById('canvas').appendChild(el);});
}

// ═══ PETS ════════════════════════════════════════════════
const PET_TYPES = [
  {name:'Blossom',bodyColor:'#f4c0d1',cheekColor:'#e88fab',earColor:'#edaac4',eyeColor:'#3a2030',type:'bunny'},
  {name:'Mochi',bodyColor:'#faeeda',cheekColor:'#fac775',earColor:'#f4c0d1',eyeColor:'#3a2030',type:'bear'},
  {name:'Daisy',bodyColor:'#9fe1cb',cheekColor:'#5dcaa5',earColor:'#9fe1cb',eyeColor:'#085041',type:'cat'},
  {name:'Luna',bodyColor:'#cecbf6',cheekColor:'#afa9ec',earColor:'#cecbf6',eyeColor:'#3c3489',type:'bunny'},
  {name:'Maple',bodyColor:'#fac775',cheekColor:'#e07040',earColor:'#fac775',eyeColor:'#412402',type:'bear'},
];
let pets = [
  {...PET_TYPES[0],food:75,water:60,happy:80,streak:7,alive:true,id:0},
  {...PET_TYPES[1],food:40,water:85,happy:65,streak:5,alive:true,id:1},
  {...PET_TYPES[2],food:20,water:30,happy:35,streak:2,alive:true,id:2},
];
let petNextId=3, activePetId=0, petHovered={};

function drawPetSVG(pet,size=76,isHov=false){
  const s=size,cx=s/2,cy=s/2+4,body=pet.bodyColor,cheek=pet.cheekColor,ear=pet.earColor,eye=pet.eyeColor,ol='#3a2030';
  const alive=pet.alive,sad=pet.food<25||pet.water<25;
  let ears='';
  if(pet.type==='bunny'){ears=`<ellipse cx="${cx-11}" cy="${cy-24}" rx="5.5" ry="11" fill="${ear}" stroke="${ol}" stroke-width="1.2"/><ellipse cx="${cx-11}" cy="${cy-24}" rx="3" ry="7" fill="${cheek}" opacity=".5"/><ellipse cx="${cx+11}" cy="${cy-24}" rx="5.5" ry="11" fill="${ear}" stroke="${ol}" stroke-width="1.2"/><ellipse cx="${cx+11}" cy="${cy-24}" rx="3" ry="7" fill="${cheek}" opacity=".5"/>`;}
  else if(pet.type==='bear'){ears=`<circle cx="${cx-15}" cy="${cy-19}" r="7.5" fill="${ear}" stroke="${ol}" stroke-width="1.2"/><circle cx="${cx-15}" cy="${cy-19}" r="4" fill="${cheek}" opacity=".55"/><circle cx="${cx+15}" cy="${cy-19}" r="7.5" fill="${ear}" stroke="${ol}" stroke-width="1.2"/><circle cx="${cx+15}" cy="${cy-19}" r="4" fill="${cheek}" opacity=".55"/>`;}
  else{ears=`<polygon points="${cx-17},${cy-21} ${cx-9},${cy-32} ${cx-3},${cy-21}" fill="${ear}" stroke="${ol}" stroke-width="1.2"/><polygon points="${cx+17},${cy-21} ${cx+9},${cy-32} ${cx+3},${cy-21}" fill="${ear}" stroke="${ol}" stroke-width="1.2"/>`;}
  let eyeL,eyeR;
  if(!alive){eyeL=`<line x1="${cx-10}" y1="${cy-6}" x2="${cx-6}" y2="${cy-2}" stroke="${eye}" stroke-width="1.4" stroke-linecap="round"/><line x1="${cx-6}" y1="${cy-6}" x2="${cx-10}" y2="${cy-2}" stroke="${eye}" stroke-width="1.4" stroke-linecap="round"/>`;eyeR=`<line x1="${cx+6}" y1="${cy-6}" x2="${cx+10}" y2="${cy-2}" stroke="${eye}" stroke-width="1.4" stroke-linecap="round"/><line x1="${cx+10}" y1="${cy-6}" x2="${cx+6}" y2="${cy-2}" stroke="${eye}" stroke-width="1.4" stroke-linecap="round"/>`;}
  else{eyeL=`<ellipse cx="${cx-9}" cy="${cy-4}" rx="3.2" ry="3.8" fill="${eye}" style="animation:blink 3s ease-in-out infinite"/><ellipse cx="${cx-8}" cy="${cy-5.5}" rx="1.1" ry="1.1" fill="white"/>`;eyeR=`<ellipse cx="${cx+9}" cy="${cy-4}" rx="3.2" ry="3.8" fill="${eye}" style="animation:blink 3s ease-in-out infinite .1s"/><ellipse cx="${cx+10}" cy="${cy-5.5}" rx="1.1" ry="1.1" fill="white"/>`;}
  let mouth;
  if(!alive) mouth=`<path d="M${cx-5} ${cy+6} Q${cx} ${cy+3} ${cx+5} ${cy+6}" fill="none" stroke="${eye}" stroke-width="1.2" stroke-linecap="round"/>`;
  else if(isHov) mouth=`<ellipse cx="${cx}" cy="${cy+7}" rx="5.5" ry="3.8" fill="#3a2030"/><ellipse cx="${cx}" cy="${cy+8}" rx="3.5" ry="2.2" fill="#e88fab"/>`;
  else if(sad) mouth=`<path d="M${cx-5} ${cy+8} Q${cx} ${cy+5} ${cx+5} ${cy+8}" fill="none" stroke="${eye}" stroke-width="1.2" stroke-linecap="round"/>`;
  else mouth=`<path d="M${cx-5} ${cy+6} Q${cx} ${cy+10} ${cx+5} ${cy+6}" fill="none" stroke="${eye}" stroke-width="1.2" stroke-linecap="round"/>`;
  const bs=alive&&!sad?`style="animation:bounce 1.2s ease-in-out infinite"`:'';
  const tw=`style="transform-origin:${cx+21}px ${cy+10}px;animation:tailWag 0.8s ease-in-out infinite"`;
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg"><g ${bs}>${ears}<ellipse cx="${cx}" cy="${cy}" rx="21" ry="19" fill="${body}" stroke="${ol}" stroke-width="1.3"/><ellipse cx="${cx-7}" cy="${cy+4}" rx="6.5" ry="8.5" fill="${body}" stroke="${ol}" stroke-width="1.1"/><ellipse cx="${cx+7}" cy="${cy+4}" rx="6.5" ry="8.5" fill="${body}" stroke="${ol}" stroke-width="1.1"/><ellipse cx="${cx}" cy="${cy+15}" rx="8.5" ry="5.5" fill="${body}" stroke="${ol}" stroke-width="1.1"/><ellipse cx="${cx-12}" cy="${cy}" rx="3.8" ry="2.8" fill="${cheek}" opacity=".38"/><ellipse cx="${cx+12}" cy="${cy}" rx="3.8" ry="2.8" fill="${cheek}" opacity=".38"/>${eyeL}${eyeR}<ellipse cx="${cx}" cy="${cy+2}" rx="2.2" ry="1.6" fill="${cheek}"/>${mouth}</g><ellipse cx="${cx+21}" cy="${cy+10}" rx="4.5" ry="3.2" fill="${body}" stroke="${ol}" stroke-width="1.1" ${tw}/></svg>`;
}
function drawBigPetSVG(pet,size=106){
  const s=size,cx=s/2,cy=s/2+6,body=pet.bodyColor,cheek=pet.cheekColor,ear=pet.earColor,eye=pet.eyeColor,ol='#3a2030';
  let ears='';
  if(pet.type==='bunny'){ears=`<ellipse cx="${cx-17}" cy="${cy-32}" rx="7.5" ry="15" fill="${ear}" stroke="${ol}" stroke-width="1.4"/><ellipse cx="${cx-17}" cy="${cy-32}" rx="4.5" ry="10" fill="${cheek}" opacity=".42"/><ellipse cx="${cx+17}" cy="${cy-32}" rx="7.5" ry="15" fill="${ear}" stroke="${ol}" stroke-width="1.4"/><ellipse cx="${cx+17}" cy="${cy-32}" rx="4.5" ry="10" fill="${cheek}" opacity=".42"/>`;}
  else if(pet.type==='bear'){ears=`<circle cx="${cx-21}" cy="${cy-26}" r="10.5" fill="${ear}" stroke="${ol}" stroke-width="1.4"/><circle cx="${cx-21}" cy="${cy-26}" r="6" fill="${cheek}" opacity=".52"/><circle cx="${cx+21}" cy="${cy-26}" r="10.5" fill="${ear}" stroke="${ol}" stroke-width="1.4"/><circle cx="${cx+21}" cy="${cy-26}" r="6" fill="${cheek}" opacity=".52"/>`;}
  else{ears=`<polygon points="${cx-23},${cy-27} ${cx-12},${cy-44} ${cx-4},${cy-27}" fill="${ear}" stroke="${ol}" stroke-width="1.4"/><polygon points="${cx+23},${cy-27} ${cx+12},${cy-44} ${cx+4},${cy-27}" fill="${ear}" stroke="${ol}" stroke-width="1.4"/>`;}
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" style="animation:bigBounce 2s ease-in-out infinite">${ears}<ellipse cx="${cx}" cy="${cy}" rx="28" ry="26" fill="${body}" stroke="${ol}" stroke-width="1.5"/><ellipse cx="${cx-10}" cy="${cy+5}" rx="9.5" ry="12.5" fill="${body}" stroke="${ol}" stroke-width="1.3"/><ellipse cx="${cx+10}" cy="${cy+5}" rx="9.5" ry="12.5" fill="${body}" stroke="${ol}" stroke-width="1.3"/><ellipse cx="${cx}" cy="${cy+21}" rx="11.5" ry="7.5" fill="${body}" stroke="${ol}" stroke-width="1.3"/><ellipse cx="${cx-17}" cy="${cy}" rx="5.5" ry="4.2" fill="${cheek}" opacity=".38"/><ellipse cx="${cx+17}" cy="${cy}" rx="5.5" ry="4.2" fill="${cheek}" opacity=".38"/><ellipse cx="${cx-11}" cy="${cy-5}" rx="4.2" ry="5.2" fill="${eye}" style="animation:blink 3s ease-in-out infinite"/><ellipse cx="${cx-10}" cy="${cy-7}" rx="1.4" ry="1.4" fill="white"/><ellipse cx="${cx+11}" cy="${cy-5}" rx="4.2" ry="5.2" fill="${eye}" style="animation:blink 3s ease-in-out infinite .15s"/><ellipse cx="${cx+12}" cy="${cy-7}" rx="1.4" ry="1.4" fill="white"/><ellipse cx="${cx}" cy="${cy+3}" rx="3.2" ry="2.3" fill="${cheek}"/><path d="M${cx-6} ${cy+9} Q${cx} ${cy+14} ${cx+6} ${cy+9}" fill="none" stroke="${eye}" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="${cx+29}" cy="${cy+12}" rx="6.5" ry="4.5" fill="${body}" stroke="${ol}" stroke-width="1.3" style="transform-origin:${cx+29}px ${cy+12}px;animation:tailWag .9s ease-in-out infinite"/></svg>`;
}
function renderPets() {
  const row = document.getElementById('pets-row'); row.innerHTML='';
  pets.forEach(pet => {
    const slot=document.createElement('div'); slot.className='pet-slot'; slot.id=`slot-${pet.id}`;
    const fp=Math.max(0,Math.round(pet.food)),wp=Math.max(0,Math.round(pet.water)),hp=Math.max(0,Math.round(pet.happy));
    const isHov=petHovered[pet.id]||false;
    slot.innerHTML=`<div class="pet-label">${pet.name}${pet.alive?(pet.food<25||pet.water<25?' 😟':' ✨'):' 💀'}</div>
      <div class="pet-container" id="petcont-${pet.id}">
        <div class="${pet.alive?'':'pet-dead'}" id="petsvg-${pet.id}" style="width:76px;height:76px">${drawPetSVG(pet,76,isHov)}</div>
        ${pet.id===activePetId?'<div class="active-pet-badge"></div>':''}
      </div>
      <div class="bars">
        <div class="bar-row"><span class="bar-icon">🍎</span><div class="bar-bg"><div class="bar-fill" style="width:${fp}%;background:${fp<25?'#e24b4a':'#e07040'}"></div></div><span style="font-size:9px;color:#633806;font-weight:700;min-width:20px">${fp}%</span></div>
        <div class="bar-row"><span class="bar-icon">💧</span><div class="bar-bg"><div class="bar-fill" style="width:${wp}%;background:${wp<25?'#e24b4a':'#378add'}"></div></div><span style="font-size:9px;color:#0c447c;font-weight:700;min-width:20px">${wp}%</span></div>
        <div class="bar-row"><span class="bar-icon">💗</span><div class="bar-bg"><div class="bar-fill" style="width:${hp}%;background:${hp<25?'#e24b4a':'#d4537e'}"></div></div><span style="font-size:9px;color:#993556;font-weight:700;min-width:20px">${hp}%</span></div>
      </div>
      <div style="font-size:9px;font-weight:700;color:#b07090;margin-top:2px;text-align:center">🔥 ${pet.streak}d streak</div>
      ${pet.alive?`<div class="feed-btns"><button class="feed-btn btn-food" onclick="feedPet(${pet.id},'food',event)">feed</button><button class="feed-btn btn-water" onclick="feedPet(${pet.id},'water',event)">water</button></div>`:`<div style="font-size:10px;color:#a32d2d;font-weight:700;text-align:center;margin-top:3px">passed away</div>`}`;
    const petEl=slot.querySelector(`#petsvg-${pet.id}`);
    petEl.addEventListener('mouseenter',()=>{if(!pet.alive)return;petHovered[pet.id]=true;petEl.innerHTML=drawPetSVG(pet,76,true);});
    petEl.addEventListener('mouseleave',()=>{petHovered[pet.id]=false;petEl.innerHTML=drawPetSVG(pet,76,false);});
    petEl.addEventListener('click',()=>{activePetId=pet.id;renderPets();renderBigPet();});
    row.appendChild(slot);
  });
}
function renderBigPet() {
  const wrap = document.getElementById('big-pet-wrap');
  const pet = pets.find(p => p.id === activePetId) || pets[0];
  if (!pet || !pet.alive) { wrap.innerHTML = ''; return; }
  // If spline-pet.js has loaded its renderer, use it
  if (window._splineRenderPet) {
    window._splineRenderPet(pet, wrap);
  } else {
    wrap.innerHTML = drawBigPetSVG(pet, 106);
  }
}
function feedPet(id,type,e) {
  e.stopPropagation(); const pet=pets.find(p=>p.id===id); if(!pet||!pet.alive) return;
  if(type==='food'){pet.food=Math.min(100,pet.food+25);spawnPetParticle(e,'#e07040');showToast(`${pet.name} nom nom!`);}
  else{pet.water=Math.min(100,pet.water+25);spawnPetParticle(e,'#378add');showToast(`${pet.name} had a drink!`);}
  pet.happy=Math.min(100,(pet.food+pet.water)/2); renderPets(); renderBigPet();
}
function spawnPetParticle(e,color) {
  const scene=document.getElementById('pets-scene'); const sr=scene.getBoundingClientRect(); const x=e.clientX-sr.left,y=e.clientY-sr.top;
  for(let i=0;i<5;i++){const p=document.createElement('div');p.className='food-particle';p.style.cssText=`left:${x+(Math.random()-.5)*22}px;top:${y}px;background:${color};animation-delay:${i*.07}s;position:absolute;width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:20;animation:floatUp .6s ease-out forwards`;scene.appendChild(p);setTimeout(()=>p.remove(),800);}
}
const PET_NAMES=['Petal','Bubbles','Cocoa','Misty','Pinky','Maple','Cloudy','Berry'];
function addPet() { if(pets.length>=5){showToast('Max 5 pets!');return;} const type=PET_TYPES[pets.length%PET_TYPES.length]; const name=PET_NAMES[pets.length%PET_NAMES.length]; pets.push({...type,name,food:80,water:80,happy:80,streak:0,alive:true,id:petNextId++}); showToast(`${name} hatched!`); renderPets(); renderBigPet(); }
setInterval(()=>{ let ch=false; pets.forEach(pet=>{if(!pet.alive)return;pet.food=Math.max(0,pet.food-.7);pet.water=Math.max(0,pet.water-.9);pet.happy=Math.min(100,Math.max(0,(pet.food+pet.water)/2));if(pet.food<=0&&pet.water<=0){pet.alive=false;showToast(`${pet.name} passed away...`);}ch=true;}); if(ch){renderPets();renderBigPet();} },9000);

// ═══ NAVIGATION ══════════════════════════════════════════
const SCREEN_META = {
  home:{title:'Hey crew',sub:'Welcome back, Jordan',action:'<button class="btn btn-pink btn-sm" onclick="openModal(\'modal-create\')">+ New crew</button>'},
  discover:{title:'Discover crews',sub:'Find or start a crew',action:'<button class="btn btn-pink btn-sm" onclick="openModal(\'modal-create\')">+ New crew</button>'},
  crew:{title:'',sub:'',action:''},
  calendar:{title:'Calendar',sub:'Your diary & memories',action:''},
  chat:{title:'Chat canvas',sub:'Style & place text and images freely',action:''},
  pets:{title:'Crew pets',sub:'Keep them fed and happy!',action:'<button class="btn btn-outline btn-sm" onclick="addPet()">+ Hatch pet</button>'},
  inbox:{title:'Leader inbox',sub:'Approve or deny join requests',action:''},
};
function goTo(id, el) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('screen-'+id).classList.add('active');
  if(el) el.classList.add('active');
  const meta = SCREEN_META[id] || {};
  document.getElementById('topbar-title').textContent = meta.title || 'crewhub';
  document.getElementById('topbar-sub').textContent = meta.sub || '';
  document.getElementById('topbar-actions').innerHTML = meta.action || '';
  if(id==='discover') renderDiscover();
  if(id==='home') { document.getElementById('stat-crews').textContent=crews.filter(c=>c.joined||c.leader==='Jordan K.').length; updateInboxBadge(); }
  if(id==='calendar') renderCalendar();
  if(id==='inbox') renderInbox();
  if(id==='pets') { renderPets(); renderBigPet(); }
  if(id==='chat') renderChatColorDots();
}

// ═══ MODALS & UTILS ══════════════════════════════════════
function openModal(id) {
  if(id==='modal-diary'&&selDate){ document.getElementById('diary-date-label').textContent=`${selDate.d} ${MONTHS[selDate.m]} ${selDate.y}`; diaryImgData=null; document.getElementById('diary-img-preview').style.display='none'; }
  document.getElementById(id).classList.add('open');
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if(e.target===o) o.classList.remove('open'); }));
function showToast(msg) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); }
function buildCrewColorPick() { document.getElementById('crew-color-pick').innerHTML=CREW_COLORS.map((c,i)=>`<div class="c-swatch ${i===selCrewColor?'sel':''}" style="background:${c.accent}" onclick="selCrewColor=${i};buildCrewColorPick()"></div>`).join(''); }
buildCrewColorPick();

// ═══ INIT ════════════════════════════════════════════════
renderSidebarCrews();
renderChatColorDots();
seedChat();
renderPets();
renderBigPet();


// Expose to window so spline-pet.js can access
window.pets = pets;
window.activePetId = activePetId;

// Override activePetId setter to keep window in sync
const _origGoTo = goTo;
Object.defineProperty(window, 'activePetId', {
  get() { return activePetId; },
  set(v) { activePetId = v; window.pets = pets; }
});
