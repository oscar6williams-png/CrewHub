// ═══════════════════════════════════════════════════════
// CREWHUB PETS — Full rank system
// Ranks unlock by streak days, pets unlock in order
// ═══════════════════════════════════════════════════════

// ── RANK DEFINITIONS ─────────────────────────────────
const RANKS = [
  {
    id: 'common', name: 'Common', color: '#639922', glow: null,
    streakRequired: 0, tier: 0,
    label: 'Common', labelColor: '#3B6D11', bg: '#EAF3DE',
    effect: null
  },
  {
    id: 'rare', name: 'Rare', color: '#378add', glow: null,
    streakRequired: 3, tier: 1,
    label: 'Rare', labelColor: '#0C447C', bg: '#E6F1FB',
    effect: null
  },
  {
    id: 'platinum', name: 'Platinum', color: '#a0d8ef', glow: 'rgba(160,216,239,0.7)',
    streakRequired: 7, tier: 2,
    label: 'Platinum', labelColor: '#185FA5', bg: '#d4eef8',
    effect: 'shimmer'
  },
  {
    id: 'mythical', name: 'Mythical', color: '#7f77dd', glow: 'rgba(127,119,221,0.6)',
    streakRequired: 14, tier: 3,
    label: 'Mythical', labelColor: '#3C3489', bg: '#EEEDFE',
    effect: 'pulse'
  },
  {
    id: 'legend', name: 'Legend', color: '#EF9F27', glow: 'rgba(239,159,39,0.8)',
    streakRequired: 30, tier: 4,
    label: 'Legend', labelColor: '#633806', bg: '#FAEEDA',
    effect: 'sparkle'
  },
  {
    id: 'godly', name: 'Godly', color: 'rainbow', glow: 'rgba(212,83,126,0.9)',
    streakRequired: 60, tier: 5,
    label: 'Godly', labelColor: '#72243E', bg: 'linear-gradient(135deg,#fbeaf0,#eeedfe,#e6f1fb)',
    effect: 'rainbow'
  }
];

// ── PET DEFINITIONS (3 per rank, 18 total) ────────────
const ALL_PET_TYPES = [
  // ── COMMON (green tones) ──────────────────────────
  { id:'c1', rankId:'common', name:'Clover', type:'bunny',
    bodyColor:'#C0DD97', cheekColor:'#97C459', earColor:'#C0DD97', eyeColor:'#27500A' },
  { id:'c2', rankId:'common', name:'Fern', type:'bear',
    bodyColor:'#9fe1cb', cheekColor:'#5dcaa5', earColor:'#9fe1cb', eyeColor:'#085041' },
  { id:'c3', rankId:'common', name:'Leaf', type:'cat',
    bodyColor:'#97C459', cheekColor:'#639922', earColor:'#C0DD97', eyeColor:'#173404' },

  // ── RARE (blue tones) ─────────────────────────────
  { id:'r1', rankId:'rare', name:'Ripple', type:'bunny',
    bodyColor:'#85B7EB', cheekColor:'#378ADD', earColor:'#B5D4F4', eyeColor:'#042C53' },
  { id:'r2', rankId:'rare', name:'Tide', type:'bear',
    bodyColor:'#378ADD', cheekColor:'#185FA5', earColor:'#85B7EB', eyeColor:'#042C53' },
  { id:'r3', rankId:'rare', name:'Wave', type:'cat',
    bodyColor:'#B5D4F4', cheekColor:'#85B7EB', earColor:'#E6F1FB', eyeColor:'#0C447C' },

  // ── PLATINUM (light blue + shimmer) ──────────────
  { id:'p1', rankId:'platinum', name:'Frost', type:'bunny',
    bodyColor:'#c8eef8', cheekColor:'#a0d8ef', earColor:'#e0f4fd', eyeColor:'#185FA5',
    shimmer: true },
  { id:'p2', rankId:'platinum', name:'Crystal', type:'bear',
    bodyColor:'#a0d8ef', cheekColor:'#78c8e8', earColor:'#c8eef8', eyeColor:'#0C447C',
    shimmer: true },
  { id:'p3', rankId:'platinum', name:'Pearl', type:'cat',
    bodyColor:'#e0f4fd', cheekColor:'#b8e4f4', earColor:'#f0faff', eyeColor:'#185FA5',
    shimmer: true },

  // ── MYTHICAL (purple tones + pulse) ──────────────
  { id:'m1', rankId:'mythical', name:'Mystic', type:'bunny',
    bodyColor:'#AFA9EC', cheekColor:'#7F77DD', earColor:'#CECBF6', eyeColor:'#26215C',
    pulse: true },
  { id:'m2', rankId:'mythical', name:'Shadow', type:'bear',
    bodyColor:'#7F77DD', cheekColor:'#534AB7', earColor:'#AFA9EC', eyeColor:'#26215C',
    pulse: true },
  { id:'m3', rankId:'mythical', name:'Void', type:'cat',
    bodyColor:'#CECBF6', cheekColor:'#AFA9EC', earColor:'#EEEDFE', eyeColor:'#3C3489',
    pulse: true },

  // ── LEGEND (gold + sparkle) ───────────────────────
  { id:'l1', rankId:'legend', name:'Santa', type:'bear',
    bodyColor:'#e05050', cheekColor:'#c03030', earColor:'#fff0f0', eyeColor:'#412402',
    hat: true, sparkle: true },
  { id:'l2', rankId:'legend', name:'Solar', type:'bunny',
    bodyColor:'#EF9F27', cheekColor:'#BA7517', earColor:'#FAC775', eyeColor:'#412402',
    sparkle: true },
  { id:'l3', rankId:'legend', name:'Blaze', type:'cat',
    bodyColor:'#FA8C16', cheekColor:'#EF9F27', earColor:'#FAC775', eyeColor:'#412402',
    sparkle: true },

  // ── GODLY (rainbow/silver) ────────────────────────
  { id:'g1', rankId:'godly', name:'Cosmos', type:'bunny',
    bodyColor:'rainbow', cheekColor:'#f4c0d1', earColor:'rainbow', eyeColor:'#3a2030',
    rainbow: true },
  { id:'g2', rankId:'godly', name:'Aurora', type:'bear',
    bodyColor:'#e8e8f8', cheekColor:'#d0d0e8', earColor:'#f0f0ff', eyeColor:'#3C3489',
    silver: true, rainbow: true },
  { id:'g3', rankId:'godly', name:'Divinity', type:'cat',
    bodyColor:'rainbow', cheekColor:'#fac775', earColor:'rainbow', eyeColor:'#412402',
    rainbow: true },
];

