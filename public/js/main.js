/* ================================================
   PINKBOOK TECHNOLOGIES — MAIN JS (GSAP edition)
================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.add('is-loading');

  // Register GSAP plugin if available
  const gsapReady = typeof gsap !== 'undefined';
  const scrollTriggerReady = gsapReady && typeof ScrollTrigger !== 'undefined';
  if (scrollTriggerReady) {
    gsap.registerPlugin(ScrollTrigger);
  }

  initPreloader(reducedMotion);
  initHeader();
  initMobileNav();
  initScrollProgress();
  initCustomCursor(reducedMotion);
  initMagneticButtons(reducedMotion);
  initCounters();
  initBackToTop();
  initForms();
  initHexNetwork(reducedMotion);
  initActiveNav();
  document.getElementById('year').textContent = new Date().getFullYear();

  if (gsapReady && scrollTriggerReady) {
    try {
      initHeroAnimations(reducedMotion);
      initScrollReveals(reducedMotion);
      initParallaxFloaters(reducedMotion);
      initProcessScrub(reducedMotion);
      initHex3DCarousel(reducedMotion);
      initMosaicFloat(reducedMotion);
    } catch (err) {
      console.error('Animation init failed, showing static content:', err);
      showAllContent();
    }
  } else {
    // GSAP failed to load (offline / blocked CDN) — show everything immediately
    showAllContent();
  }
});

/* ---------- Fallback: force-show all animated content ---------- */
function showAllContent() {
  document.querySelectorAll('.reveal, .reveal-card, .hero-line, [data-anim], .mosaic-hex').forEach(el => {
    el.style.opacity = 1;
    el.style.transform = 'none';
  });
  const fill = document.getElementById('process-line-fill');
  if (fill) fill.style.width = '100%';
}

/* ---------- Preloader ---------- */
function initPreloader(reducedMotion) {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    preloader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    setTimeout(() => preloader.remove(), 700);
  };

  // Hide as soon as page resources are ready
  if (document.readyState === 'complete') {
    setTimeout(finish, reducedMotion ? 0 : 400);
  } else {
    window.addEventListener('load', () => setTimeout(finish, reducedMotion ? 0 : 400));
  }

  // Hard safety net: never let the preloader block the page for more than 3s
  setTimeout(finish, 3000);
}

