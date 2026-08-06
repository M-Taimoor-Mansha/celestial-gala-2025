/**
 * The Celestial Gala - Core Interactive Engine
 * Controls Particle Canvas, Audio Synth, Countdown, RSVP Ticket Generator & Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initHeaderAndNav();
  initCountdown();
  initScrollAnimations();
  initAudioPlayer();
  initRSVPForm();
  initGallery();
});

/* ==========================================================
   1. Interactive Starfield & Meteor Canvas
   ========================================================== */
function initStarfield() {
  let canvas = document.getElementById('starfield');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'starfield';
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  let stars = [];
  let meteors = [];
  let mouse = { x: width / 2, y: height / 2 };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createStars();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function createStars() {
    stars = [];
    const count = Math.floor((width * height) / 3000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
        color: Math.random() > 0.3 ? '#ffffff' : (Math.random() > 0.5 ? '#d4af37' : '#9b51e0')
      });
    }
  }

  function spawnMeteor() {
    if (Math.random() < 0.03 && meteors.length < 3) {
      meteors.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.3,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 8 + 4,
        alpha: 1,
        angle: Math.PI / 4
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw Stars
    stars.forEach(star => {
      star.alpha += star.speed;
      if (star.alpha > 1 || star.alpha < 0.1) star.speed = -star.speed;

      // Parallax effect with mouse
      let dx = (mouse.x - width / 2) * 0.01 * (star.radius / 2);
      let dy = (mouse.y - height / 2) * 0.01 * (star.radius / 2);

      ctx.beginPath();
      ctx.arc(star.x + dx, star.y + dy, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
      ctx.shadowBlur = star.radius > 1 ? 8 : 0;
      ctx.shadowColor = star.color;
      ctx.fill();
    });

    // Draw Meteors
    spawnMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
      let m = meteors[i];
      let endX = m.x + Math.cos(m.angle) * m.length;
      let endY = m.y + Math.sin(m.angle) * m.length;

      let grad = ctx.createLinearGradient(m.x, m.y, endX, endY);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(1, `rgba(212, 175, 55, ${m.alpha})`);

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= 0.015;

      if (m.alpha <= 0 || m.x > width || m.y > height) {
        meteors.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  createStars();
  animate();
}

/* ==========================================================
   2. Header & Dynamic Navigation
   ========================================================== */
function initHeaderAndNav() {
  const header = document.querySelector('.gala-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Active link highlighter
  const rawPath = window.location.pathname.split('/').pop() || 'index.html';
  const cleanPath = rawPath.split('#')[0].split('?')[0] || 'index.html';

  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.remove('active');
    if (href === cleanPath || (cleanPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile menu toggle
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }
}

/* ==========================================================
   3. Live Countdown Timer
   ========================================================== */
function initCountdown() {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!daysEl) return;

  // Gala Target Date: Nov 22, 2025 at 19:00:00
  let eventDate = new Date('November 22, 2025 19:00:00').getTime();
  const now = new Date().getTime();

  // If date passed, set to next year gala date for preview
  if (now > eventDate) {
    eventDate = new Date('November 22, 2026 19:00:00').getTime();
  }

  function updateTimer() {
    const currentTime = new Date().getTime();
    const distance = eventDate - currentTime;

    if (distance < 0) {
      if (daysEl) daysEl.innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = days < 10 ? '0' + days : days;
    hoursEl.innerText = hours < 10 ? '0' + hours : hours;
    minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
    secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================
   4. Scroll Animations (IntersectionObserver)
   ========================================================== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-up').forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================================
   5. Web Audio API Celestial Atmosphere
   ========================================================== */
function initAudioPlayer() {
  const audioBtn = document.getElementById('audio-toggle');
  if (!audioBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let oscillators = [];
  let gainNode = null;

  audioBtn.addEventListener('click', () => {
    if (!isPlaying) {
      startAmbientAudio();
      audioBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
        </svg>`;
      audioBtn.title = "Mute Ambient Sound";
      isPlaying = true;
    } else {
      stopAmbientAudio();
      audioBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
        </svg>`;
      audioBtn.title = "Play Ambient Sound";
      isPlaying = false;
    }
  });

  function startAmbientAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContext();

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);

    // Ethereal chord frequencies (Cmaj9)
    const freqs = [130.81, 196.00, 246.94, 293.66, 392.00];
    freqs.forEach(f => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, audioCtx.currentTime);

      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 0.2;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 2;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(gainNode);
      osc.start();
      oscillators.push(osc);
    });
  }

  function stopAmbientAudio() {
    if (gainNode && audioCtx) {
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        oscillators.forEach(osc => osc.stop());
        oscillators = [];
      }, 500);
    }
  }
}

/* ==========================================================
   6. Interactive RSVP & VIP Pass Generation
   ========================================================== */
function initRSVPForm() {
  const rsvpForm = document.getElementById('gala-rsvp-form');
  if (!rsvpForm) return;

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('guest-name').value.trim();
    const email = document.getElementById('guest-email').value.trim();
    const guests = document.getElementById('guest-count').value;
    const dietary = document.getElementById('guest-dietary').value;
    const song = document.getElementById('guest-song').value;

    if (!name || !email) {
      alert('Please provide your name and email address.');
      return;
    }

    // Generate unique pass ID
    const ticketId = 'CEL-GALA-' + Math.floor(100000 + Math.random() * 900000);

    // Save to LocalStorage
    const rsvpData = { name, email, guests, dietary, song, ticketId, date: new Date().toLocaleDateString() };
    localStorage.setItem('gala_rsvp', JSON.stringify(rsvpData));

    // Show VIP Ticket Modal
    renderVIPTicket(rsvpData);
    triggerConfetti();
  });
}