// Which pets unlock at which streak
const UNLOCK_SCHEDULE = [
  { streakDay: 0,  petId: 'c1' },
  { streakDay: 1,  petId: 'c2' },
  { streakDay: 2,  petId: 'c3' },
  { streakDay: 3,  petId: 'r1' },  // rare unlocks at day 3
  { streakDay: 5,  petId: 'r2' },
  { streakDay: 6,  petId: 'r3' },
  { streakDay: 7,  petId: 'p1' },  // platinum at day 7
  { streakDay: 9,  petId: 'p2' },
  { streakDay: 11, petId: 'p3' },
  { streakDay: 14, petId: 'm1' }, // mythical at day 14
  { streakDay: 18, petId: 'm2' },
  { streakDay: 22, petId: 'm3' },
  { streakDay: 30, petId: 'l1' }, // legend at day 30 (santa first!)
  { streakDay: 38, petId: 'l2' },
  { streakDay: 46, petId: 'l3' },
  { streakDay: 60, petId: 'g1' }, // godly at day 60
  { streakDay: 75, petId: 'g2' },
  { streakDay: 90, petId: 'g3' },
];

function getRank(rankId) { return RANKS.find(r => r.id === rankId); }
function getPetDef(petId) { return ALL_PET_TYPES.find(p => p.id === petId); }

// Check which pets should be unlocked for a given streak
function getUnlockedPetIds(streak) {
  return UNLOCK_SCHEDULE.filter(s => streak >= s.streakDay).map(s => s.petId);
}

function getNextUnlock(streak) {
  return UNLOCK_SCHEDULE.find(s => s.streakDay > streak);
}

