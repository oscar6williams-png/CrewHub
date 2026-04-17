// ═══════════════════════════════════════════════════════
// SPLINE-STYLE INTERACTIVE 3D PET — bottom right corner
// Uses CSS 3D transforms + mouse tracking for depth effect
// ═══════════════════════════════════════════════════════

(function() {
  function initSplinePet() {
    // Register the renderer on window so app.js renderBigPet can call it
    window._splineRenderPet = function(pet, wrap) {
      // Clean up previous animation if any
      if (wrap._cleanup) wrap._cleanup();
      renderSplinePet(pet, wrap);
    };

    // Trigger initial render if pets already loaded
    if (typeof renderBigPet === 'function') {
      setTimeout(renderBigPet, 50);
    }
  }

  function renderSplinePet(pet, wrap) {
    const size = 130;
    wrap.innerHTML = '';

    // Outer container with perspective for 3D effect
    const container = document.createElement('div');
    container.id = 'spline-pet-container';
    container.style.cssText = `
      width:${size}px;height:${size}px;
      perspective:400px;
      cursor:pointer;
      position:relative;
    `;

    // Spotlight glow (Spline-style)
    const spotlight = document.createElement('div');
    spotlight.id = 'pet-spotlight';
    spotlight.style.cssText = `
      position:absolute;
      width:180px;height:180px;
      border-radius:50%;
      background:radial-gradient(circle at center, rgba(212,83,126,0.35) 0%, rgba(212,83,126,0.1) 40%, transparent 70%);
      top:50%;left:50%;
      transform:translate(-50%,-50%);
      pointer-events:none;
      z-index:0;
      opacity:0;
      transition:opacity 0.3s;
    `;

    // 3D rotating pet body
    const body = document.createElement('div');
    body.id = 'spline-pet-body';
    body.style.cssText = `
      width:${size}px;height:${size}px;
      transition:transform 0.1s ease-out;
      transform-style:preserve-3d;
      position:relative;
      z-index:1;
    `;

    // Shadow under pet
    const shadow = document.createElement('div');
    shadow.style.cssText = `
      position:absolute;
      bottom:-8px;left:50%;
      transform:translateX(-50%);
      width:70px;height:12px;
      background:rgba(58,32,48,0.18);
      border-radius:50%;
      transition:all 0.15s;
      z-index:-1;
    `;
    body.appendChild(shadow);

    // The actual SVG pet
    const svgWrap = document.createElement('div');
    svgWrap.id = 'spline-pet-svg';
    svgWrap.style.cssText = `width:100%;height:100%;`;
    svgWrap.innerHTML = drawSplinePetSVG(pet, size);
    body.appendChild(svgWrap);

    // Floating particles around the pet
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      const angle = (i / 6) * 360;
      const radius = 55 + Math.random() * 10;
      const pSize = 5 + Math.random() * 5;
      particle.style.cssText = `
        position:absolute;
        width:${pSize}px;height:${pSize}px;
        border-radius:50%;
        background:${['#f4c0d1','#d4537e','#faeeda','#e1f5ee','#eeedfe','#fac775'][i]};
        top:50%;left:50%;
        transform:translate(-50%,-50%) rotate(${angle}deg) translateX(${radius}px);
        animation:orbitFloat ${3 + i * 0.5}s ease-in-out infinite;
        animation-delay:${i * 0.4}s;
        opacity:0.7;
        pointer-events:none;
      `;
      body.appendChild(particle);
    }

    // Name tag
    const nameTag = document.createElement('div');
    nameTag.style.cssText = `
      position:absolute;
      bottom:-22px;left:50%;
      transform:translateX(-50%);
      background:rgba(255,255,255,0.9);
      color:#993556;
      font-size:10px;font-weight:800;
      padding:2px 10px;border-radius:20px;
      border:0.5px solid rgba(212,83,126,0.2);
      white-space:nowrap;
      font-family:var(--font);
    `;
    nameTag.textContent = pet.name + ' ✨';

    container.appendChild(spotlight);
    container.appendChild(body);
    container.appendChild(nameTag);
    wrap.appendChild(container);

    // Mouse tracking for 3D tilt (Spline-style)
    let isHovered = false;
    let animFrame = null;
    let currentRX = 0, currentRY = 0;
    let targetRX = 0, targetRY = 0;

    const animate = () => {
      // Smooth lerp towards target rotation
      currentRX += (targetRX - currentRX) * 0.12;
      currentRY += (targetRY - currentRY) * 0.12;

      body.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg) scale(${isHovered ? 1.08 : 1})`;
      shadow.style.transform = `translateX(-50%) scaleX(${1 + Math.abs(currentRY) * 0.02})`;
      shadow.style.opacity = 0.6 - Math.abs(currentRX) * 0.01;

      animFrame = requestAnimationFrame(animate);
    };
    animate();

    document.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.sqrt(distX*distX + distY*distY);
      const maxDist = 300;

      if (dist < maxDist) {
        const factor = 1 - dist / maxDist;
        targetRY = (distX / maxDist) * 25 * factor;
        targetRX = -(distY / maxDist) * 20 * factor;

        // Move spotlight
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        spotlight.style.background = `radial-gradient(circle at ${localX}px ${localY}px, rgba(212,83,126,0.5) 0%, rgba(212,83,126,0.1) 50%, transparent 70%)`;
        spotlight.style.opacity = String(factor * 0.8);
      } else {
        targetRX = 0; targetRY = 0;
        spotlight.style.opacity = '0';
      }
    });

    container.addEventListener('mouseenter', () => {
      isHovered = true;
      spotlight.style.opacity = '1';
      // Open mouth on hover
      const mouthEl = svgWrap.querySelector('.pet-mouth');
      if (mouthEl) {
        mouthEl.setAttribute('d', '');
        svgWrap.innerHTML = drawSplinePetSVG(pet, size, true);
      }
    });

    container.addEventListener('mouseleave', () => {
      isHovered = false;
      spotlight.style.opacity = '0';
      targetRX = 0; targetRY = 0;
      svgWrap.innerHTML = drawSplinePetSVG(pet, size, false);
    });

    container.addEventListener('click', () => {
      // Bounce animation on click
      body.style.transition = 'transform 0.1s';
      body.style.transform = 'scale(1.2) rotateX(5deg)';
      setTimeout(() => { body.style.transform = 'scale(0.9)'; }, 100);
      setTimeout(() => { body.style.transform = 'scale(1)'; }, 200);

      // Burst particles
      burstParticles(container, pet);
    });

    // Store cleanup
    wrap._cleanup = () => { cancelAnimationFrame(animFrame); };
  }

  function drawSplinePetSVG(pet, size, mouthOpen=false) {
    const s = size, cx = s/2, cy = s/2 + 4;
    const body = pet.bodyColor, cheek = pet.cheekColor, ear = pet.earColor, eye = pet.eyeColor;
    const ol = '#3a2030';

    let ears = '';
    if (pet.type==='bunny') {
      ears = `
        <ellipse cx="${cx-16}" cy="${cy-34}" rx="8" ry="17" fill="${ear}" stroke="${ol}" stroke-width="1.5"/>
        <ellipse cx="${cx-16}" cy="${cy-34}" rx="5" ry="11" fill="${cheek}" opacity=".45"/>
        <ellipse cx="${cx+16}" cy="${cy-34}" rx="8" ry="17" fill="${ear}" stroke="${ol}" stroke-width="1.5"/>
        <ellipse cx="${cx+16}" cy="${cy-34}" rx="5" ry="11" fill="${cheek}" opacity=".45"/>
      `;
    } else if (pet.type==='bear') {
      ears = `
        <circle cx="${cx-22}" cy="${cy-28}" r="13" fill="${ear}" stroke="${ol}" stroke-width="1.5"/>
        <circle cx="${cx-22}" cy="${cy-28}" r="8" fill="${cheek}" opacity=".5"/>
        <circle cx="${cx+22}" cy="${cy-28}" r="13" fill="${ear}" stroke="${ol}" stroke-width="1.5"/>
        <circle cx="${cx+22}" cy="${cy-28}" r="8" fill="${cheek}" opacity=".5"/>
      `;
    } else {
      ears = `
        <polygon points="${cx-24},${cy-26} ${cx-13},${cy-46} ${cx-3},${cy-26}" fill="${ear}" stroke="${ol}" stroke-width="1.5"/>
        <polygon points="${cx+24},${cy-26} ${cx+13},${cy-46} ${cx+3},${cy-26}" fill="${ear}" stroke="${ol}" stroke-width="1.5"/>
      `;
    }

    const mouth = mouthOpen
      ? `<ellipse cx="${cx}" cy="${cy+9}" rx="8" ry="6" fill="#3a2030"/><ellipse cx="${cx}" cy="${cy+10}" rx="5.5" ry="3.5" fill="#e88fab"/><ellipse cx="${cx-3}" cy="${cy+8}" rx="1.5" ry="1" fill="white" opacity=".6"/>`
      : `<path class="pet-mouth" d="M${cx-7} ${cy+8} Q${cx} ${cy+14} ${cx+7} ${cy+8}" fill="none" stroke="${eye}" stroke-width="1.8" stroke-linecap="round"/>`;

    const sad = pet.food < 25 || pet.water < 25;
    const bs = !sad ? `style="animation:bounce 1.4s ease-in-out infinite"` : '';

    return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bodyGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="white" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${body}" stop-opacity="0"/>
        </radialGradient>
        <filter id="petGlow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <g ${bs}>
        ${ears}
        <ellipse cx="${cx}" cy="${cy}" rx="30" ry="28" fill="${body}" stroke="${ol}" stroke-width="1.6"/>
        <ellipse cx="${cx}" cy="${cy}" rx="30" ry="28" fill="url(#bodyGrad)"/>
        <ellipse cx="${cx-11}" cy="${cy+7}" rx="10" ry="13" fill="${body}" stroke="${ol}" stroke-width="1.4"/>
        <ellipse cx="${cx+11}" cy="${cy+7}" rx="10" ry="13" fill="${body}" stroke="${ol}" stroke-width="1.4"/>
        <ellipse cx="${cx}" cy="${cy+22}" rx="13" ry="8" fill="${body}" stroke="${ol}" stroke-width="1.4"/>
        <ellipse cx="${cx-18}" cy="${cy-2}" rx="6" ry="4.5" fill="${cheek}" opacity=".42"/>
        <ellipse cx="${cx+18}" cy="${cy-2}" rx="6" ry="4.5" fill="${cheek}" opacity=".42"/>
        <ellipse cx="${cx-13}" cy="${cy+6}" rx="6.5" ry="7.5" fill="${cheek}" opacity=".28"/>
        <ellipse cx="${cx+13}" cy="${cy+6}" rx="6.5" ry="7.5" fill="${cheek}" opacity=".28"/>
        <ellipse cx="${cx-13}" cy="${cy-6}" rx="5.5" ry="6.5" fill="${eye}" style="animation:blink 3.5s ease-in-out infinite"/>
        <ellipse cx="${cx-11}" cy="${cy-8.5}" rx="2" ry="2" fill="white"/>
        <ellipse cx="${cx+13}" cy="${cy-6}" rx="5.5" ry="6.5" fill="${eye}" style="animation:blink 3.5s ease-in-out infinite .18s"/>
        <ellipse cx="${cx+15}" cy="${cy-8.5}" rx="2" ry="2" fill="white"/>
        <ellipse cx="${cx}" cy="${cy+3}" rx="4" ry="3" fill="${cheek}"/>
        ${mouth}
      </g>
      <ellipse cx="${cx+32}" cy="${cy+14}" rx="8" ry="5.5" fill="${body}" stroke="${ol}" stroke-width="1.4"
        style="transform-origin:${cx+32}px ${cy+14}px;animation:tailWag 1s ease-in-out infinite"/>
    </svg>`;
  }

  function burstParticles(container, pet) {
    const colors = [pet.bodyColor, pet.cheekColor, '#fff', '#fac775', '#d4537e'];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      const angle = (i / 12) * Math.PI * 2;
      const speed = 40 + Math.random() * 40;
      const size = 5 + Math.random() * 7;
      p.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        top:50%;left:50%;
        pointer-events:none;
        z-index:20;
        transform:translate(-50%,-50%);
        transition:all 0.5s ease-out;
        opacity:1;
      `;
      container.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${Math.cos(angle)*speed}px), calc(-50% + ${Math.sin(angle)*speed}px))`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 600);
    }
  }

  // Add orbit animation keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes orbitFloat {
      0%, 100% { transform: translate(-50%,-50%) rotate(var(--base-angle, 0deg)) translateX(55px) scale(1); opacity: 0.7; }
      50% { transform: translate(-50%,-50%) rotate(calc(var(--base-angle, 0deg) + 30deg)) translateX(62px) scale(1.2); opacity: 1; }
    }
    #spline-pet-container { filter: drop-shadow(0 8px 20px rgba(212,83,126,0.25)); }
    #spline-pet-container:hover { filter: drop-shadow(0 12px 30px rgba(212,83,126,0.45)); }
  `;
  document.head.appendChild(style);

  // Wait for DOM then init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplinePet);
  } else {
    setTimeout(initSplinePet, 100);
  }

})();
