/* ==========================================================================
   Stackly — contact.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* PRELOADER                                                           */
  /* ------------------------------------------------------------------ */
  const preloader    = document.getElementById("preloader");
  const progressBar  = document.getElementById("preloaderProgress");
  const letters      = document.querySelectorAll(".preloader__word span");

  document.body.classList.add("lock");

  const preloaderTL = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove("lock");
      ScrollTrigger.refresh();

     
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 60,
        disable: reduceMotion,
      });
    },
  });

  preloaderTL
    .to(letters, { opacity: 1, y: 0, duration: 0.5, stagger: 0.045, ease: "power3.out" })
    .to(progressBar, { width: "100%", duration: 1.1, ease: "power2.inOut" }, "<")
    .to(preloader, { yPercent: -100, duration: 0.9, ease: "power4.inOut", delay: 0.15 })
    .set(preloader, { display: "none" });

  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* ------------------------------------------------------------------ */
  /* NAV — background on scroll                                          */
  /* ------------------------------------------------------------------ */
  const nav = document.getElementById("siteNav");
  if (nav) {
    ScrollTrigger.create({
      start: 60,
      end: 99999,
      onUpdate: (self) => nav.classList.toggle("is-scrolled", self.scroll() > 60),
    });
  }

  /* Back to top button */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    ScrollTrigger.create({
      start: "top top-=600",
      onUpdate: (self) => backToTop.classList.toggle("is-visible", self.scroll() > 600),
    });
  }

  /* ------------------------------------------------------------------ */
  /* MOBILE MENU TOGGLE                                                   */
  /* ------------------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const opening = !mobileMenu.classList.contains("is-open");
      navToggle.classList.toggle("is-open", opening);
      mobileMenu.classList.toggle("is-open", opening);
      document.body.classList.toggle("lock", opening);
    });
    mobileMenu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        navToggle.classList.remove("is-open");
        mobileMenu.classList.remove("is-open");
        document.body.classList.remove("lock");
      })
    );
  }

  /* Close the full-screen menu if the viewport grows past the mobile
     breakpoint while it's open (rotate / resize) so scroll isn't left locked */
  if (navToggle && mobileMenu) {
    window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => {
      if (!e.matches) return;
      navToggle.classList.remove("is-open");
      mobileMenu.classList.remove("is-open");
      document.body.classList.remove("lock");
    });
  }

  /* ------------------------------------------------------------------ */
  /* CUSTOM CURSOR                                                        */
  /* ------------------------------------------------------------------ */
  const cursorDot = document.getElementById("cursorDot");
  if (cursorDot && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorDot.classList.add("is-active");
      gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.25, ease: "power2.out" });
    });
    document.querySelectorAll("a, button, .quick-card, .faq-item__q").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-big"));
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. FORM + MAP SPLIT REVEAL                                          */
  /* ------------------------------------------------------------------ */
  gsap.from(".reach__form-col", {
    y: 40, opacity: 0, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".reach", start: "top 78%" },
  });
  gsap.from(".reach__map-col", {
    y: 40, opacity: 0, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".reach", start: "top 78%" },
  });

  /* ------------------------------------------------------------------ */
  /* 4. GETTING HERE — card reveal                                       */
  /* ------------------------------------------------------------------ */
  gsap.from(".dir-card", {
    y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
    scrollTrigger: { trigger: ".directions__grid", start: "top 80%" },
  });

  /* ------------------------------------------------------------------ */
  /* 5. LIVE HOURS BADGE + TODAY HIGHLIGHT                                */
  /* ------------------------------------------------------------------ */
  const hoursSchedule = {
    0: { open: 9, close: 18 },   // Sun
    1: null,                     // Mon — closed
    2: { open: 10, close: 19 },
    3: { open: 10, close: 19 },
    4: { open: 10, close: 21 },
    5: { open: 10, close: 20 },
    6: { open: 9, close: 20 },
  };
  const now = new Date();
  const todayIndex = now.getDay();
  const hoursBadge = document.getElementById("hoursBadge");
  const hoursGrid = document.getElementById("hoursGrid");

  if (hoursGrid) {
    const todayRow = hoursGrid.querySelector(`li[data-day="${todayIndex}"]`);
    if (todayRow) todayRow.classList.add("is-today");
  }

  if (hoursBadge) {
    const today = hoursSchedule[todayIndex];
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const isOpen = today && currentHour >= today.open && currentHour < today.close;
    hoursBadge.classList.add(isOpen ? "is-open" : "is-closed");
    hoursBadge.lastChild.textContent = isOpen
      ? `Open now — until ${formatHour(today.close)}`
      : today
        ? currentHour < today.open
          ? `Closed — opens ${formatHour(today.open)} today`
          : `Closed for the day`
        : `Closed today`;
  }

  function formatHour(h) {
    const hour12 = h > 12 ? h - 12 : h;
    const suffix = h >= 12 ? "pm" : "am";
    return `${hour12}${suffix}`;
  }

  gsap.from("#hoursGrid li", {
    y: 24, opacity: 0, duration: 0.7, stagger: 0.06, ease: "power3.out",
    scrollTrigger: { trigger: "#hoursGrid", start: "top 85%" },
  });

  /* ------------------------------------------------------------------ */
  /* 6. FAQ ACCORDION                                                     */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-item__q");
    const panel = item.querySelector(".faq-item__a");
    if (!btn || !panel) return;

    gsap.set(panel, { height: item.classList.contains("is-open") ? "auto" : 0 });

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        if (openItem !== item) {
          const openPanel = openItem.querySelector(".faq-item__a");
          gsap.to(openPanel, { height: 0, duration: 0.4, ease: "power2.inOut" });
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-item__q").setAttribute("aria-expanded", "false");
        }
      });

      if (isOpen) {
        gsap.to(panel, { height: 0, duration: 0.4, ease: "power2.inOut" });
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      } else {
        gsap.set(panel, { height: "auto" });
        const target = panel.offsetHeight;
        gsap.fromTo(panel, { height: 0 }, { height: target, duration: 0.45, ease: "power2.inOut" });
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* 7. FINAL CTA REVEAL                                                  */
  /* ------------------------------------------------------------------ */
  gsap.from(".visit-cta__left, .visit-cta__right", {
    y: 40, opacity: 0, duration: 0.9, stagger: 0.15, ease: "power3.out",
    scrollTrigger: { trigger: ".visit-cta", start: "top 85%" },
  });

  /* ------------------------------------------------------------------ */
  /* CONTACT FORM — full per-field validation                           */
  /* ------------------------------------------------------------------ */
  const contactForm = document.getElementById("contactForm");
  const reachNote   = document.getElementById("reachNote");

  if (contactForm) {

    /* ---- helpers ---- */
    const rules = {
      cName:    { el: null, err: null,
        validate(v) {
          if (!v)              return "Please enter your name.";
          if (v.length < 2)   return "Name must be at least 2 characters.";
          if (!/^[a-zA-Z\s'-]+$/.test(v)) return "Name can only contain letters, spaces, hyphens or apostrophes.";
          return "";
        }
      },
      cPhone:   { el: null, err: null,
        validate(v) {
          if (!v)             return "Please enter your phone number.";
          if (!/^[+\d][\d\s\-().]{6,19}$/.test(v)) return "Enter a valid phone number (e.g. +91 98765 43210).";
          return "";
        }
      },
      cEmail:   { el: null, err: null,
        validate(v) {
          if (!v)             return "Please enter your email address.";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email (e.g. you@email.com).";
          return "";
        }
      },
      cReason:  { el: null, err: null,
        validate(v) {
          if (!v)             return "Please select a reason for reaching out.";
          return "";
        }
      },
      cMessage: { el: null, err: null,
        validate(v) {
          if (!v)             return "Please enter your message.";
          if (v.length < 10)  return "Message must be at least 10 characters.";
          return "";
        }
      },
    };

    /* cache DOM refs */
    Object.keys(rules).forEach((id) => {
      rules[id].el  = document.getElementById(id);
      rules[id].err = document.getElementById("err-" + id.replace("c", "").toLowerCase());
    });

    function showError(key, msg) {
      const { el, err } = rules[key];
      if (!el) return;
      el.closest(".reach-field").classList.add("has-error");
      el.setAttribute("aria-invalid", "true");
      if (err) { err.textContent = msg; err.classList.add("is-visible"); }
    }

    function clearError(key) {
      const { el, err } = rules[key];
      if (!el) return;
      el.closest(".reach-field").classList.remove("has-error");
      el.setAttribute("aria-invalid", "false");
      if (err) { err.textContent = ""; err.classList.remove("is-visible"); }
    }

    function validateField(key) {
      const { el, validate } = rules[key];
      if (!el) return true;
      const msg = validate(el.value.trim());
      if (msg) { showError(key, msg); return false; }
      clearError(key);
      return true;
    }

    /* live validation — clear error as soon as field becomes valid */
    Object.keys(rules).forEach((key) => {
      const { el } = rules[key];
      if (!el) return;
      const evt = (el.tagName === "SELECT") ? "change" : "input";
      el.addEventListener(evt, () => {
        if (el.closest(".reach-field").classList.contains("has-error")) {
          validateField(key);
        }
      });
      el.addEventListener("blur", () => validateField(key));
    });

    /* submit */
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const allValid = Object.keys(rules)
        .map((key) => validateField(key))
        .every(Boolean);

      if (!allValid) {
        /* scroll to first error */
        const firstErr = contactForm.querySelector(".reach-field.has-error input, .reach-field.has-error select, .reach-field.has-error textarea");
        if (firstErr) firstErr.focus();
        return;
      }

      // Store flag so form resets when user returns from 404
      sessionStorage.setItem("contactFormSubmitted", "1");
      window.location.href = "404.html";
    });

    // Reset form if returning from 404 (normal navigation)
    function resetContactForm() {
      if (sessionStorage.getItem("contactFormSubmitted")) {
        sessionStorage.removeItem("contactFormSubmitted");
        contactForm.reset();
        Object.keys(rules).forEach((key) => clearError(key));
        if (reachNote) {
          reachNote.textContent = "";
          reachNote.classList.remove("is-success");
        }
      }
    }

    resetContactForm();

    // Also handles bfcache restore (browser back button)
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) resetContactForm();
    });
  }

  /* ------------------------------------------------------------------ */
  /* NEWSLETTER FORM (footer)                                             */
  /* ------------------------------------------------------------------ */
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    const emailInput = newsletterForm.querySelector("input");
    const errorMsg = document.getElementById("newsletterError") || newsletterForm.querySelector(".footer__error");

    function resetNewsletterForm() {
      if (sessionStorage.getItem("newsletterSubmitted")) {
        sessionStorage.removeItem("newsletterSubmitted");
        newsletterForm.reset();
        if (emailInput) emailInput.classList.remove("is-invalid");
        if (errorMsg) {
          errorMsg.classList.remove("is-visible");
          errorMsg.textContent = "";
        }
      }
    }

    // Runs on normal navigation
    resetNewsletterForm();

    // Runs when the browser restores the page from bfcache (back/forward)
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) resetNewsletterForm();
    });

    const clearError = () => {
      if (emailInput) emailInput.classList.remove("is-invalid");
      if (errorMsg) {
        errorMsg.classList.remove("is-visible");
        errorMsg.textContent = "";
      }
    };

    if (emailInput) {
      emailInput.addEventListener("input", clearError);
    }

    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = emailInput ? emailInput.value.trim() : "";
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!val) {
        if (emailInput) emailInput.classList.add("is-invalid");
        if (errorMsg) {
          errorMsg.textContent = "Please enter your email address.";
          errorMsg.classList.add("is-visible");
        }
        if (emailInput) emailInput.focus();
        return;
      }

      if (!emailPattern.test(val)) {
        if (emailInput) emailInput.classList.add("is-invalid");
        if (errorMsg) {
          errorMsg.textContent = "Please enter a valid email (e.g. you@email.com).";
          errorMsg.classList.add("is-visible");
        }
        if (emailInput) emailInput.focus();
        return;
      }

      // Store flag so the form resets when the user returns from 404
      sessionStorage.setItem("newsletterSubmitted", "1");
      window.location.href = "404.html";
    });
  }

  /* ------------------------------------------------------------------ */
  /* SMOOTH ANCHOR SCROLL (offset for fixed nav)                         */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const destY = target.getBoundingClientRect().top + window.scrollY - 90;
      const startY = window.scrollY;
      const distance = destY - startY;
      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        duration: 1,
        ease: "power3.inOut",
        onUpdate: () => window.scrollTo(0, startY + distance * state.p),
      });
    });
  });
});