// ── DRAW PET SVG (enhanced with rank effects) ─────────
function drawRankedPetSVG(petDef, size=76, isHov=false, alive=true, sad=false) {
  const s = size, cx = s/2, cy = s/2 + 4;
  const rank = getRank(petDef.rankId);
  const ol = '#3a2030';

  // Resolve rainbow color
  const isRainbow = petDef.bodyColor === 'rainbow';
  const body = isRainbow ? '#f4c0d1' : petDef.bodyColor;
  const ear = petDef.earColor === 'rainbow' ? '#c8b4f0' : petDef.earColor;
  const cheek = petDef.cheekColor;
  const eye = petDef.eyeColor;

  let ears = '';
  if(petDef.type==='bunny'){
    ears=`<ellipse cx="${cx-11}" cy="${cy-24}" rx="5.5" ry="11" fill="${ear}" stroke="${ol}" stroke-width="1.2"/>
    <ellipse cx="${cx-11}" cy="${cy-24}" rx="3" ry="7" fill="${cheek}" opacity=".5"/>
    <ellipse cx="${cx+11}" cy="${cy-24}" rx="5.5" ry="11" fill="${ear}" stroke="${ol}" stroke-width="1.2"/>
    <ellipse cx="${cx+11}" cy="${cy-24}" rx="3" ry="7" fill="${cheek}" opacity=".5"/>`;
  } else if(petDef.type==='bear'){
    ears=`<circle cx="${cx-15}" cy="${cy-19}" r="7.5" fill="${ear}" stroke="${ol}" stroke-width="1.2"/>
    <circle cx="${cx-15}" cy="${cy-19}" r="4" fill="${cheek}" opacity=".55"/>
    <circle cx="${cx+15}" cy="${cy-19}" r="7.5" fill="${ear}" stroke="${ol}" stroke-width="1.2"/>
    <circle cx="${cx+15}" cy="${cy-19}" r="4" fill="${cheek}" opacity=".55"/>`;
  } else {
    ears=`<polygon points="${cx-17},${cy-21} ${cx-9},${cy-32} ${cx-3},${cy-21}" fill="${ear}" stroke="${ol}" stroke-width="1.2"/>
    <polygon points="${cx+17},${cy-21} ${cx+9},${cy-32} ${cx+3},${cy-21}" fill="${ear}" stroke="${ol}" stroke-width="1.2"/>`;
  }

  let eyeL, eyeR;
  if(!alive){
    eyeL=`<line x1="${cx-10}" y1="${cy-6}" x2="${cx-6}" y2="${cy-2}" stroke="${eye}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="${cx-6}" y1="${cy-6}" x2="${cx-10}" y2="${cy-2}" stroke="${eye}" stroke-width="1.4" stroke-linecap="round"/>`;
    eyeR=`<line x1="${cx+6}" y1="${cy-6}" x2="${cx+10}" y2="${cy-2}" stroke="${eye}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="${cx+10}" y1="${cy-6}" x2="${cx+6}" y2="${cy-2}" stroke="${eye}" stroke-width="1.4" stroke-linecap="round"/>`;
  } else {
    eyeL=`<ellipse cx="${cx-9}" cy="${cy-4}" rx="3.2" ry="3.8" fill="${eye}" style="animation:blink 3s ease-in-out infinite"/>
    <ellipse cx="${cx-8}" cy="${cy-5.5}" rx="1.1" ry="1.1" fill="white"/>`;
    eyeR=`<ellipse cx="${cx+9}" cy="${cy-4}" rx="3.2" ry="3.8" fill="${eye}" style="animation:blink 3s ease-in-out infinite .1s"/>
    <ellipse cx="${cx+10}" cy="${cy-5.5}" rx="1.1" ry="1.1" fill="white"/>`;
  }

  let mouth;
  if(!alive) mouth=`<path d="M${cx-5} ${cy+6} Q${cx} ${cy+3} ${cx+5} ${cy+6}" fill="none" stroke="${eye}" stroke-width="1.2" stroke-linecap="round"/>`;
  else if(isHov) mouth=`<ellipse cx="${cx}" cy="${cy+7}" rx="5.5" ry="3.8" fill="#3a2030"/><ellipse cx="${cx}" cy="${cy+8}" rx="3.5" ry="2.2" fill="#e88fab"/>`;
  else if(sad) mouth=`<path d="M${cx-5} ${cy+8} Q${cx} ${cy+5} ${cx+5} ${cy+8}" fill="none" stroke="${eye}" stroke-width="1.2" stroke-linecap="round"/>`;
  else mouth=`<path d="M${cx-5} ${cy+6} Q${cx} ${cy+10} ${cx+5} ${cy+6}" fill="none" stroke="${eye}" stroke-width="1.2" stroke-linecap="round"/>`;

  const bounceStyle = alive && !sad ? `style="animation:bounce 1.2s ease-in-out infinite"` : '';
  const tailStyle = `style="transform-origin:${cx+21}px ${cy+10}px;animation:tailWag 0.8s ease-in-out infinite"`;

  // Rank glow ring
  let glowRing = '';
  if(rank.glow && alive) {
    glowRing = `<ellipse cx="${cx}" cy="${cy}" rx="24" ry="22" fill="none" stroke="${rank.color === 'rainbow' ? '#d4537e' : rank.color}" stroke-width="1.5" opacity="0.5" style="animation:rankPulse 2s ease-in-out infinite"/>`;
  }

  // Santa hat for l1
  let hat = '';
  if(petDef.hat && petDef.type==='bear') {
    hat = `<polygon points="${cx-12},${cy-24} ${cx+12},${cy-24} ${cx+4},${cy-42} ${cx-4},${cy-42}" fill="#e05050" stroke="${ol}" stroke-width="1"/>
    <rect x="${cx-13}" y="${cy-26}" width="26" height="5" rx="2.5" fill="#fff" stroke="${ol}" stroke-width="0.8"/>
    <circle cx="${cx+4}" cy="${cy-42}" r="4" fill="#fff"/>`;
  }

  // Sparkle particles
  let sparkles = '';
  if(petDef.sparkle && alive) {
    const sp = [[cx-18,cy-28],[cx+20,cy-20],[cx-20,cy+5],[cx+22,cy+8],[cx,cy-35]];
    sparkles = sp.map(([sx,sy],i) =>
      `<polygon points="${sx},${sy-4} ${sx+1.5},${sy-1.5} ${sx+4},${sy} ${sx+1.5},${sy+1.5} ${sx},${sy+4} ${sx-1.5},${sy+1.5} ${sx-4},${sy} ${sx-1.5},${sy-1.5}"
      fill="${rank.color}" opacity="0.9"
      style="animation:sparkleAnim ${1.5+i*0.3}s ease-in-out infinite;animation-delay:${i*0.2}s"/>`
    ).join('');
  }

  // Shimmer overlay
  let shimmer = '';
  if(petDef.shimmer && alive) {
    shimmer = `<ellipse cx="${cx-6}" cy="${cy-8}" rx="8" ry="6" fill="white" opacity="0.25" style="animation:shimmerAnim 2s ease-in-out infinite"/>`;
  }

  // Rainbow body override (CSS animation)
  let defs = '';
  if(isRainbow && alive) {
    defs = `<defs><linearGradient id="rbGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4c0d1"><animate attributeName="stop-color" values="#f4c0d1;#cecbf6;#b5d4f4;#9fe1cb;#fac775;#f4c0d1" dur="3s" repeatCount="indefinite"/></stop>
      <stop offset="100%" stop-color="#cecbf6"><animate attributeName="stop-color" values="#cecbf6;#b5d4f4;#9fe1cb;#fac775;#f4c0d1;#cecbf6" dur="3s" repeatCount="indefinite"/></stop>
    </linearGradient></defs>`;
  }
  const bodyFill = isRainbow && alive ? `url(#rbGrad${size})` : body;

  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    ${defs}
    ${glowRing}
    <g ${bounceStyle}>
      ${hat}
      ${ears}
      <ellipse cx="${cx}" cy="${cy}" rx="21" ry="19" fill="${bodyFill}" stroke="${ol}" stroke-width="1.3"/>
      ${shimmer}
      <ellipse cx="${cx-7}" cy="${cy+4}" rx="6.5" ry="8.5" fill="${bodyFill}" stroke="${ol}" stroke-width="1.1"/>
      <ellipse cx="${cx+7}" cy="${cy+4}" rx="6.5" ry="8.5" fill="${bodyFill}" stroke="${ol}" stroke-width="1.1"/>
      <ellipse cx="${cx}" cy="${cy+15}" rx="8.5" ry="5.5" fill="${bodyFill}" stroke="${ol}" stroke-width="1.1"/>
      <ellipse cx="${cx-12}" cy="${cy}" rx="3.8" ry="2.8" fill="${cheek}" opacity=".38"/>
      <ellipse cx="${cx+12}" cy="${cy}" rx="3.8" ry="2.8" fill="${cheek}" opacity=".38"/>
      ${eyeL}${eyeR}
      <ellipse cx="${cx}" cy="${cy+2}" rx="2.2" ry="1.6" fill="${cheek}"/>
      ${mouth}
      ${sparkles}
    </g>
    <ellipse cx="${cx+21}" cy="${cy+10}" rx="4.5" ry="3.2" fill="${bodyFill}" stroke="${ol}" stroke-width="1.1" ${tailStyle}/>
  </svg>`;
}

// Big version for bottom-right corner
function drawBigRankedPetSVG(petDef, size=110) {
  const s=size, cx=s/2, cy=s/2+6;
  const rank = getRank(petDef.rankId);
  const ol='#3a2030';
  const isRainbow = petDef.bodyColor==='rainbow';
  const body = isRainbow ? '#f4c0d1' : petDef.bodyColor;
  const ear = petDef.earColor==='rainbow' ? '#c8b4f0' : petDef.earColor;
  const cheek=petDef.cheekColor, eye=petDef.eyeColor;

  let ears='';
  if(petDef.type==='bunny'){ears=`<ellipse cx="${cx-17}" cy="${cy-32}" rx="7.5" ry="15" fill="${ear}" stroke="${ol}" stroke-width="1.4"/><ellipse cx="${cx-17}" cy="${cy-32}" rx="4.5" ry="10" fill="${cheek}" opacity=".42"/><ellipse cx="${cx+17}" cy="${cy-32}" rx="7.5" ry="15" fill="${ear}" stroke="${ol}" stroke-width="1.4"/><ellipse cx="${cx+17}" cy="${cy-32}" rx="4.5" ry="10" fill="${cheek}" opacity=".42"/>`;}
  else if(petDef.type==='bear'){ears=`<circle cx="${cx-21}" cy="${cy-26}" r="10.5" fill="${ear}" stroke="${ol}" stroke-width="1.4"/><circle cx="${cx-21}" cy="${cy-26}" r="6" fill="${cheek}" opacity=".52"/><circle cx="${cx+21}" cy="${cy-26}" r="10.5" fill="${ear}" stroke="${ol}" stroke-width="1.4"/><circle cx="${cx+21}" cy="${cy-26}" r="6" fill="${cheek}" opacity=".52"/>`;}
  else{ears=`<polygon points="${cx-23},${cy-27} ${cx-12},${cy-44} ${cx-4},${cy-27}" fill="${ear}" stroke="${ol}" stroke-width="1.4"/><polygon points="${cx+23},${cy-27} ${cx+12},${cy-44} ${cx+4},${cy-27}" fill="${ear}" stroke="${ol}" stroke-width="1.4"/>`;}

  let hat='';
  if(petDef.hat && petDef.type==='bear'){
    hat=`<polygon points="${cx-16},${cy-32} ${cx+16},${cy-32} ${cx+5},${cy-56} ${cx-5},${cy-56}" fill="#e05050" stroke="${ol}" stroke-width="1.2"/>
    <rect x="${cx-17}" y="${cy-35}" width="34" height="7" rx="3.5" fill="#fff" stroke="${ol}" stroke-width="1"/>
    <circle cx="${cx+5}" cy="${cy-56}" r="5.5" fill="#fff"/>`;
  }

  let defs='';
  if(isRainbow){
    defs=`<defs><linearGradient id="rbGradBig" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4c0d1"><animate attributeName="stop-color" values="#f4c0d1;#cecbf6;#b5d4f4;#9fe1cb;#fac775;#f4c0d1" dur="3s" repeatCount="indefinite"/></stop>
      <stop offset="100%" stop-color="#cecbf6"><animate attributeName="stop-color" values="#cecbf6;#b5d4f4;#9fe1cb;#fac775;#f4c0d1;#cecbf6" dur="3s" repeatCount="indefinite"/></stop>
    </linearGradient></defs>`;
  }
  const bf = isRainbow ? 'url(#rbGradBig)' : body;

  let glowRing='';
  if(rank.glow){glowRing=`<ellipse cx="${cx}" cy="${cy}" rx="33" ry="30" fill="none" stroke="${rank.color==='rainbow'?'#d4537e':rank.color}" stroke-width="2" opacity="0.5" style="animation:rankPulse 2s ease-in-out infinite"/>`;}

  let sparkles='';
  if(petDef.sparkle){
    const sp=[[cx-26,cy-38],[cx+28,cy-28],[cx-28,cy+6],[cx+30,cy+10],[cx,cy-48]];
    sparkles=sp.map(([sx,sy],i)=>`<polygon points="${sx},${sy-5} ${sx+2},${sy-2} ${sx+5},${sy} ${sx+2},${sy+2} ${sx},${sy+5} ${sx-2},${sy+2} ${sx-5},${sy} ${sx-2},${sy-2}" fill="${rank.color}" opacity="0.9" style="animation:sparkleAnim ${1.5+i*0.3}s ease-in-out infinite;animation-delay:${i*0.2}s"/>`).join('');
  }

  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" style="animation:bigBounce 2s ease-in-out infinite">
    ${defs}${glowRing}${hat}${ears}
    <ellipse cx="${cx}" cy="${cy}" rx="28" ry="26" fill="${bf}" stroke="${ol}" stroke-width="1.5"/>
    <ellipse cx="${cx-10}" cy="${cy+5}" rx="9.5" ry="12.5" fill="${bf}" stroke="${ol}" stroke-width="1.3"/>
    <ellipse cx="${cx+10}" cy="${cy+5}" rx="9.5" ry="12.5" fill="${bf}" stroke="${ol}" stroke-width="1.3"/>
    <ellipse cx="${cx}" cy="${cy+21}" rx="11.5" ry="7.5" fill="${bf}" stroke="${ol}" stroke-width="1.3"/>
    <ellipse cx="${cx-17}" cy="${cy}" rx="5.5" ry="4.2" fill="${cheek}" opacity=".38"/>
    <ellipse cx="${cx+17}" cy="${cy}" rx="5.5" ry="4.2" fill="${cheek}" opacity=".38"/>
    <ellipse cx="${cx-11}" cy="${cy-5}" rx="4.2" ry="5.2" fill="${eye}" style="animation:blink 3s ease-in-out infinite"/>
    <ellipse cx="${cx-10}" cy="${cy-7}" rx="1.4" ry="1.4" fill="white"/>
    <ellipse cx="${cx+11}" cy="${cy-5}" rx="4.2" ry="5.2" fill="${eye}" style="animation:blink 3s ease-in-out infinite .15s"/>
    <ellipse cx="${cx+12}" cy="${cy-7}" rx="1.4" ry="1.4" fill="white"/>
    <ellipse cx="${cx}" cy="${cy+3}" rx="3.2" ry="2.3" fill="${cheek}"/>
    <path d="M${cx-6} ${cy+9} Q${cx} ${cy+14} ${cx+6} ${cy+9}" fill="none" stroke="${eye}" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="${cx+29}" cy="${cy+12}" rx="6.5" ry="4.5" fill="${bf}" stroke="${ol}" stroke-width="1.3" style="transform-origin:${cx+29}px ${cy+12}px;animation:tailWag .9s ease-in-out infinite"/>
    ${sparkles}
  </svg>`;
}