function renderVIPTicket(data) {
  let modal = document.getElementById('ticket-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ticket-modal';
    modal.className = 'lightbox-modal active';
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  } else {
    modal.classList.add('active');
  }

  modal.innerHTML = `
    <div class="glass-card p-6 md:p-8 max-w-2xl w-full text-center relative" style="border-color: var(--gold-primary);">
      <button onclick="document.getElementById('ticket-modal').classList.remove('active')" class="lightbox-close">&times;</button>
      <span class="gold-text uppercase font-semibold text-xs tracking-widest">RSVP Confirmation</span>
      <h2 class="font-serif text-3xl gold-gradient-text my-2">Your VIP Celestial Pass</h2>
      <p class="text-gray-300 text-sm mb-6">Congratulations ${data.name}, your attendance is officially confirmed.</p>

      <div class="ticket-wrapper">
        <div class="vip-ticket">
          <div class="ticket-notch-top"></div>
          <div class="ticket-notch-bottom"></div>
          
          <div class="ticket-stub text-left">
            <div class="flex justify-between items-center mb-4">
              <span class="text-xs gold-text uppercase tracking-wider font-bold">The Celestial Gala</span>
              <span class="text-xs text-gray-400 font-mono">${data.ticketId}</span>
            </div>
            <h3 class="font-serif text-2xl text-white font-bold mb-1">${data.name}</h3>
            <p class="text-xs text-gray-300 mb-4">Guest Count: ${parseInt(data.guests) + 1} Access Pass | Formal VIP</p>

            <div class="grid grid-cols-2 gap-4 text-xs text-gray-300">
              <div>
                <p class="text-gray-400 uppercase font-semibold text-3xs">Date & Time</p>
                <p class="font-semibold text-white">Nov 22, 2025 | 7:00 PM</p>
              </div>
              <div>
                <p class="text-gray-400 uppercase font-semibold text-3xs">Venue</p>
                <p class="font-semibold text-white">Starlight Observatory</p>
              </div>
            </div>
          </div>

          <div class="ticket-sidebar">
            <canvas id="qr-canvas" width="90" height="90" class="qr-code-box"></canvas>
            <span class="text-3xs uppercase font-mono gold-text">Scan for Entry</span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap justify-center gap-4">
        <button onclick="window.print()" class="btn-gold-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Print VIP Pass
        </button>
        <button onclick="document.getElementById('ticket-modal').classList.remove('active')" class="btn-gold-outline">
          Close Window
        </button>
      </div>
    </div>
  `;

  drawQRCode(data.ticketId);
}

function drawQRCode(id) {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, 90, 90);

  // Generate stylized QR matrix
  ctx.fillStyle = '#d4af37';
  const size = 6;
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if ((r < 4 && c < 4) || (r < 4 && c > 10) || (r > 10 && c < 4) || Math.random() > 0.45) {
        ctx.fillRect(c * size, r * size, size - 1, size - 1);
      }
    }
  }
}

/* ==========================================================
   7. Confetti Explosion System
   ========================================================== */
function triggerConfetti() {
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  const colors = ['#d4af37', '#ffe58f', '#ffffff', '#9b51e0', '#e6c280'];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2,
      alpha: 1
    });
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravity
      p.rotation += p.vRot;
      p.alpha -= 0.008;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (active) {
      requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  renderConfetti();
}

/* ==========================================================
   8. Filterable Gallery & Lightbox
   ========================================================== */
function initGallery() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-item');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active', 'btn-gold-primary'));
        filterBtns.forEach(b => b.classList.add('btn-gold-outline'));
        btn.classList.remove('btn-gold-outline');
        btn.classList.add('active', 'btn-gold-primary');

        const cat = btn.getAttribute('data-filter');
        items.forEach(item => {
          if (cat === 'all' || item.getAttribute('data-category') === cat) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // Lightbox click
  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('h4')?.innerText || 'Celestial Gala';
      if (img) {
        openLightbox(img.src, title);
      }
    });
  });
}

function openLightbox(src, title) {
  let modal = document.getElementById('lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'lightbox-modal';
    modal.className = 'lightbox-modal';
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  modal.innerHTML = `
    <div class="lightbox-content">
      <button onclick="document.getElementById('lightbox-modal').classList.remove('active')" class="lightbox-close">&times;</button>
      <img src="${src}" alt="${title}">
      <p class="text-center gold-text font-serif text-lg mt-3">${title}</p>
    </div>
  `;

  modal.classList.add('active');
}
