/* ==========================================================================
   Stackly — about.js
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
  /* PRELOADER + MASTHEAD INTRO                                          */
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
    },
  });

  introTL
    .to(letters, { opacity: 1, y: 0, duration: 0.5, stagger: 0.045, ease: "power3.out" })
    .to(ringCircle, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, "<")
    .to(progressBar, { width: "100%", duration: 1.1, ease: "power2.inOut" }, "<")
    .to(preloader, { yPercent: -100, duration: 0.9, ease: "power4.inOut", delay: 0.15 })
    .set(preloader, { display: "none" })
    .from(".abt-hero .section-eyebrow, .abt-hero__line", {
      y: 34,
      opacity: 0,
      duration: 0.85,
      stagger: 0.09,
      ease: "power3.out",
    }, "-=0.45")
    .from(".abt-hero__lede p, .abt-hero__jump", {
      y: 20,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
    }, "-=0.5")
    .from(".abt-hero__shot--a", { scale: 0.86, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.9")
    .from(".abt-hero__shot--b", { x: -30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.65")
    .from(".abt-hero__shot--c", { scale: 0.6, opacity: 0, duration: 0.7, ease: "back.out(1.7)" }, "-=0.5")
    .from(".abt-hero__stamp", { scale: 0, rotation: -60, opacity: 0, duration: 0.7, ease: "back.out(2)" }, "-=0.45");

  /* Slow drift on the collage while the masthead scrolls away */
  if (!reduceMotion) {
    gsap.to(".abt-hero__shot--b", {
      y: -34,
      ease: "none",
      scrollTrigger: { trigger: ".abt-hero", start: "top top", end: "bottom top", scrub: 1 },
    });
    gsap.to(".abt-hero__stamp", {
      rotation: 28,
      ease: "none",
      scrollTrigger: { trigger: ".abt-hero", start: "top top", end: "bottom top", scrub: 1 },
    });
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
    navToggle.addEventListener("click", () => {
      const opening = !mobileMenu.classList.contains("is-open");
      navToggle.classList.toggle("is-open", opening);
      mobileMenu.classList.toggle("is-open", opening);
      document.body.classList.toggle("lock", opening);
    });

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
    $$("a, button, .abt-person, .abt-chapter__img").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-big"));
    });
  }

  /* ------------------------------------------------------------------ */
  /* SECTION HEAD REVEALS                                                */
  /* ------------------------------------------------------------------ */
  [
    ".abt-story__head",
    ".abt-principles__head",
    ".abt-people__head",
    ".abt-space__sticky .section-title",
    ".abt-close__press .section-eyebrow",
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
  /* STORY — rail draws as you scroll, chapters light up in turn         */
  /* ------------------------------------------------------------------ */
  const timeline = $("#abtTimeline");
  const rail = $("#abtRail");

  if (timeline && rail) {
    gsap.to(rail, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: timeline,
        start: "top 70%",
        end: "bottom 72%",
        scrub: 0.6,
      },
    });
  }

  $$(".abt-chapter").forEach((chapter, i) => {
    ScrollTrigger.create({
      trigger: chapter,
      start: "top 72%",
      end: "bottom 40%",
      onEnter: () => chapter.classList.add("is-live"),
      onEnterBack: () => chapter.classList.add("is-live"),
      onLeave: () => chapter.classList.remove("is-live"),
      onLeaveBack: () => chapter.classList.remove("is-live"),
    });

    const fromLeft = i % 2 === 0;
    gsap.from(chapter.querySelector(".abt-chapter__body"), {
      x: window.innerWidth > 960 ? (fromLeft ? -40 : 40) : -24,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: chapter, start: "top 85%" },
    });
    gsap.from(chapter.querySelector(".abt-chapter__img"), {
      y: 40,
      opacity: 0,
      scale: 0.96,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: chapter, start: "top 85%" },
    });
  });

  /* ------------------------------------------------------------------ */
  /* PRINCIPLES — expanding panels (one open at a time)                  */
  /* ------------------------------------------------------------------ */
  const panels = $$(".abt-panel");

  function openPanel(panel) {
    panels.forEach((p) => {
      const on = p === panel;
      p.classList.toggle("is-open", on);
      $(".abt-panel__btn", p).setAttribute("aria-expanded", String(on));
    });
    gsap.fromTo(
      $(".abt-panel__content", panel),
      { y: 18 },
      { y: 0, duration: 0.6, ease: "power3.out" }
    );
  }

  panels.forEach((panel) => {
    const btn = $(".abt-panel__btn", panel);
    btn.addEventListener("click", () => openPanel(panel));
    /* Desktop: hovering a closed panel opens it too */
    panel.addEventListener("mouseenter", () => {
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && window.innerWidth > 960) {
        openPanel(panel);
      }
    });
  });

  if (panels.length) {
    gsap.from(panels, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: "#abtPanels", start: "top 85%" },
    });
  }

  /* ------------------------------------------------------------------ */
  /* NUMBERS — counters                                                  */
  /* ------------------------------------------------------------------ */
  $$(".abt-num__val").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        const counter = { val: 0 };
        gsap.to(counter, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.floor(counter.val).toLocaleString();
          },
        });
      },
    });
  });

  /* ------------------------------------------------------------------ */
  /* PEOPLE — staggered rise                                             */
  /* ------------------------------------------------------------------ */
  const people = $$(".abt-person");
  if (people.length) {
    gsap.from(people, {
      y: 56,
      opacity: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".abt-people__grid", start: "top 85%" },
    });
  }

  /* ------------------------------------------------------------------ */
  /* INSIDE THE HOUSE — gentle parallax on the image column              */
  /* ------------------------------------------------------------------ */
  $$(".abt-space__fig").forEach((fig, i) => {
    gsap.from(fig, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: fig, start: "top 88%" },
    });

    if (!reduceMotion && window.innerWidth > 640) {
      gsap.to($("img", fig), {
        yPercent: i % 2 ? 6 : -6,
        ease: "none",
        scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: 1 },
      });
    }
  });

  /* ------------------------------------------------------------------ */
  /* PRESS + JOIN PANEL                                                  */
  /* ------------------------------------------------------------------ */
  const press = $$(".abt-press li");
  if (press.length) {
    gsap.from(press, {
      x: -20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.09,
      ease: "power3.out",
      scrollTrigger: { trigger: ".abt-press", start: "top 88%" },
    });
  }

  const joinPanel = $(".abt-close__join");
  if (joinPanel) {
    gsap.from(joinPanel, {
      y: 48,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: joinPanel, start: "top 88%" },
    });
  }

  /* ------------------------------------------------------------------ */
  /* NEWSLETTER — text validation + 404 redirect                        */
  /* ------------------------------------------------------------------ */
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

  /* Re-measure after a resize settles */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
  });
});