// ── RANK BADGE HTML ────────────────────────────────────
function rankBadge(rankId) {
  const rank = getRank(rankId);
  const colors = {
    common:   { bg:'#EAF3DE', color:'#3B6D11' },
    rare:     { bg:'#E6F1FB', color:'#0C447C' },
    platinum: { bg:'#d4eef8', color:'#185FA5' },
    mythical: { bg:'#EEEDFE', color:'#3C3489' },
    legend:   { bg:'#FAEEDA', color:'#633806' },
    godly:    { bg:'linear-gradient(135deg,#fbeaf0,#eeedfe)', color:'#993556' },
  };
  const c = colors[rankId] || colors.common;
  return `<span style="display:inline-flex;align-items:center;font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px;background:${c.bg};color:${c.color};letter-spacing:.04em">${rank.name.toUpperCase()}</span>`;
}

// ── UNLOCK NOTIFICATION ────────────────────────────────
function checkNewUnlocks(oldStreak, newStreak) {
  const newly = UNLOCK_SCHEDULE.filter(s => s.streakDay > oldStreak && s.streakDay <= newStreak);
  newly.forEach(s => {
    const petDef = getPetDef(s.petId);
    const rank = getRank(petDef.rankId);
    showPetUnlockToast(petDef, rank);
  });
}

