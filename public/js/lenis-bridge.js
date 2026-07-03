/* ================================================
   LENIS SMOOTH SCROLL + ANIME.JS BRIDGE
   Wires Lenis smooth-scrolling into GSAP ScrollTrigger
   and layers in a few anime.js flourishes.
================================================ */

(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- 1. Initialise Lenis ---------- */
  let lenis = null;

  function initLenis() {
    if (typeof Lenis === 'undefined') return null;
    if (reducedMotion) return null; // respect reduced motion: native scroll only

    const instance = new Lenis({
      duration: 1.1,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: isTouch ? 1.4 : 1,
      syncTouch: false, // keep native touch scroll feel on mobile
      autoRaf: false,   // we drive the raf loop ourselves (synced with GSAP ticker below)
    });

    return instance;
  }

  lenis = initLenis();

  /* ---------- 2. Drive Lenis + sync with GSAP ScrollTrigger ---------- */
  if (lenis) {
    const gsapReady = typeof gsap !== 'undefined';

    if (gsapReady) {
      // Use GSAP's ticker as the single rAF driver so Lenis and ScrollTrigger never desync
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      lenis.on('scroll', () => {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
      });
    } else {
      // fallback raf loop if GSAP somehow isn't present
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    /* Let in-page anchor links (nav, CTA buttons, sticky pills) use Lenis' smooth scrollTo */
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -64, duration: 1.3 });
    });

    /* expose globally in case other scripts want it */
    window.__lenis = lenis;
  }

  /* ---------- 3. anime.js flourishes ---------- */
  function initAnimeFlourishes() {
    if (typeof anime === 'undefined' || reducedMotion) return;

    /* a) Logo mark: gentle continuous pulse on the dotted ring using anime.js (independent of GSAP) */
    const logoDots = document.querySelector('.logo-mark .logo-mark-dots');
    if (logoDots) {
      anime({
        targets: logoDots,
        opacity: [0.6, 1, 0.6],
        scale: [1, 1.04, 1],
        duration: 3200,
        easing: 'easeInOutSine',
        loop: true,
      });
    }

    /* b) Section eyebrow dot/line — small anime.js "draw-in" the first time each enters view */
    const eyebrows = document.querySelectorAll('.section-eyebrow, .ae-text');
    if (eyebrows.length && 'IntersectionObserver' in window) {
      const seen = new WeakSet();
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          anime({
            targets: entry.target,
            translateX: [-12, 0],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutCubic',
          });
        });
      }, { threshold: 0.6 });
      eyebrows.forEach((el) => obs.observe(el));
    }

    /* c) Service tech-badges: anime.js stagger pop (separate flourish layered on top of GSAP's) */
    document.querySelectorAll('.tech-badge').forEach((badge) => {
      badge.addEventListener('mouseenter', () => {
        anime({
          targets: badge,
          scale: [1, 1.12, 1],
          duration: 380,
          easing: 'easeOutElastic(1, .6)',
        });
      });
    });

    /* d) hex3d-face cards: tiny anime.js "settle" wobble on click/tap (mobile-friendly feedback) */
    document.querySelectorAll('.hex3d-card').forEach((card) => {
      card.addEventListener('click', () => {
        anime({
          targets: card.querySelector('.hex3d-face'),
          scale: [1, 0.95, 1.03, 1],
          duration: 500,
          easing: 'easeOutBack',
        });
      });
    });

    /* e) CTA arrow nudge using anime.js (replaces a pure-CSS hover, adds spring feel) */
    document.querySelectorAll('.about-cta, .svc-cta').forEach((cta) => {
      const arrow = cta.querySelector('svg');
      if (!arrow) return;
      cta.addEventListener('mouseenter', () => {
        anime({ targets: arrow, translateX: 6, duration: 280, easing: 'easeOutQuad' });
      });
      cta.addEventListener('mouseleave', () => {
        anime({ targets: arrow, translateX: 0, duration: 400, easing: 'easeOutElastic(1, .5)' });
      });
    });

    /* f) Domain "LIVE" badge using anime.js pulse instead of CSS keyframe (services section) */
    const liveBadge = document.querySelector('.domain-badge-secure');
    if (liveBadge) {
      anime({
        targets: liveBadge,
        opacity: [1, 0.55, 1],
        duration: 1800,
        easing: 'easeInOutSine',
        loop: true,
      });
    }

    /* g) CTA band "what happens next" steps: stagger in once the band scrolls into view */
    const ctaSteps = document.querySelectorAll('.cta-step');
    if (ctaSteps.length && 'IntersectionObserver' in window) {
      const ctaBand = document.querySelector('.cta-band-steps');
      anime.set(ctaSteps, { opacity: 0, translateX: 16 });
      const ctaObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          ctaObs.disconnect();
          anime({
            targets: ctaSteps,
            opacity: [0, 1],
            translateX: [16, 0],
            delay: anime.stagger(120, { start: 150 }),
            duration: 550,
            easing: 'easeOutCubic',
          });
        });
      }, { threshold: 0.4 });
      if (ctaBand) ctaObs.observe(ctaBand);
    }
  }

  /* ---------- 4. Boot ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimeFlourishes);
  } else {
    initAnimeFlourishes();
  }

  /* ---------- 5. Pause/resume Lenis while the mobile nav drawer is open ---------- */
  const navToggle = document.getElementById('nav-toggle');
  if (navToggle && lenis) {
    navToggle.addEventListener('click', () => {
      const isOpen = document.getElementById('main-nav')?.classList.contains('open');
      // classList reflects state *before* this click's toggle in main.js runs after; defer a tick
      requestAnimationFrame(() => {
        const nowOpen = document.getElementById('main-nav')?.classList.contains('open');
        if (nowOpen) lenis.stop(); else lenis.start();
      });
    });
  }
})();
