/* ==========================================================================
   Stackly — services.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  /* Images shift layout after DOMContentLoaded — recalc trigger offsets. */
  window.addEventListener("load", () => ScrollTrigger.refresh());

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ------------------------------------------------------------------ */
  /* AOS                                                                 */
  /* ------------------------------------------------------------------ */
  AOS.init({
    duration: 800,
    easing: "ease-out-cubic",
    once: true,
    offset: 60,
    disable: reduceMotion,
  });

  /* ------------------------------------------------------------------ */
  /* PRELOADER + PAGE INTRO                                              */
  /* ------------------------------------------------------------------ */
  const preloader = $("#preloader");
  const progressBar = $("#preloaderProgress");
  const ringCircle = $(".preloader__ring circle");
  const letters = $$(".preloader__word span");

  document.body.classList.add("lock");

  const introTL = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove("lock");
      ScrollTrigger.refresh();
      startRotor();
    },
  });

  introTL
    .to(letters, { opacity: 1, y: 0, duration: 0.5, stagger: 0.045, ease: "power3.out" })
    .to(ringCircle, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, "<")
    .to(progressBar, { width: "100%", duration: 1.1, ease: "power2.inOut" }, "<")
    .to(preloader, { yPercent: -100, duration: 0.9, ease: "power4.inOut", delay: 0.15 })
    .set(preloader, { display: "none" })
    .from(".svc-hero__crumb, .svc-hero__eyebrow", {
      y: 16, opacity: 0, duration: 0.6, stagger: 0.07, ease: "power3.out",
    }, "-=0.4")
    .from(".svc-hero__line, .svc-hero__desc, .svc-hero__actions", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
    }, "-=0.45")
    .from(".svc-hero__chips", { y: 16, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
    .from(".svc-hero__card", { y: 44, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.7")
    .from(".svc-hero__facts li", { x: 18, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.5");

  /* ------------------------------------------------------------------ */
  /* HERO — rotating word                                                */
  /* ------------------------------------------------------------------ */
  const rotor = $("#svcRotor");
  function startRotor() {
    if (!rotor || reduceMotion) return;
    const items = rotor.children.length;
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power3.inOut" } });
    for (let i = 1; i <= items; i++) {
      tl.to(rotor, { yPercent: (-100 / items) * i, duration: 0.7 }, "+=1.8");
    }
    tl.set(rotor, { yPercent: 0 });
  }

  /* ------------------------------------------------------------------ */
  /* NAV — background on scroll + back to top                            */
  /* ------------------------------------------------------------------ */
  const nav = $("#siteNav");
  const backToTop = $("#backToTop");
  ScrollTrigger.create({
    start: 0,
    end: 99999,
    onUpdate: (self) => {
      const y = self.scroll();
      if (nav) nav.classList.toggle("is-scrolled", y > 60);
      if (backToTop) backToTop.classList.toggle("is-visible", y > 600);
    },
  });

  /* ------------------------------------------------------------------ */
  /* MOBILE MENU                                                         */
  /* ------------------------------------------------------------------ */
  const navToggle = $("#navToggle");
  const mobileMenu = $("#mobileMenu");

  if (navToggle && mobileMenu) {
    // services.html also loads script.js, which binds the same toggle. Binding
    // twice made one click open *and* immediately close the menu.
    if (!navToggle.dataset.menuBound) {
    navToggle.dataset.menuBound = "1";
    navToggle.addEventListener("click", () => {
      const opening = !mobileMenu.classList.contains("is-open");
      navToggle.classList.toggle("is-open", opening);
      mobileMenu.classList.toggle("is-open", opening);
      document.body.classList.toggle("lock", opening);
    });
    }

    $$("a", mobileMenu).forEach((link) =>
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
  /* CUSTOM CURSOR                                                       */
  /* ------------------------------------------------------------------ */
  const cursorDot = $("#cursorDot");
  if (cursorDot && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorDot.classList.add("is-active");
      gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.25, ease: "power2.out" });
    });
    $$("a, button, .svc-row-item, .svc-plan").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-big"));
    });
  }

  /* ------------------------------------------------------------------ */
  /* SECTION HEAD REVEALS                                                */
  /* ------------------------------------------------------------------ */
  [
    ".svc-cats__head",
    ".svc-menu__head",
    ".svc-flow__steps .section-title",
    ".svc-plans__head",
    ".svc-faq__head",
  ].forEach((sel) => {
    const el = $(sel);
    if (!el) return;
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
  });

  /* ------------------------------------------------------------------ */
  /* DISCIPLINE ROWS — reveal + filter                                  */
  /* ------------------------------------------------------------------ */
  const grid = $("#svcGrid");
  const emptyNote = $("#svcEmpty");
  const tiles = $$(".svc-row-item");

  if (tiles.length) {
    gsap.from(tiles, {
      y: 32,
      opacity: 0,
      duration: 0.7,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: { trigger: grid, start: "top 85%" },
    });
  }

  $$(".svc-filter__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".svc-filter__btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filter = btn.dataset.filter;
      let shown = 0;

      tiles.forEach((tile) => {
        const match = filter === "all" || tile.dataset.cat === filter;
        if (match) {
          shown++;
          tile.classList.remove("is-hidden");
          gsap.fromTo(
            tile,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
          );
        } else {
          gsap.to(tile, {
            opacity: 0,
            y: -10,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => tile.classList.add("is-hidden"),
          });
        }
      });

      if (emptyNote) emptyNote.classList.toggle("is-shown", shown === 0);
      ScrollTrigger.refresh();
    });
  });

  /* ------------------------------------------------------------------ */
  /* PRICE LIST — accordion rows (one open at a time)                    */
  /* ------------------------------------------------------------------ */
  const rows = $$(".svc-row");

  function closeRow(row) {
    const panel = $(".svc-row__panel", row);
    row.classList.remove("is-open");
    $(".svc-row__head", row).setAttribute("aria-expanded", "false");
    gsap.to(panel, { height: 0, duration: 0.45, ease: "power3.inOut" });
  }

  function openRow(row) {
    const panel = $(".svc-row__panel", row);
    const inner = $(".svc-row__panel-in", row);
    row.classList.add("is-open");
    $(".svc-row__head", row).setAttribute("aria-expanded", "true");
    gsap.to(panel, {
      height: inner.offsetHeight,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => gsap.set(panel, { height: "auto" }),
    });
    gsap.from(inner, { y: 14, opacity: 0, duration: 0.5, ease: "power3.out", delay: 0.08 });
  }

  rows.forEach((row) => {
    $(".svc-row__head", row).addEventListener("click", () => {
      const isOpen = row.classList.contains("is-open");
      rows.forEach((r) => r.classList.contains("is-open") && closeRow(r));
      if (!isOpen) openRow(row);
    });
  });

  /* Rows slide in from the left as the list scrolls into view */
  if (rows.length) {
    gsap.from(rows, {
      x: -24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: { trigger: "#svcMenu", start: "top 85%" },
    });
  }

  /* ------------------------------------------------------------------ */
  /* ADD-ONS MARQUEE — seamless loop                                     */
  /* ------------------------------------------------------------------ */
  const marquee = $("#svcMarquee");
  if (marquee && !reduceMotion) {
    marquee.innerHTML += marquee.innerHTML; // duplicate for a seamless wrap
    gsap.to(marquee, { xPercent: -50, duration: 26, ease: "none", repeat: -1 });
  }

  /* ------------------------------------------------------------------ */
  /* APPOINTMENT FLOW — sticky visual swaps with the active step         */
  /* ------------------------------------------------------------------ */
  const steps = $$(".svc-step");
  const flowImgs = $$(".svc-flow__stack img");
  const flowCount = $("#svcFlowCount");

  function setStep(n) {
    steps.forEach((s) => s.classList.toggle("is-active", s.dataset.step === String(n)));
    flowImgs.forEach((img) => img.classList.toggle("is-active", img.dataset.step === String(n)));
    if (flowCount) flowCount.textContent = String(n).padStart(2, "0");
  }

  steps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: "top 72%",
      end: "bottom 28%",
      onEnter: () => setStep(step.dataset.step),
      onEnterBack: () => setStep(step.dataset.step),
    });

    gsap.from(step, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: { trigger: step, start: "top 90%" },
    });
  });
  setStep(1);

  /* ------------------------------------------------------------------ */
  /* MEMBERSHIP CARDS — staggered rise                                   */
  /* ------------------------------------------------------------------ */
  const plans = $$(".svc-plan");
  if (plans.length) {
    gsap.from(plans, {
      y: 52,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: ".svc-plans__grid", start: "top 85%" },
    });
  }

  /* ------------------------------------------------------------------ */
  /* FAQ — accordion                                                     */
  /* ------------------------------------------------------------------ */
  $$(".svc-faq__item").forEach((item) => {
    const q = $(".svc-faq__q", item);
    const a = $(".svc-faq__a", item);
    const inner = a.firstElementChild;

    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      $$(".svc-faq__item.is-open").forEach((open) => {
        open.classList.remove("is-open");
        $(".svc-faq__q", open).setAttribute("aria-expanded", "false");
        gsap.to($(".svc-faq__a", open), { height: 0, duration: 0.4, ease: "power3.inOut" });
      });

      if (isOpen) return;

      item.classList.add("is-open");
      q.setAttribute("aria-expanded", "true");
      gsap.to(a, {
        height: inner.offsetHeight,
        duration: 0.45,
        ease: "power3.inOut",
        onComplete: () => gsap.set(a, { height: "auto" }),
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* BOOKING FORM — full per-field validation                             */
  /* ------------------------------------------------------------------ */
  const bookForm = $("#bookForm");
  const bookConfirm = $("#bookConfirm");

  if (bookForm) {
    const rules = {
      bookName: {
        validate(v) {
          if (!v) return "Please enter your name.";
          if (v.length < 2) return "Name must be at least 2 characters.";
          return "";
        },
      },
      bookPhone: {
        validate(v) {
          if (!v) return "Please enter your phone number.";
          if (!/^[+\d][\d\s\-().]{6,19}$/.test(v)) return "Enter a valid phone number.";
          return "";
        },
      },
      bookService: {
        validate(v) {
          if (!v) return "Please choose a service.";
          return "";
        },
      },
      bookDate: {
        validate(v) {
          if (!v) return "Please pick a preferred date.";
          if (new Date(v) < new Date(new Date().toDateString())) return "Please choose a future date.";
          return "";
        },
      },
      bookTime: {
        validate(v) {
          if (!v) return "Please choose a preferred time.";
          return "";
        },
      },
    };

    function showErr(id, msg) {
      const field = bookForm.querySelector(`#field-${id}`);
      const errEl = $(`#err-${id}`);
      if (field) field.classList.add("has-error");
      if (errEl) { errEl.textContent = msg; errEl.classList.add("is-visible"); }
    }

    function clearErr(id) {
      const field = bookForm.querySelector(`#field-${id}`);
      const errEl = $(`#err-${id}`);
      if (field) field.classList.remove("has-error");
      if (errEl) { errEl.textContent = ""; errEl.classList.remove("is-visible"); }
    }

    function validateField(id) {
      const el = $(`#${id}`);
      if (!el) return true;
      const msg = rules[id].validate(el.value.trim());
      if (msg) { showErr(id, msg); return false; }
      clearErr(id);
      return true;
    }

    /* Live validation — clear error as user fixes it */
    Object.keys(rules).forEach((id) => {
      const el = $(`#${id}`);
      if (!el) return;
      const evt = (el.tagName === "SELECT") ? "change" : "input";
      el.addEventListener(evt, () => {
        if (bookForm.querySelector(`#field-${id}`)?.classList.contains("has-error")) {
          validateField(id);
        }
      });
      el.addEventListener("blur", () => validateField(id));
    });

    bookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const allValid = Object.keys(rules).map(validateField).every(Boolean);
      if (!allValid) {
        const firstErr = bookForm.querySelector(".book__field.has-error input, .book__field.has-error select");
        if (firstErr) firstErr.focus();
        return;
      }
      sessionStorage.setItem("bookingSubmitted", "1");
      window.location.href = "404.html";
    });

    window.addEventListener("pageshow", (e) => {
      if (e.persisted && sessionStorage.getItem("bookingSubmitted")) {
        sessionStorage.removeItem("bookingSubmitted");
        bookForm.reset();
        Object.keys(rules).forEach(clearErr);
      }
    });
  }

  const newsletterForm = $("#newsletterForm");
  if (newsletterForm) {
    const emailInput = $("input", newsletterForm);
    const errorMsg = $("#newsletterError") || $(".footer__error", newsletterForm);

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
  /* SMOOTH ANCHOR SCROLL (offset for the fixed nav)                     */
  /* ------------------------------------------------------------------ */
  $$('a[href^="#"]').forEach((link) => {
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

  /* Re-measure open panels when the viewport changes width */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
  });
});