function showPetUnlockToast(petDef, rank) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = `🎉 New ${rank.name} pet unlocked: <b>${petDef.name}</b>!`;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); toast.innerHTML=''; }, 4000);
}

// ── PETS SCREEN RENDERER (replaces old renderPets) ────
function renderPetsEnhanced() {
  const pets = getPets();
  const streak = getPetStreak();
  const unlockedIds = getUnlockedPetIds(streak);
  const nextUnlock = getNextUnlock(streak);

  const streakEl = document.getElementById('streak-big');
  if (streakEl) streakEl.textContent = streak;

  const row = document.getElementById('pets-row');
  row.innerHTML = '';

  // Active owned pets
  const ownedPets = pets.filter(p => p.alive || !p.alive);
  if (!ownedPets.length) {
    row.innerHTML = `<div style="text-align:center;color:rgba(58,32,48,0.6);font-size:13px;font-weight:700;position:relative;z-index:5;padding:20px">Hatch your first pet above! 🥚<br/><span style="font-size:11px;font-weight:400">Build your streak to unlock more</span></div>`;
  } else {
    ownedPets.forEach(pet => {
      const petDef = getPetDef(pet.defId) || ALL_PET_TYPES[0];
      const rank = getRank(petDef.rankId);
      const slot = document.createElement('div');
      slot.className = 'pet-slot';
      const fp=Math.max(0,Math.round(pet.food)), wp=Math.max(0,Math.round(pet.water)), hp=Math.max(0,Math.round(pet.happy));
      const isHov = petHovered[pet.id]||false;
      const isActive = pet.id === activePetId;
      slot.innerHTML = `
        <div class="pet-label" style="background:${rank.id==='godly'?'linear-gradient(135deg,#fbeaf0,#eeedfe)':'rgba(255,255,255,0.85)'}">${petDef.name} ${rankBadge(petDef.rankId)}</div>
        <div class="pet-container" id="petcont-${pet.id}">
          <div class="${pet.alive?'':'pet-dead'}" id="petsvg-${pet.id}" style="width:76px;height:76px">${drawRankedPetSVG(petDef,76,isHov,pet.alive,pet.food<25||pet.water<25)}</div>
          ${isActive?'<div class="active-pet-badge"></div>':''}
        </div>
        <div class="bars">
          <div class="bar-row"><span class="bar-icon">🍎</span><div class="bar-bg"><div class="bar-fill" style="width:${fp}%;background:${fp<25?'#e24b4a':'#e07040'}"></div></div><span style="font-size:9px;color:#633806;font-weight:700;min-width:20px">${fp}%</span></div>
          <div class="bar-row"><span class="bar-icon">💧</span><div class="bar-bg"><div class="bar-fill" style="width:${wp}%;background:${wp<25?'#e24b4a':'#378add'}"></div></div><span style="font-size:9px;color:#0c447c;font-weight:700;min-width:20px">${wp}%</span></div>
          <div class="bar-row"><span class="bar-icon">💗</span><div class="bar-bg"><div class="bar-fill" style="width:${hp}%;background:${hp<25?'#e24b4a':'#d4537e'}"></div></div><span style="font-size:9px;color:#993556;font-weight:700;min-width:20px">${hp}%</span></div>
        </div>
        <div style="font-size:9px;font-weight:700;color:#b07090;margin-top:2px;text-align:center">🔥 ${streak}d streak</div>
        ${pet.alive
          ? `<div class="feed-btns"><button class="feed-btn btn-food" onclick="feedRankedPet(${pet.id},'food',event)">feed</button><button class="feed-btn btn-water" onclick="feedRankedPet(${pet.id},'water',event)">water</button></div>`
          : `<div style="font-size:10px;color:#a32d2d;font-weight:700;text-align:center;margin-top:3px">passed away</div>`}`;
      const petEl = slot.querySelector(`#petsvg-${pet.id}`);
      petEl.addEventListener('mouseenter', () => { if(!pet.alive)return; petHovered[pet.id]=true; petEl.innerHTML=drawRankedPetSVG(petDef,76,true,pet.alive,false); });
      petEl.addEventListener('mouseleave', () => { petHovered[pet.id]=false; petEl.innerHTML=drawRankedPetSVG(petDef,76,false,pet.alive,pet.food<25||pet.water<25); });
      petEl.addEventListener('click', () => { activePetId=pet.id; saveActivePetId(activePetId); renderPetsEnhanced(); renderBigPetEnhanced(); });
      row.appendChild(slot);
    });
  }

  // Unlock progress panel
  renderUnlockProgress(streak, unlockedIds, nextUnlock);
}