/* ---------- Header scroll state ---------- */
function initHeader() {
  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

/* ---------- Active nav link highlighting ---------- */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* ---------- Custom cursor (dot + ring) ---------- */
function initCustomCursor(reducedMotion) {
  if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  const tick = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  tick();

  const hoverTargets = document.querySelectorAll('a, button, input, textarea, select, .magnetic');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

/* ---------- Magnetic button effect ---------- */
function initMagneticButtons(reducedMotion) {
  if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  const magnets = document.querySelectorAll('.magnetic');

  magnets.forEach(magnet => {
    const strength = 0.35;
    const inner = magnet.querySelector('span') || magnet;

    magnet.addEventListener('mousemove', (e) => {
      const rect = magnet.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;

      if (typeof gsap !== 'undefined') {
        gsap.to(magnet, { x: x, y: y, duration: 0.35, ease: 'power3.out' });
        gsap.to(inner, { x: x * 0.5, y: y * 0.5, duration: 0.35, ease: 'power3.out' });
      } else {
        magnet.style.transform = `translate(${x}px, ${y}px)`;
      }
    });

    magnet.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(magnet, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        gsap.to(inner, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      } else {
        magnet.style.transform = 'translate(0, 0)';
      }
    });
  });
}

/* ---------- Hero entrance animation (GSAP timeline) ---------- */
function initHeroAnimations(reducedMotion) {
  const lines = document.querySelectorAll('[data-anim="hero-line"]');

  if (reducedMotion) {
    lines.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  gsap.set(lines, { opacity: 0, y: 40 });

  const tl = gsap.timeline({ delay: 0.7, defaults: { ease: 'power3.out', duration: 0.9 } });
  tl.to(lines, {
    opacity: 1,
    y: 0,
    stagger: 0.12
  });
}

/* ---------- Scroll-triggered reveal animations ---------- */
function initScrollReveals(reducedMotion) {
  if (reducedMotion) {
    document.querySelectorAll('.reveal, .reveal-card').forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    return;
  }

  // Simple fade/slide reveals
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Card grids: stagger by container
  const cardGroups = {};
  gsap.utils.toArray('.reveal-card').forEach((el) => {
    const parent = el.parentElement;
    if (!cardGroups[parent]) cardGroups[parent] = [];
    cardGroups[parent].key = parent;
  });

  document.querySelectorAll('.hex-grid, .work-grid, .testimonial-grid').forEach((group) => {
    const cards = group.querySelectorAll('.reveal-card');
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: group,
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Split title word reveal
  document.querySelectorAll('.split-title').forEach((title) => {
    const text = title.textContent;
    title.setAttribute('aria-label', text);
    title.innerHTML = text.split(' ').map(word =>
      `<span class="word"><span>${word}</span></span>`
    ).join(' ');

    gsap.set(title.querySelectorAll('.word > span'), { yPercent: 110, opacity: 0 });
    gsap.to(title.querySelectorAll('.word > span'), {
      yPercent: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.04,
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
    // override the generic .reveal animation for this element
    gsap.set(title, { opacity: 1, y: 0 });
  });
}

/* ---------- Parallax floating hexagons in hero ---------- */
function initParallaxFloaters(reducedMotion) {
  if (reducedMotion) return;
  const floaters = document.querySelectorAll('.floater');
  if (!floaters.length) return;

  gsap.utils.toArray(floaters).forEach((el) => {
    const speed = parseFloat(el.dataset.speed) || 0.2;
    gsap.to(el, {
      yPercent: () => -100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

/* ---------- Process vertical timeline: line fill + node glow + dot activation ---------- */
function initProcessScrub(reducedMotion) {
  const fill  = document.getElementById('ptl-line-fill');
  const glow  = document.getElementById('ptl-node-glow');
  const wrap  = document.querySelector('.ptl-wrap');
  const dots  = document.querySelectorAll('.ptl-dot');
  if (!fill || !wrap) return;

  if (reducedMotion) {
    fill.style.height = '100%';
    dots.forEach(d => d.classList.add('is-active'));
    return;
  }

  gsap.to(fill, {
    height: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: wrap,
      start: 'top 65%',
      end: 'bottom 55%',
      scrub: true,
      onUpdate: self => {
        const pct = self.progress * 100;
        if (glow) glow.style.top = pct + '%';
        dots.forEach((d, i) => {
          const threshold = ((i + 0.5) / dots.length) * 100;
          d.classList.toggle('is-active', pct >= threshold - 8);
        });
      }
    }
  });

  /* card entrance: slide in from alternating sides */
  document.querySelectorAll('.ptl-step').forEach(step => {
    const card = step.querySelector('.ptl-card');
    const fromLeft = step.classList.contains('ptl-left');
    gsap.fromTo(card,
      { opacity: 0, x: fromLeft ? -50 : 50 },
      {
        opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });
}

/* ---------- 3D hexagon carousel: pause-on-hover + entrance ---------- */
function initHex3DCarousel(reducedMotion) {
  const stage = document.getElementById('hex3d-stage');
  if (!stage) return;

  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(stage, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' });
    } else {
      stage.style.opacity = 1;
    }
  }, { threshold: 0.2 });
  obs.observe(stage);
}

/* ---------- About mosaic float (subtle continuous motion) ---------- */
function initMosaicFloat(reducedMotion) {
  if (reducedMotion) return;
  document.querySelectorAll('.mosaic-hex').forEach((el) => {
    const order = parseInt(el.dataset.float, 10) || 1;
    gsap.to(el, {
      y: order % 2 === 0 ? -14 : 14,
      duration: 3 + order * 0.4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: order * 0.15
    });
  });
}

/* ---------- Animated stat counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => observer.observe(c));
}

/* ---------- Back to top button ---------- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
}

/* ---------- Form handling (contact + newsletter) ---------- */
function initForms() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      service: document.getElementById('service').value,
      message: document.getElementById('message').value
    };

    try {
      const response = await fetch('http://localhost:3000/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        alert('Message Sent Successfully');
        contactForm.reset();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.log(err);
      alert('Server Error');
    }
  });

  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterNote = document.getElementById('newsletter-note');

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!newsletterForm.checkValidity()) {
      newsletterNote.textContent = 'Please enter a valid email.';
      return;
    }
    newsletterNote.textContent = "You're subscribed!";
    newsletterForm.reset();
  });
}

/* ---------- Hexagon network canvas (hero signature animation, mouse-reactive) ---------- */
function initHexNetwork(reducedMotion) {
  const canvas = document.getElementById('hex-network');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, nodes, dpr;
  let mouse = { x: -9999, y: -9999 };

  const LINK_DIST = 170;
  const MOUSE_RADIUS = 180;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createNodes();
  }

  function createNodes() {
    const area = width * height;
    const count = Math.max(24, Math.min(70, Math.floor(area / 32000)));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: 0,
        baseY: 0,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 1.2,
        accent: Math.random() < 0.18
      });
    }
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
      n.x = Math.max(0, Math.min(width, n.x));
      n.y = Math.max(0, Math.min(height, n.y));

      // mouse repulsion
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        n.x += (dx / (dist || 1)) * force * 1.6;
        n.y += (dy / (dist || 1)) * force * 1.6;
      }
    }

    // links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = 1 - dist / LINK_DIST;
          ctx.strokeStyle = `rgba(35, 137, 173, ${alpha * 0.25})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // link to mouse
      const dxm = nodes[i].x - mouse.x;
      const dym = nodes[i].y - mouse.y;
      const distm = Math.sqrt(dxm * dxm + dym * dym);
      if (distm < MOUSE_RADIUS) {
        const alpha = 1 - distm / MOUSE_RADIUS;
        ctx.strokeStyle = `rgba(212, 37, 114, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = n.accent ? 'rgba(212, 37, 114, 0.85)' : 'rgba(35, 137, 173, 0.8)';
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reducedMotion) {
      requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}


/* ====================================================
   ABOUT SECTION — 3D carousel + accordion
==================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAboutAccordion();
});

/* Accordion open/close */
function initAboutAccordion() {
  document.querySelectorAll('.aa-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item   = trigger.closest('.aa-item');
      const body   = item.querySelector('.aa-body');
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.aa-item').forEach(it => {
        it.querySelector('.aa-trigger').setAttribute('aria-expanded', 'false');
        it.querySelector('.aa-body').classList.remove('aa-open');
      });
      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        body.classList.add('aa-open');
      }
    });
  });
}
