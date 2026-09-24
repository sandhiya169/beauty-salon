/* ==========================================================================
   Stackly — script.js
   Preloader → GSAP hero intro → ScrollTrigger reveals → pinned ritual scroll
   → animated counters → auto-scrolling gallery → testimonial carousel → nav/menu
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  /* Recalculate ScrollTrigger positions once all images have finished
     loading — large hero/service/gallery images shift page layout after
     DOMContentLoaded fires, which can throw off trigger offsets. */
  window.addEventListener("load", () => ScrollTrigger.refresh());

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* AOS init                                                            */
  /* ------------------------------------------------------------------ */
  AOS.init({
    duration: 800,
    easing: "ease-out-cubic",
    once: true,
    offset: 60,
    disable: reduceMotion,
  });

  /* ------------------------------------------------------------------ */
  /* PRELOADER + HERO INTRO                                              */
  /* ------------------------------------------------------------------ */
  const preloader = document.getElementById("preloader");
  const progressBar = document.getElementById("preloaderProgress");
  const ringCircle = document.querySelector(".preloader__ring circle");
  const letters = document.querySelectorAll(".preloader__word span");

  document.body.classList.add("lock");

  const introTL = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove("lock");
      ScrollTrigger.refresh();
    },
  });

  introTL
    .to(letters, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.045,
      ease: "power3.out",
    })
    .to(
      ringCircle,
      { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" },
      "<"
    )
    .to(progressBar, { width: "100%", duration: 1.1, ease: "power2.inOut" }, "<")
    .to(preloader, {
      yPercent: -100,
      duration: 0.9,
      ease: "power4.inOut",
      delay: 0.15,
    })
    .set(preloader, { display: "none" })
    .from(
      ".hh__eyebrow, .hh__title-line, .hh__desc, .hh__actions",
      {
        y: 26,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
      },
      "-=0.5"
    )
    .from(
      ".hh__arch",
      { y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" },
      "-=0.8"
    )
    .from(
      ".hh__seal",
      { scale: 0, opacity: 0, duration: 0.6, ease: "back.out(2)" },
      "-=0.4"
    )
    .from(".hh__strip", { y: 24, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.5");

  /* ------------------------------------------------------------------ */
  /* NAV — background on scroll + active link                            */
  /* ------------------------------------------------------------------ */
  const nav = document.getElementById("siteNav");
  ScrollTrigger.create({
    start: 60,
    end: 99999,
    onUpdate: (self) => {
      nav.classList.toggle("is-scrolled", self.scroll() > 60);
    },
  });

  /* Back to top button */
  const backToTop = document.getElementById("backToTop");
  ScrollTrigger.create({
    start: "top top-=600",
    onUpdate: (self) => {
      backToTop.classList.toggle("is-visible", self.scroll() > 600);
    },
  });

  /* ------------------------------------------------------------------ */
  /* MOBILE MENU TOGGLE                                                   */
  /* ------------------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  function closeMenu() {
    navToggle.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("lock");
  }

  // Bind once only (services.html loads both this file and services.js)
  if (!navToggle.dataset.menuBound) {
    navToggle.dataset.menuBound = "1";
    navToggle.addEventListener("click", () => {
      const opening = !mobileMenu.classList.contains("is-open");
      navToggle.classList.toggle("is-open", opening);
      mobileMenu.classList.toggle("is-open", opening);
      document.body.classList.toggle("lock", opening);
    });
  }

  mobileMenu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", closeMenu)
  );

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
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorDot.classList.add("is-active");
      gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.25, ease: "power2.out" });
    });
    document.querySelectorAll("a, button, .svc-line").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-big"));
    });
  }

  /* ------------------------------------------------------------------ */
  /* SCROLL REVEALS — generic section fade/slide-ins via GSAP            */
  /* ------------------------------------------------------------------ */
  const revealTargets = [
    { sel: ".philosophy__visual", y: 40 },
    { sel: ".philosophy__content > .section-eyebrow", y: 24 },
    { sel: ".philosophy__content > .section-title", y: 24 },
    { sel: ".services__head", y: 24 },
    { sel: ".gallery__head", y: 24 },
    { sel: ".testimonials__head", y: 24 },
    { sel: ".team__head", y: 24 },
    { sel: ".book__title", y: 24 },
    { sel: ".stats__item", y: 24, stagger: true },
  ];

  revealTargets.forEach(({ sel, y, stagger }) => {
    const els = document.querySelectorAll(sel);
    if (!els.length) return;
    gsap.from(els, {
      y,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: stagger ? 0.12 : 0,
      scrollTrigger: {
        trigger: els[0].closest("section") || els[0],
        start: "top 82%",
      },
    });
  });

  /* ------------------------------------------------------------------ */
  /* SIGNATURE RITUAL — pinned horizontal scroll                         */
  /* ------------------------------------------------------------------ */
  const ritualTrack = document.getElementById("ritualTrack");
  if (ritualTrack && window.innerWidth > 760) {
    const getScrollAmount = () =>
      ritualTrack.scrollWidth - document.querySelector(".ritual__pin").offsetWidth + 80;

    let scrollTween = gsap.to(ritualTrack, {
      x: () => -getScrollAmount(),
      ease: "none",
      scrollTrigger: {
        trigger: ".ritual",
        start: "top top",
        end: () => "+=" + getScrollAmount() * 1.15,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* SERVICE ROWS — subtle stagger reveal                                */
  /* ------------------------------------------------------------------ */
  gsap.from(".svc-line", {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".services__list",
      start: "top 85%",
    },
  });

  /* ------------------------------------------------------------------ */
  /* ANIMATED COUNTERS                                                    */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll(".stats__num").forEach((el) => {
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
  /* GALLERY — continuous auto-scroll strip (CSS marquee)                */
  /* ------------------------------------------------------------------ */
  const galleryTrack = document.getElementById("galleryTrack");
  if (galleryTrack) {
    /* Parallax float on gallery images while scrolling into view */
    gsap.utils.toArray(".gallery__item").forEach((item, i) => {
      gsap.from(item, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 95%",
          containerAnimation: undefined,
        },
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* TESTIMONIAL SLIDE ROTATOR                                           */
  /* ------------------------------------------------------------------ */
  const testiSlides = document.querySelectorAll(".testi-slide");
  const testiDots   = document.querySelectorAll(".testi-dot");
  const prevBtn     = document.getElementById("testiPrev");
  const nextBtn     = document.getElementById("testiNext");
  let testiIndex    = 0;
  let testiTimer;

  function goToSlide(n) {
    testiSlides.forEach(s => s.classList.remove("is-active"));
    testiDots.forEach(d => d.classList.remove("is-active"));
    testiIndex = (n + testiSlides.length) % testiSlides.length;
    testiSlides[testiIndex].classList.add("is-active");
    if (testiDots[testiIndex]) testiDots[testiIndex].classList.add("is-active");
  }

  function resetTimer() {
    clearInterval(testiTimer);
    testiTimer = setInterval(() => goToSlide(testiIndex + 1), 6000);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => { goToSlide(testiIndex - 1); resetTimer(); });
    nextBtn.addEventListener("click", () => { goToSlide(testiIndex + 1); resetTimer(); });
  }

  testiDots.forEach(dot => {
    dot.addEventListener("click", () => {
      goToSlide(parseInt(dot.dataset.index));
      resetTimer();
    });
  });

  resetTimer();

  /* ------------------------------------------------------------------ */
  /* TEAM ACCORDION                                                      */
  /* ------------------------------------------------------------------ */
  const teamRows = document.querySelectorAll(".team-row");
  
  if (teamRows.length > 0) {
    teamRows.forEach(row => {
      const trigger = row.querySelector(".team-row__trigger");
      const panel = row.querySelector(".team-row__panel");
      
      trigger.addEventListener("click", () => {
        const isOpen = row.getAttribute("data-open") === "true";
        
        // Close all rows
        teamRows.forEach(r => {
          r.setAttribute("data-open", "false");
          const rTrigger = r.querySelector(".team-row__trigger");
          const rPanel = r.querySelector(".team-row__panel");
          if (rTrigger) rTrigger.setAttribute("aria-expanded", "false");
          if (rPanel) rPanel.hidden = true;
        });
        
        // If it wasn't open, open it
        if (!isOpen) {
          row.setAttribute("data-open", "true");
          trigger.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* BOOKING FORM — front-end only confirmation                          */
  /* ------------------------------------------------------------------ */
  const bookForm = document.getElementById("bookForm");
  const bookNote = document.getElementById("bookNote");
  
  if (bookForm) {
    // Disable native validation tooltips to use custom logic if desired, 
    // or just rely on them. We'll rely on native 'required' but add custom handling.
    
    // Clear custom error styling on input
    const inputs = bookForm.querySelectorAll("input, select, textarea");
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        input.closest(".book__field")?.classList.remove("has-error");
        if (bookNote) bookNote.textContent = "";
      });
    });

    bookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      let isValid = true;
      let firstErrorField = null;
      
      const name = document.getElementById("bookName");
      const service = document.getElementById("bookService");
      const date = document.getElementById("bookDate");

      // Validate Date
      if (date && !date.value) {
        isValid = false;
        date.closest(".book__field").classList.add("has-error");
        firstErrorField = date;
      }
      
      // Validate Service
      if (service && !service.value) {
        isValid = false;
        service.closest(".book__field").classList.add("has-error");
        firstErrorField = service;
      }
      
      // Validate Name
      if (name) {
        const nameVal = name.value.trim();
        const nameRegex = /^[A-Za-z\s]+$/;
        
        if (nameVal.length < 2 || !nameRegex.test(nameVal)) {
          isValid = false;
          name.closest(".book__field").classList.add("has-error");
          firstErrorField = name;
        }
      }

      if (!isValid) {
        if (bookNote) {
          bookNote.style.color = "#e07b7b";
          bookNote.textContent = "Please fill in all required fields correctly.";
        }
        if (firstErrorField) firstErrorField.focus();
      } else {
        if (bookNote) bookNote.textContent = "";
        
        // Store a flag if you want to show a success message on the 404 page
        sessionStorage.setItem("bookingSubmitted", "1");
        
        // Reset the form fields so they are empty if the user comes back
        bookForm.reset();
        
        window.location.href = "404.html";
      }
    });
  }

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

      // Valid: store flag so the form resets when the user returns from 404
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