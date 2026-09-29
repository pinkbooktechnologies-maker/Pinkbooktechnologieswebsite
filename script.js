(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const ready = () => {
    window.setTimeout(() => body.classList.add("is-loaded"), prefersReducedMotion.matches ? 0 : 520);
  };

  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready, { once: true });

  // Reveal content only when it is close to the viewport. The final state remains
  // fully readable without JavaScript and when reduced motion is requested.
  const revealItems = [...document.querySelectorAll(".reveal")];
  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    revealItems.forEach((item, index) => {
      item.style.setProperty("--reveal-order", String(index));
      revealObserver.observe(item);
    });
  }

  const header = document.querySelector("[data-header]");
  const progressBar = document.querySelector(".scroll-progress span");
  const heroObject = document.querySelector("[data-hero-object]");
  const capabilityMedia = [...document.querySelectorAll(".capability-card__media")];
  const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateScrollUI = () => {
    const currentY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = documentHeight > 0 ? currentY / documentHeight : 0;

    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    header.classList.toggle("is-scrolled", currentY > 20);
    header.classList.toggle("is-hidden", currentY > lastScrollY && currentY > 180 && !body.classList.contains("menu-open"));

    if (heroObject && !prefersReducedMotion.matches && currentY < window.innerHeight * 1.2) {
      const shift = Math.min(42, currentY * 0.045);
      heroObject.style.setProperty("--scroll-shift", `${shift}px`);
      heroObject.style.transform = `translate3d(var(--pointer-x, 0px), calc(var(--pointer-y, 0px) + ${shift}px), 0) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))`;
    }

    if (!prefersReducedMotion.matches) {
      capabilityMedia.forEach((media, index) => {
        const bounds = media.getBoundingClientRect();
        if (bounds.bottom < -100 || bounds.top > window.innerHeight + 100) return;
        const viewportProgress = (bounds.top + bounds.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const shift = Math.max(-22, Math.min(22, viewportProgress * -18 + (index % 2 ? 5 : -5)));
        media.style.setProperty("--media-shift", `${shift}px`);
      });

      parallaxItems.forEach((item) => {
        const bounds = item.getBoundingClientRect();
        if (bounds.bottom < -120 || bounds.top > window.innerHeight + 120) return;
        const strength = Number(item.dataset.parallax) || 12;
        const centerOffset = (bounds.top + bounds.height / 2 - window.innerHeight / 2) / window.innerHeight;
        item.style.setProperty("--parallax-shift", `${Math.max(-strength, Math.min(strength, centerOffset * -strength))}px`);
      });

    }

    lastScrollY = currentY;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollUI);
    },
    { passive: true },
  );
  updateScrollUI();

  // Pointer depth on the hero artwork.
  const heroVisual = document.querySelector(".hero__visual");
  if (heroVisual && heroObject && finePointer.matches && !prefersReducedMotion.matches) {
    heroVisual.addEventListener("pointermove", (event) => {
      const bounds = heroVisual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      heroObject.style.setProperty("--pointer-x", `${x * 15}px`);
      heroObject.style.setProperty("--pointer-y", `${y * 12}px`);
      heroObject.style.setProperty("--rotate-x", `${y * -4}deg`);
      heroObject.style.setProperty("--rotate-y", `${x * 5}deg`);
      heroObject.style.transform = `translate3d(var(--pointer-x), calc(var(--pointer-y) + var(--scroll-shift, 0px)), 0) rotateX(var(--rotate-x)) rotateY(var(--rotate-y))`;
    });

    heroVisual.addEventListener("pointerleave", () => {
      heroObject.style.setProperty("--pointer-x", "0px");
      heroObject.style.setProperty("--pointer-y", "0px");
      heroObject.style.setProperty("--rotate-x", "0deg");
      heroObject.style.setProperty("--rotate-y", "0deg");
      heroObject.style.transform = "translate3d(0, var(--scroll-shift, 0px), 0) rotateX(0) rotateY(0)";
    });
  }

  // Lightweight custom cursor and magnetic controls for precise pointers only.
  const cursor = document.querySelector(".cursor");
  if (cursor && finePointer.matches && !prefersReducedMotion.matches) {
    let cursorX = -30;
    let cursorY = -30;
    let targetX = -30;
    let targetY = -30;

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX - 6;
      targetY = event.clientY - 6;
    });

    const renderCursor = () => {
      cursorX += (targetX - cursorX) * 0.2;
      cursorY += (targetY - cursorY) * 0.2;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      window.requestAnimationFrame(renderCursor);
    };
    renderCursor();

    document.querySelectorAll("a, button, input, textarea, select").forEach((item) => {
      item.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
      item.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
    });

    document.querySelectorAll(".magnetic").forEach((item) => {
      item.addEventListener("pointermove", (event) => {
        const bounds = item.getBoundingClientRect();
        const x = event.clientX - bounds.left - bounds.width / 2;
        const y = event.clientY - bounds.top - bounds.height / 2;
        item.style.transform = `translate3d(${x * 0.09}px, ${y * 0.09}px, 0)`;
      });
      item.addEventListener("pointerleave", () => {
        item.style.transform = "translate3d(0, 0, 0)";
      });
    });
  }

  // Accessible mobile navigation.
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "Open navigation";
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.classList.remove("is-open");
    body.classList.remove("menu-open");
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.querySelector(".sr-only").textContent = willOpen ? "Close navigation" : "Open navigation";
      mobileMenu.setAttribute("aria-hidden", String(!willOpen));
      mobileMenu.classList.toggle("is-open", willOpen);
      body.classList.toggle("menu-open", willOpen);
      if (willOpen) {
        header.classList.remove("is-hidden");
        mobileMenu.querySelector("a")?.focus({ preventScroll: true });
      }
    });

    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab" && body.classList.contains("menu-open")) {
        const focusable = [menuToggle, ...mobileMenu.querySelectorAll("a[href],button:not([disabled])")].filter(item => item.offsetParent !== null);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!focusable.includes(document.activeElement)) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === "Escape" && body.classList.contains("menu-open")) {
        closeMenu();
        menuToggle.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  // Capabilities behave like an accessible command deck: pointer users can
  // preview quickly, keyboard users can move through tabs, and the stage
  // advances gently when left untouched.
  const capabilityDeck = document.querySelector("[data-capability-deck]");
  if (capabilityDeck) {
    const capabilityTriggers = [...capabilityDeck.querySelectorAll("[data-capability-trigger]")];
    const capabilityPanels = [...capabilityDeck.querySelectorAll("[data-capability-panel]")];
    const capabilityPosition = capabilityDeck.querySelector("[data-capability-position]");
    let capabilityIndex = 0;
    let capabilityTimer = null;
    // These are rich editorial cards containing their own links, not ARIA tabs.
    capabilityDeck.removeAttribute("role");
    capabilityDeck.removeAttribute("aria-label");
    capabilityTriggers.forEach((trigger) => {
      trigger.removeAttribute("role");
      trigger.removeAttribute("aria-selected");
      trigger.removeAttribute("tabindex");
    });

    const showCapability = (nextIndex, moveFocus = false) => {
      capabilityIndex = (nextIndex + capabilityTriggers.length) % capabilityTriggers.length;
      capabilityTriggers.forEach((trigger, index) => {
        const isActive = index === capabilityIndex;
        trigger.classList.toggle("is-active", isActive);
        if (isActive && moveFocus) trigger.querySelector("a")?.focus();
      });
      capabilityPanels.forEach((panel, index) => {
        const isActive = index === capabilityIndex;
        panel.classList.toggle("is-active", isActive);
      });
      if (capabilityPosition) capabilityPosition.textContent = `${String(capabilityIndex + 1).padStart(2, "0")} / ${String(capabilityTriggers.length).padStart(2, "0")}`;
    };

    const stopCapabilityRotation = () => {
      if (capabilityTimer) window.clearInterval(capabilityTimer);
      capabilityTimer = null;
    };

    const startCapabilityRotation = () => {
      stopCapabilityRotation();
      if (prefersReducedMotion.matches) return;
      capabilityTimer = window.setInterval(() => showCapability(capabilityIndex + 1), 6200);
    };

    capabilityTriggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => {
        showCapability(index);
        startCapabilityRotation();
      });
      trigger.addEventListener("pointerenter", () => {
        if (finePointer.matches) showCapability(index);
      });
    });

    capabilityDeck.addEventListener("pointerenter", stopCapabilityRotation);
    capabilityDeck.addEventListener("pointerleave", startCapabilityRotation);
    capabilityDeck.addEventListener("focusin", stopCapabilityRotation);
    capabilityDeck.addEventListener("focusout", (event) => {
      if (!capabilityDeck.contains(event.relatedTarget)) startCapabilityRotation();
    });
    showCapability(0);
    startCapabilityRotation();
  }

  // Submit enquiries through PinkBook's existing production mail endpoint.
  document.querySelectorAll("[data-contact-form]").forEach((contactForm) => {
    const status = contactForm.querySelector(".form-status");
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const submitText = submitButton?.querySelector("span:first-child");
    const requiredFields = [...contactForm.querySelectorAll("[required]")];

    const errorFor = (field) => contactForm.querySelector(`#${field.id}-error`);
    const validateField = (field) => {
      const valid = field.checkValidity();
      field.classList.toggle("is-invalid", !valid);
      field.setAttribute("aria-invalid", String(!valid));
      const error = errorFor(field);
      if (error) {
        error.textContent = valid ? "" : field.validity.typeMismatch ? "Enter a valid email address." : "This field is required.";
        error.hidden = valid;
      }
      return valid;
    };

    requiredFields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); });
      field.addEventListener("change", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); });
    });

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const invalidFields = requiredFields.filter((field) => !validateField(field));
      if (invalidFields.length) {
        status.dataset.state = "error";
        status.textContent = "Please correct the highlighted fields and try again.";
        invalidFields[0].focus();
        return;
      }

      submitButton.disabled = true;
      contactForm.setAttribute("aria-busy", "true");
      status.dataset.state = "sending";
      status.textContent = "Sending your enquiry…";
      if (submitText) submitText.textContent = "Sending…";

      try {
        const data = Object.fromEntries(new FormData(contactForm).entries());
        data.source = contactForm.dataset.formSource || location.pathname;
        const local = ["localhost", "127.0.0.1"].includes(location.hostname);
        const response = await fetch(local ? "/send-message" : "/api/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) throw new Error("Enquiry service unavailable");
        contactForm.reset();
        requiredFields.forEach((field) => { field.classList.remove("is-invalid"); field.setAttribute("aria-invalid", "false"); const error = errorFor(field); if (error) { error.textContent = ""; error.hidden = true; } });
        status.dataset.state = "success";
        status.textContent = "Thanks! Your enquiry has been sent. We’ll be in touch within one business day.";
      } catch {
        status.dataset.state = "error";
        status.innerHTML = 'We could not send your enquiry. Please try again, email <a href="mailto:hello@pinkbooktechnologies.com">hello@pinkbooktechnologies.com</a>, or call <a href="tel:+919962499227">+91 99624 99227</a>.';
      } finally {
        submitButton.disabled = false;
        contactForm.removeAttribute("aria-busy");
        if (submitText) submitText.textContent = "Send enquiry";
      }
    });
  });

  // Portfolio category controls keep every project in the document while
  // providing a quick, keyboard-friendly way to narrow the visible set.
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const portfolioItems = [...document.querySelectorAll("[data-category]")];
  if (filterButtons.length && portfolioItems.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        portfolioItems.forEach((item) => {
          const categories = item.dataset.category.split(" ");
          item.hidden = filter !== "all" && !categories.includes(filter);
        });
      });
    });
  }

  // The homepage product index behaves like a compact editorial catalogue.
  // Filtering changes the layout as well as the visible product set.
  const projectFilterButtons = [...document.querySelectorAll("[data-project-filter]")];
  const projectCards = [...document.querySelectorAll("[data-project-card]")];
  const projectGallery = document.querySelector("[data-project-gallery]");
  if (projectFilterButtons.length && projectCards.length) {
    projectFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.projectFilter;
        projectFilterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        projectCards.forEach((card) => {
          card.hidden = filter !== "all" && card.dataset.projectType !== filter;
        });
        projectGallery?.classList.toggle("is-filtered", filter !== "all");
      });
    });
  }

  // The homepage keeps eight product stories inside one fixed-height stage.
  // It mirrors the service-card rhythm: select, preview, progress and continue.
  const productShowcase = document.querySelector("[data-product-showcase]");
  if (productShowcase && projectCards.length) {
    const productSelectors = [...productShowcase.querySelectorAll("[data-product-select]")];
    const productCounter = productShowcase.querySelector("[data-product-counter]");
    const productStatus = productShowcase.querySelector("[data-product-status]");
    const productProgress = productShowcase.querySelector("[data-product-progress]");
    const previousProduct = productShowcase.querySelector("[data-product-prev]");
    const nextProduct = productShowcase.querySelector("[data-product-next]");
    let activeProduct = 0;

    const productStatusLabels = [
      "Healthcare operations",
      "Connected campus",
      "Retail operations",
      "Food commerce & delivery",
      "Urban mobility",
      "Connected home",
      "Solar energy IoT",
      "Digital assessment",
    ];

    // Keep the chosen product in place; the workflow inside it supplies motion.
    const stopProductRotation = () => {};

    const showProduct = (nextIndex, moveFocus = false) => {
      activeProduct = (nextIndex + projectCards.length) % projectCards.length;
      projectCards.forEach((card, index) => {
        const selected = index === activeProduct;
        card.hidden = !selected;
        card.classList.toggle("is-active", selected);
      });
      productSelectors.forEach((button, index) => {
        const selected = index === activeProduct;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
        if (selected && moveFocus) button.focus();
      });
      if (productCounter) productCounter.textContent = `${String(activeProduct + 1).padStart(2, "0")} / ${String(projectCards.length).padStart(2, "0")}`;
      if (productStatus) productStatus.textContent = productStatusLabels[activeProduct] || "Product system";
      if (productProgress) productProgress.style.transform = `scaleX(${(activeProduct + 1) / projectCards.length})`;
    };

    productSelectors.forEach((button, index) => {
      button.addEventListener("click", () => {
        showProduct(index);
        stopProductRotation();
      });
      button.addEventListener("keydown", (event) => {
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? productSelectors.length - 1 : index + (["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 1);
        showProduct(nextIndex, true);
        stopProductRotation();
      });
    });

    previousProduct?.addEventListener("click", () => {
      showProduct(activeProduct - 1);
      stopProductRotation();
    });
    nextProduct?.addEventListener("click", () => {
      showProduct(activeProduct + 1);
      stopProductRotation();
    });
    productShowcase.addEventListener("pointerenter", stopProductRotation);
    productShowcase.addEventListener("focusin", stopProductRotation);

    showProduct(0);
  }

  // A restrained pointer tilt makes each software surface respond like a
  // physical product card. Motion is skipped for touch and reduced-motion users.
  const caseStudyCards = [...new Set([...projectCards, ...portfolioItems])];
  if (finePointer.matches && !prefersReducedMotion.matches) {
    caseStudyCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty("--case-rx", `${(-y * 3.2).toFixed(2)}deg`);
        card.style.setProperty("--case-ry", `${(x * 4.2).toFixed(2)}deg`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--case-rx", "0deg");
        card.style.setProperty("--case-ry", "0deg");
      });
    });
  }

  // Small simulated workflows make the product concepts understandable.
  // Only the visible product advances; no network or customer data is used.
  const demos = [
    { name: "Patient journey", ref: "OPD / 08241", steps: ["Checked in", "Vitals recorded", "Doctor ready", "Visit complete"], messages: ["Anitha V. checked in · Cardiology", "Vitals added to the patient record", "Consultation ready · Room 204", "Visit completed · Prescription ready"] },
    { name: "A day on campus", ref: "GRADE IX / A", steps: ["Check-in", "Attendance", "Class begins", "Parent update"], messages: ["Students arriving · Gate 01", "Attendance saved · 36 of 38 present", "Mathematics · Room 204 · 10:15", "Class update shared with parents"] },
    { name: "Checkout in motion", ref: "INVOICE / 1048", steps: ["Scan items", "Review bill", "Payment", "Stock updated"], messages: ["Rice, milk and tea added to the basket", "3 items · Total ₹540", "UPI payment received · ₹540", "Receipt ready · Inventory synchronised"] },
    { name: "Your order, on its way", ref: "ORDER / FD2841", steps: ["Confirmed", "Preparing", "On the way", "Delivered"], messages: ["Order accepted · 2 × Biryani", "Your meal is being prepared · 18 min", "Arun picked up your order · 8 min away", "Delivered at your door · Enjoy your meal!"] },
    { name: "From pickup to destination", ref: "TRIP / TN2048", steps: ["Ride booked", "Driver nearby", "On trip", "Arrived"], messages: ["Mini booked · Fare estimate ₹186", "Arun is approaching · Arrives in 3 min", "Trip started · Tenkasi New Bus Stand", "Destination reached · Trip complete"] },
    { name: "One tap. Home responds.", ref: "SCENE / EVENING", steps: ["Connect", "Lights on", "Set comfort", "Scene saved"], messages: ["Home hub connected · 6 devices online", "Living room lights dimmed to 65%", "Room temperature set to 24°C", "Evening scene active · All devices in sync"] },
    { name: "Energy as it happens", ref: "INVERTER / 01", steps: ["Generating", "Powering home", "Exporting", "Synced"], messages: ["Solar generation · 5.84 kW", "Home consumption · 2.10 kW", "Surplus exported · 3.74 kW", "Energy readings synced to your mobile"] },
    { name: "A confident exam journey", ref: "PHYSICS / TERM I", steps: ["Read", "Choose", "Save", "Next question"], messages: ["Question 19 · Electromagnetic induction", "Answer A selected", "Response saved · 19 of 30 answered", "Question 20 loaded · Progress retained"] }
  ];
  const demoCards = [...document.querySelectorAll("[data-product-showcase] [data-project-card]")];
  demoCards.forEach((card, index) => {
    const demo = demos[index];
    const activity = document.createElement("div");
    activity.className = "product-activity";
    activity.innerHTML = '<div class="activity-heading"><strong>' + demo.name + '</strong><span>' + demo.ref + '</span></div><div class="activity-track">' + demo.steps.map((step, i) => '<span class="' + (i === 0 ? 'is-current' : '') + '"><i>' + (i + 1) + '</i><b>' + step + '</b></span>').join('') + '</div><p class="activity-message">' + demo.messages[0] + '</p>';
    card.querySelector(".product-case__visual").append(activity);
    card.dataset.demoStep = "0";
    card.querySelectorAll(".product-screen__proof small").forEach(label => label.textContent = "PRODUCT CONCEPT");
  });
  const productMotionButton = document.querySelector("[data-product-motion]");
  let productMotionPaused = prefersReducedMotion.matches;
  let showcaseVisible = false;
  const syncProductMotion = () => {
    const paused = productMotionPaused || prefersReducedMotion.matches || !showcaseVisible || document.hidden;
    productShowcase?.classList.toggle("demo-paused", paused);
    if (productMotionButton) {
      productMotionButton.textContent = productMotionPaused ? "Play motion" : "Pause motion";
      productMotionButton.setAttribute("aria-pressed", String(productMotionPaused));
    }
  };
  productMotionButton?.addEventListener("click", () => {
    productMotionPaused = !productMotionPaused;
    syncProductMotion();
  });
  if (productShowcase) {
    new IntersectionObserver(entries => {
      showcaseVisible = entries[0].isIntersecting;
      syncProductMotion();
    }, { threshold: .1 }).observe(productShowcase);
  }
  const updateText = (card, selector, value) => {
    const el = card.querySelector(selector);
    if (el) el.textContent = value;
  };
  window.setInterval(() => {
    if (productMotionPaused || prefersReducedMotion.matches || !showcaseVisible || document.hidden) return;
    const index = demoCards.findIndex(card => !card.hidden);
    if (index < 0) return;
    const card = demoCards[index];
    const step = (Number(card.dataset.demoStep) + 1) % 4;
    card.dataset.demoStep = String(step);
    card.querySelectorAll(".activity-track>span").forEach((el, i) => {
      el.classList.toggle("is-current", i === step);
      el.classList.toggle("is-complete", i < step);
    });
    updateText(card, ".activity-message", demos[index].messages[step]);
    if (index === 0) updateText(card, ".hms-patient:first-of-type em", ["Waiting", "Vitals", "Ready", "Done"][step]);
    if (index === 1) updateText(card, ".school-mobile__card strong", ["Check-in", "Attendance saved", "Mathematics", "Parent update"][step]);
    if (index === 2) updateText(card, ".billing-receipt>strong", ["SCAN ITEMS", "REVIEW ₹540", "PAYMENT RECEIVED", "RECEIPT READY"][step]);
    if (index === 3) {
      updateText(card, ".food-phone>span", ["Order confirmed", "Preparing · 18 min", "Arriving in 8 min", "Delivered. Enjoy!"][step]);
      updateText(card, ".food-rider small", ["ORDER ACCEPTED", "AT THE RESTAURANT", "RIDER ON THE WAY", "ORDER DELIVERED"][step]);
    }
    if (index === 4) updateText(card, ".taxi-driver em", ["Booked", "03 min", "On trip", "Arrived"][step]);
    if (index === 5) updateText(card, ".product-device>strong", ["CONNECTED", "LIGHTS ON", "COMFORT SET", "EVENING SCENE"][step]);
    if (index === 6) updateText(card, ".solar-dashboard header span", ["GENERATING", "POWERING HOME", "EXPORTING 3.74 kW", "MOBILE SYNCED"][step]);
    if (index === 7) updateText(card, ".exam-ui main button", ["Choose an answer", "Answer A selected", "Response saved ✓", "Next question →"][step]);
  }, 2600);
  document.addEventListener("visibilitychange", syncProductMotion);
  prefersReducedMotion.addEventListener("change", () => {
    productMotionPaused = prefersReducedMotion.matches;
    syncProductMotion();
  });
  syncProductMotion();

  const atlasData = [
    ["THE FOUNDATION", "Strong underneath. Simple on the surface.", "Secure APIs, dependable data and cloud infrastructure that grows with your business.", ".NET / ASP.NET Core / C# / Azure Cloud / PostgreSQL / Redis / Docker", ["DATA", "PostgreSQL", "COMPUTE", ".NET", "DELIVERY", "Azure"]],
    ["THE EXPERIENCE", "Every screen. A natural next step.", "Native mobile apps and responsive web experiences that fit how people work, wherever they are.", "Android / Kotlin / iOS / Flutter / React / Next.js / TypeScript / Figma", ["INTERFACE", "React", "NATIVE", "Kotlin", "MOBILE", "iOS"]],
    ["THE INTELLIGENCE", "A clearer signal in your data.", "Useful automation, intelligent assistants and analytics built around decisions that matter.", "Python / Django / Agentic AI / PostgreSQL / MongoDB / GraphQL", ["CONTEXT", "Data", "REASONING", "Python", "OUTCOME", "AI"]],
    ["THE CONNECTION", "The physical world. Connected.", "Our IoT products bring devices, telemetry and mobile control together—from smart homes to solar monitoring.", "MQTT / IoT / Python / Kotlin / Azure Cloud / Firebase / Docker", ["DEVICE", "Sensors", "TRANSPORT", "MQTT", "CONTROL", "Mobile"]]
  ];
  document.querySelectorAll("[data-atlas-select]").forEach((button, index) => {
    button.addEventListener("click", () => {
      const data = atlasData[index];
      document.querySelectorAll("[data-atlas-select]").forEach(el => { el.classList.toggle("is-active", el === button); el.setAttribute("aria-pressed", String(el === button)); });
      document.querySelector("[data-atlas-mode]").dataset.atlasMode = String(index);
      ["label", "title", "copy", "tools"].forEach((key, i) => document.querySelector("[data-atlas-" + key + "]").textContent = data[i]);
      document.querySelectorAll(".atlas-plane").forEach((plane, i) => { plane.querySelector("span").textContent = data[4][i * 2]; plane.querySelector("b").textContent = data[4][i * 2 + 1]; });
    });
  });
  const deliveryData = [
    ["DISCOVER TOGETHER", "Clarity before complexity.", "Turn a broad ambition into a practical first move.", "The opportunity.", "One place for the work that matters.", "THE QUESTION", "What would make this easier?", ["Clear outcome", "Shared priorities", "Next step agreed"]],
    ["DESIGN & VALIDATE", "See it. Try it. Shape it.", "Click through the important journeys and refine them together.", "First impressions.", "A prototype made for real feedback.", "THE PROTOTYPE", "An idea you can get your hands on.", ["Journey mapped", "Screens connected", "Feedback captured"]],
    ["ENGINEER & REVIEW", "Progress you can open.", "Review working features together, with quality built into each cycle.", "Sprint in progress.", "Small releases. Visible progress.", "THE BUILD", "Working software, one useful step at a time.", ["API connected", "Tests passing", "Demo ready"]],
    ["LAUNCH & EVOLVE", "Ready for the real world.", "A careful release, a supported team and a clear path to improvement.", "Release ready.", "Your product is ready for its next chapter.", "THE RELEASE", "Out in the world. Built to keep growing.", ["Release verified", "Team onboarded", "Monitoring active"]]
  ];
  document.querySelectorAll("[data-delivery-select]").forEach((button, index) => {
    button.addEventListener("click", () => {
      const data = deliveryData[index];
      document.querySelectorAll("[data-delivery-select]").forEach(el => { el.classList.toggle("is-active", el === button); el.setAttribute("aria-pressed", String(el === button)); });
      document.querySelector("[data-delivery-mode]").dataset.deliveryMode = String(index);
      document.querySelector("[data-delivery-number]").textContent = String(index + 1).padStart(2, "0");
      ["delivery-label", "delivery-title", "delivery-copy", "sheet-title", "sheet-copy", "note-label", "note-title"].forEach((key, i) => document.querySelector("[data-" + key + "]").textContent = data[i]);
      document.querySelectorAll(".sheet-checks span").forEach((el, i) => el.textContent = "✓ " + data[7][i]);
    });
  });
  document.querySelectorAll("[data-motion-region]").forEach(region => {
    let paused = prefersReducedMotion.matches;
    let visible = false;
    const button = region.querySelector("[data-motion-toggle]");
    const sync = () => {
      region.classList.toggle("motion-paused", paused || !visible || document.hidden || prefersReducedMotion.matches);
      button.textContent = paused ? "Play motion" : "Pause motion";
      button.setAttribute("aria-pressed", String(paused));
    };
    button.addEventListener("click", () => { paused = !paused; sync(); });
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .1 }).observe(region);
    document.addEventListener("visibilitychange", sync);
    prefersReducedMotion.addEventListener("change", () => { paused = prefersReducedMotion.matches; sync(); });
    sync();
  });

  // The About-page mission and vision share one compact stage. Visitors choose
  // the view, and keyboard users can move between tabs with the arrow keys.
  const purposeV2Tabs = [...document.querySelectorAll("[data-purpose-v2-tab]")];
  const purposeV2Panels = [...document.querySelectorAll("[data-purpose-v2-panel]")];
  const activatePurposeV2 = (nextTab, moveFocus = false) => {
    const nextKey = nextTab.dataset.purposeV2Tab;
    purposeV2Tabs.forEach(tab => {
      const selected = tab === nextTab;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    purposeV2Panels.forEach(panel => {
      const selected = panel.dataset.purposeV2Panel === nextKey;
      panel.hidden = !selected;
      panel.classList.toggle("is-active", selected);
    });
    if (moveFocus) nextTab.focus();
  };
  purposeV2Tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activatePurposeV2(tab));
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const last = purposeV2Tabs.length - 1;
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? last : (index + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) + purposeV2Tabs.length) % purposeV2Tabs.length;
      activatePurposeV2(purposeV2Tabs[nextIndex], true);
    });
  });
  if (purposeV2Tabs.length) activatePurposeV2(purposeV2Tabs[0]);

  // Career stacks are a manual comparison; nothing advances while reading.
  const roleStackButtons = [...document.querySelectorAll("[data-role-stack]")];
  roleStackButtons.forEach(button => {
    button.addEventListener("click", () => {
      roleStackButtons.forEach(item => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
        document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
      });
    });
  });

  // Google receives no map request until the visitor explicitly loads it.
  const locationMap = document.querySelector("[data-location-map]");
  if (locationMap) {
    const loadButton = locationMap.querySelector("[data-map-load]");
    const hideButton = locationMap.querySelector("[data-map-hide]");
    const placeholder = locationMap.querySelector("[data-map-placeholder]");
    const mapStatus = document.querySelector("[data-map-status]");
    loadButton.addEventListener("click", () => {
      if (locationMap.querySelector("iframe")) return;
      const frame = document.createElement("iframe");
      frame.title = "Google Maps: PinkBook Technologies address in Tenkasi";
      frame.src = "https://www.google.com/maps?q=135%2F6%20South%20Car%20Street%20Anna%20Complex%20Tenkasi%20627811&output=embed";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      frame.allowFullscreen = true;
      placeholder.hidden = true;
      locationMap.append(frame);
      hideButton.hidden = false;
      hideButton.focus({ preventScroll: true });
      mapStatus.textContent = "Google Maps is enabled. If it cannot load, use the Open in Google Maps link. Confirm the exact entrance with us before visiting.";
    });
    hideButton.addEventListener("click", () => {
      locationMap.querySelector("iframe")?.remove();
      hideButton.hidden = true;
      placeholder.hidden = false;
      mapStatus.textContent = "Map closed. Closing the map does not erase information already received by Google.";
      loadButton.focus({ preventScroll: true });
    });
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