function renderUnlockProgress(streak, unlockedIds, nextUnlock) {
  let panel = document.getElementById('unlock-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'unlock-panel';
    panel.style.cssText = 'position:relative;z-index:5;width:100%;margin-top:8px;';
    document.getElementById('pets-scene').appendChild(panel);
  }

  const nextPetDef = nextUnlock ? getPetDef(nextUnlock.petId) : null;
  const nextRank = nextPetDef ? getRank(nextPetDef.rankId) : null;
  const daysLeft = nextUnlock ? nextUnlock.streakDay - streak : 0;

  panel.innerHTML = `
    <div style="background:rgba(255,255,255,0.82);border-radius:13px;padding:10px 14px;margin:0 8px;">
      <div style="font-size:10px;font-weight:800;color:#b07090;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Unlock progress</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        ${RANKS.map(r => {
          const unlocked = streak >= r.streakRequired;
          return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;opacity:${unlocked?1:0.4}">
            <div style="width:10px;height:10px;border-radius:50%;background:${r.color==='rainbow'?'#d4537e':r.color};${unlocked?'':'filter:grayscale(1)'}"></div>
            <div style="font-size:8px;font-weight:700;color:#b07090">${r.name}</div>
            <div style="font-size:7px;color:#c0a0b0">day ${r.streakRequired}</div>
          </div>`;
        }).join('')}
      </div>
      ${nextPetDef ? `
        <div style="font-size:11px;color:#3a2030;font-weight:700">
          Next unlock: <b>${nextPetDef.name}</b> ${rankBadge(nextPetDef.rankId)} in <b>${daysLeft}</b> day${daysLeft!==1?'s':''}
        </div>
        <div style="height:5px;background:rgba(212,83,126,0.15);border-radius:3px;margin-top:6px;overflow:hidden">
          <div style="height:5px;background:${nextRank.color==='rainbow'?'#d4537e':nextRank.color};border-radius:3px;width:${Math.min(100,Math.round((streak/nextUnlock.streakDay)*100))}%;transition:width .5s"></div>
        </div>
      ` : `<div style="font-size:12px;color:#d4537e;font-weight:800">🏆 All pets unlocked! You're Godly!</div>`}
      <div style="font-size:10px;color:#c0a0b0;margin-top:6px">🔥 ${streak} day streak · ${unlockedIds.length}/${ALL_PET_TYPES.length} pets unlocked</div>
    </div>
  `;
}

function renderBigPetEnhanced() {
  const wrap = document.getElementById('big-pet-wrap');
  const pets = getPets();
  const pet = pets.find(p => p.id === activePetId) || pets[0];
  if (!pet || !pet.alive) { wrap.innerHTML=''; return; }
  const petDef = getPetDef(pet.defId) || ALL_PET_TYPES[0];
  if (window._splineRenderPetDef) {
    window._splineRenderPetDef(petDef, wrap);
  } else {
    wrap.innerHTML = drawBigRankedPetSVG(petDef, 110);
  }
}

function feedRankedPet(id, type, e) {
  e.stopPropagation();
  const pets = getPets();
  const pet = pets.find(p => p.id === id);
  if (!pet || !pet.alive) return;
  if(type==='food'){pet.food=Math.min(100,pet.food+25);spawnPetParticle(e,'#e07040');showToast(`${getPetDef(pet.defId)?.name||'Pet'} nom nom!`);}
  else{pet.water=Math.min(100,pet.water+25);spawnPetParticle(e,'#378add');showToast(`${getPetDef(pet.defId)?.name||'Pet'} had a drink!`);}
  pet.happy=Math.min(100,(pet.food+pet.water)/2);
  savePets(pets); renderPetsEnhanced(); renderBigPetEnhanced();
}

// Override addPet to use ranked system
function addRankedPet() {
  const pets = getPets();
  const streak = getPetStreak();
  const unlockedIds = getUnlockedPetIds(streak);
  const ownedDefIds = pets.map(p => p.defId);
  const available = unlockedIds.filter(id => !ownedDefIds.includes(id));

  if (!available.length) {
    if (unlockedIds.length >= ALL_PET_TYPES.length) {
      showToast('You have all pets unlocked! 🏆');
    } else {
      showToast(`Keep your streak going to unlock more pets! 🔥`);
    }
    return;
  }
  if (pets.filter(p=>p.alive).length >= 5) {
    showToast('Max 5 active pets!'); return;
  }

  const nextId = available[0];
  const petDef = getPetDef(nextId);
  const rank = getRank(petDef.rankId);
  const newPet = {
    id: Date.now(),
    defId: nextId,
    food: 80, water: 80, happy: 80,
    alive: true,
    hatchedAt: new Date().toISOString()
  };
  pets.push(newPet);
  savePets(pets);
  if (!activePetId) { activePetId = newPet.id; saveActivePetId(activePetId); }
  showToast(`🥚 ${petDef.name} (${rank.name}) hatched!`);
  renderPetsEnhanced(); renderBigPetEnhanced();
}

// ── INJECT STYLES ─────────────────────────────────────
const petStyles = document.createElement('style');
petStyles.textContent = `
@keyframes rankPulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.04)} }
@keyframes sparkleAnim { 0%,100%{opacity:0;transform:scale(0.5) rotate(0deg)} 50%{opacity:1;transform:scale(1.2) rotate(45deg)} }
@keyframes shimmerAnim { 0%,100%{opacity:0.1;transform:translate(-4px,-4px)} 50%{opacity:0.35;transform:translate(4px,4px)} }
@keyframes bigBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
@keyframes tailWag { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} }
@keyframes blink { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(.1)} }
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
`;
document.head.appendChild(petStyles);

// Override renderPets and renderBigPet globally
window.renderPets = renderPetsEnhanced;
window.renderBigPet = renderBigPetEnhanced;
window.addPet = addRankedPet;

// Drain pets periodically
setInterval(() => {
  const pets = getPets();
  let changed = false;
  pets.forEach(pet => {
    if(!pet.alive) return;
    pet.food = Math.max(0, pet.food - 0.7);
    pet.water = Math.max(0, pet.water - 0.9);
    pet.happy = Math.min(100, Math.max(0, (pet.food+pet.water)/2));
    if(pet.food<=0&&pet.water<=0){pet.alive=false;const def=getPetDef(pet.defId);showToast(`${def?.name||'Pet'} passed away...`);}
    changed=true;
  });
  if(changed){savePets(pets);renderPetsEnhanced();renderBigPetEnhanced();}
}, 9000);

// Spline-style big pet override
window._splineRenderPetDef = function(petDef, wrap) {
  if(wrap._cleanup) wrap._cleanup();
  renderSplinePetDef(petDef, wrap);
};

function renderSplinePetDef(petDef, wrap) {
  wrap.innerHTML = '';
  const size = 130;
  const container = document.createElement('div');
  container.style.cssText = `width:${size}px;height:${size}px;perspective:400px;cursor:pointer;position:relative;`;

  const rank = getRank(petDef.rankId);
  const glowColor = rank.glow || 'rgba(212,83,126,0.35)';

  const spotlight = document.createElement('div');
  spotlight.style.cssText = `position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle at center,${glowColor} 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:0;opacity:0;transition:opacity .3s;`;

  const body = document.createElement('div');
  body.style.cssText = `width:${size}px;height:${size}px;transition:transform .1s ease-out;transform-style:preserve-3d;position:relative;z-index:1;`;

  const svgWrap = document.createElement('div');
  svgWrap.style.cssText = 'width:100%;height:100%;';
  svgWrap.innerHTML = drawBigRankedPetSVG(petDef, size);
  body.appendChild(svgWrap);

  const nameTag = document.createElement('div');
  nameTag.style.cssText = `position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.9);color:${rank.color==='rainbow'?'#993556':rank.color};font-size:10px;font-weight:800;padding:2px 10px;border-radius:20px;white-space:nowrap;font-family:var(--font);`;
  nameTag.innerHTML = `${petDef.name} ${rankBadge(petDef.rankId)}`;

  container.appendChild(spotlight);
  container.appendChild(body);
  container.appendChild(nameTag);
  wrap.appendChild(container);

  let isHov=false, currentRX=0, currentRY=0, targetRX=0, targetRY=0;
  let animFrame = null;
  const animate = () => {
    currentRX += (targetRX-currentRX)*0.12;
    currentRY += (targetRY-currentRY)*0.12;
    body.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg) scale(${isHov?1.08:1})`;
    animFrame = requestAnimationFrame(animate);
  };
  animate();

  document.addEventListener('mousemove', e => {
    const rect = container.getBoundingClientRect();
    const dx=e.clientX-(rect.left+rect.width/2), dy=e.clientY-(rect.top+rect.height/2);
    const dist=Math.sqrt(dx*dx+dy*dy), max=300;
    if(dist<max){const f=1-dist/max;targetRY=(dx/max)*25*f;targetRX=-(dy/max)*20*f;spotlight.style.opacity=String(f*0.8);}
    else{targetRX=0;targetRY=0;spotlight.style.opacity='0';}
  });
  container.addEventListener('mouseenter',()=>{isHov=true;});
  container.addEventListener('mouseleave',()=>{isHov=false;targetRX=0;targetRY=0;spotlight.style.opacity='0';});
  container.addEventListener('click',()=>{
    body.style.transform='scale(1.2) rotateX(5deg)';
    setTimeout(()=>body.style.transform='scale(0.9)',100);
    setTimeout(()=>body.style.transform='scale(1)',200);
  });
  wrap._cleanup = () => cancelAnimationFrame(animFrame);
}

// Init
setTimeout(() => { renderPetsEnhanced(); renderBigPetEnhanced(); }, 200);
