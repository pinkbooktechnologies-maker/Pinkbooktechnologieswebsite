/* ================================================
   PINKBOOK TECHNOLOGIES — SERVICES PAGE JS
================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsapReady     = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  initStickyNav();
  initScrollSpy();
  initPillHighlight();
  initTypewriter();
  init3DTilt(reducedMotion);
  initVideoProgressAnim(reducedMotion);
  initDesignCursorFollow(reducedMotion);

  if (gsapReady) {
    initServiceDetailAnimations(reducedMotion);
    initMockupParallax(reducedMotion);
    initProcessNumbers(reducedMotion);
  }
  // Newsletter form is handled once, centrally, in main.js
});

/* ─── Sticky nav shows once the detailed service sections begin ─── */
function initStickyNav() {
  const nav    = document.getElementById('svc-sticky-nav');
  const anchor = document.getElementById('services-detail');
  const about  = document.getElementById('about');
  if (!nav || !anchor) return;

  const HEADER_OFFSET = 80;

  function update() {
    const anchorTop = anchor.getBoundingClientRect().top;
    const aboutTop  = about ? about.getBoundingClientRect().top : Infinity;

    const pastAnchor = anchorTop <= HEADER_OFFSET;
    const beforeAbout = aboutTop > HEADER_OFFSET;

    nav.classList.toggle('is-visible', pastAnchor && beforeAbout);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  /* Also re-check on Lenis scroll events if Lenis is driving the scroll */
  if (window.__lenis) {
    window.__lenis.on('scroll', update);
  }
}

/* ─── Scroll spy: highlight sticky-nav link for current section ─── */
function initScrollSpy() {
  const links    = document.querySelectorAll('.svc-sticky-link');
  const sections = ['software','mobile','design','video','hosting','logo']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  if (!links.length || !sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(l => l.classList.toggle('active', l.dataset.target === id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
}

/* ─── Pill click: smooth scroll to section ─── */
function initPillHighlight() {
  document.querySelectorAll('.svc-pill').forEach(pill => {
    pill.addEventListener('click', e => {
      const href = pill.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ─── Typewriter on domain URL ─── */
function initTypewriter() {
  const el = document.getElementById('domain-typewriter');
  if (!el) return;

  const words = [
    'pinkbooktechnologies.com',
    'yourbrand.co.in',
    'mycompany.io',
    'getstarted.com',
  ];
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    if (deleting) {
      el.textContent = word.slice(0, ci--);
      if (ci < 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0; setTimeout(tick, 400); return; }
      setTimeout(tick, 50);
    } else {
      el.textContent = word.slice(0, ci++);
      if (ci > word.length) { deleting = true; setTimeout(tick, 1400); return; }
      setTimeout(tick, 80);
    }
  }
  setTimeout(tick, 1000);
}

/* ─── 3D Tilt on mockup cards ─── */
function init3DTilt(reducedMotion) {
  if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll(
    '.svc-mockup-code, .phone-frame, .domain-card, .logo-canvas, .video-player'
  );

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const rx     = ((e.clientY - cy) / (rect.height / 2)) * 8;
      const ry     = ((e.clientX - cx) / (rect.width  / 2)) * -8;

      if (typeof gsap !== 'undefined') {
        gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.4, ease: 'power2.out', transformPerspective: 600 });
      } else {
        card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', transformPerspective: 600 });
      } else {
        card.style.transform = '';
      }
    });
  });
}

/* ─── Video progress bar animation ─── */
function initVideoProgressAnim(reducedMotion) {
  const fill = document.querySelector('.video-progress-fill');
  const dot  = document.querySelector('.video-progress-dot');
  if (!fill || !dot || reducedMotion) return;

  let pct = 32;
  const tick = () => {
    pct += 0.02;
    if (pct > 100) pct = 0;
    fill.style.width = pct + '%';
    dot.style.left   = pct + '%';
    requestAnimationFrame(tick);
  };
  tick();
}

/* ─── Design canvas cursor follows mouse ─── */
function initDesignCursorFollow(reducedMotion) {
  const canvas = document.querySelector('.design-canvas');
  const dot    = document.getElementById('design-cursor');
  if (!canvas || !dot || reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width)  * 100;
    const y = ((e.clientY - r.top)  / r.height) * 100;
    if (typeof gsap !== 'undefined') {
      gsap.to(dot, { left: x + '%', top: y + '%', duration: 0.3, ease: 'power2.out' });
    } else {
      dot.style.left = x + '%';
      dot.style.top  = y + '%';
    }
  });
}

/* ─── GSAP: service section entrance animations ─── */
function initServiceDetailAnimations(reducedMotion) {
  if (reducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity=1; el.style.transform='none'; });
    return;
  }

  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none none' }
    });
  });

  // Staggered features inside each service section
  document.querySelectorAll('.svc-detail').forEach(section => {
    const features = section.querySelectorAll('.svc-feature');
    if (!features.length) return;
    gsap.set(features, { opacity: 0, x: -20 });
    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      onEnter: () => {
        gsap.to(features, { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out', stagger: 0.1 });
      },
      once: true
    });
  });

  // Tech badges scale in
  document.querySelectorAll('.svc-tech-stack').forEach(stack => {
    const badges = stack.querySelectorAll('.tech-badge');
    gsap.set(badges, { opacity: 0, scale: 0.7 });
    ScrollTrigger.create({
      trigger: stack,
      start: 'top 88%',
      onEnter: () => {
        gsap.to(badges, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.05 });
      },
      once: true
    });
  });

  // Process cards stagger
  const processCards = document.querySelectorAll('.svc-process-card');
  if (processCards.length) {
    gsap.set(processCards, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: '.svc-process-grid',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(processCards, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12 });
      },
      once: true
    });
  }

  // Split titles (same logic as main page)
  document.querySelectorAll('.split-title').forEach(title => {
    const text = title.textContent;
    title.setAttribute('aria-label', text);
    title.innerHTML = text.split(' ').map(w => `<span class="word"><span>${w}</span></span>`).join(' ');
    gsap.set(title.querySelectorAll('.word > span'), { yPercent: 110, opacity: 0 });
    gsap.to(title.querySelectorAll('.word > span'), {
      yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.04,
      scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
    });
    gsap.set(title, { opacity: 1, y: 0 });
  });
}

/* ─── GSAP: subtle parallax on mockup visuals ─── */
function initMockupParallax(reducedMotion) {
  if (reducedMotion) return;

  document.querySelectorAll('.svc-detail-visual').forEach(visual => {
    gsap.to(visual, {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: visual.closest('.svc-detail'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

/* ─── GSAP: process numbers count up ─── */
function initProcessNumbers(reducedMotion) {
  if (reducedMotion) return;

  document.querySelectorAll('.svc-process-num').forEach(num => {
    const target = parseInt(num.textContent);
    gsap.from(num, {
      textContent: 0,
      duration: 0.8,
      ease: 'power2.out',
      snap: { textContent: 1 },
      scrollTrigger: { trigger: num, start: 'top 90%', toggleActions: 'play none none none' },
      onUpdate: function () {
        num.textContent = String(Math.round(this.targets()[0].textContent)).padStart(2, '0');
      }
    });
  });
}
