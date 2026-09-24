/* ==========================================================================
   Stackly — blog.js
   Nav / menu / cursor chrome (shared feel with the rest of the site) +
   page-specific animations: hero intro + counters, featured story reveal,
   filterable article grid, draggable trending strip, tag cloud filtering,
   newsletter forms.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* PRELOADER                                                           */
  /* ------------------------------------------------------------------ */
  const preloader   = document.getElementById("preloader");
  const progressBar = document.getElementById("preloaderProgress");
  const letters     = document.querySelectorAll(".preloader__word span");

  document.body.classList.add("lock");

  /* ------------------------------------------------------------------ */
  /* AOS HELPERS                                                         */
  /* AOS measures every element's trigger point once, at init. Anything  */
  /* that changes the page height afterwards (the article filter hides   */
  /* cards) leaves those cached points stale, so sections further down   */
  /* never reach their trigger and stay at opacity 0. refreshLayout()    */
  /* re-measures; startRevealFallback() is the safety net that reveals   */
  /* any [data-aos] element the moment it actually scrolls into view,    */
  /* even if AOS's cached position is wrong.                             */
  /* ------------------------------------------------------------------ */
  function refreshLayout() {
    if (typeof AOS !== "undefined") AOS.refreshHard();
    ScrollTrigger.refresh();
  }

  function startRevealFallback() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("aos-animate");
          io.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll("[data-aos]").forEach((el) => io.observe(el));
  }

  const preloaderTL = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove("lock");
      ScrollTrigger.refresh();

      /* AOS is initialised only now, once the preloader has fully lifted —
         initialising it earlier lets its IntersectionObserver mark
         above-the-fold elements (like the hero) as already in view and
         fade them in while they're still hidden behind the preloader, so
         by the time the preloader clears there's no entrance animation
         left to see. */
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 60,
        disable: reduceMotion,
      });

      startRevealFallback();
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
    document.querySelectorAll("a, button, .journal-card, .trending-card, .topic-pill").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-big"));
    });
  }

  /* ------------------------------------------------------------------ */
  /* 1. LIVE COUNTERS (hero stats — AOS handles the visual reveal)       */
  /* ------------------------------------------------------------------ */
  const allCards = document.querySelectorAll(".journal-card");
  const categoryCount = new Set(
    Array.from(allCards).map((card) => card.dataset.category)
  ).size;

  animateCount("statPosts", allCards.length + 1); // +1 for the featured story
  animateCount("statCategories", categoryCount);

  function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const counter = { val: 0 };
    gsap.to(counter, {
      val: target,
      duration: 1.4,
      delay: 0.6,
      ease: "power2.out",
      onUpdate: () => (el.textContent = Math.floor(counter.val)),
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. FILTERABLE ARTICLE GRID                                          */
  /* ------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll(".journal-filter__btn");
  const journalEmpty = document.getElementById("journalEmpty");
  let filterTL = null;

  function applyFilter(category) {
    filterBtns.forEach((btn) => {
      const on = btn.dataset.filter === category;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    const cards = Array.from(document.querySelectorAll(".journal-card"));
    const toHide = cards.filter(
      (c) => category !== "all" && c.dataset.category !== category
    );
    const toShow = cards.filter(
      (c) => category === "all" || c.dataset.category === category
    );

    /* From the first filter click on, GSAP owns the cards. Their AOS
       attribute is dropped so AOS's CSS transition can't fight the GSAP
       tween (laggy / half-faded cards) and so the inline transform GSAP
       leaves behind can't override the hover lift. */
    cards.forEach((c) => {
      if (c.hasAttribute("data-aos")) {
        c.classList.add("aos-animate");
        c.removeAttribute("data-aos");
        c.removeAttribute("data-aos-delay");
      }
    });

    /* A fast second click must not let the previous run's callbacks
       (display:none on hide, etc.) land on top of this one. */
    if (filterTL) filterTL.kill();
    gsap.killTweensOf(cards);

    filterTL = gsap.timeline({
      onComplete: () => {
        gsap.set(toShow, { clearProps: "opacity,transform" });
        refreshLayout();
      },
    });

    if (toHide.length) {
      filterTL.to(toHide, {
        opacity: 0, y: 16, scale: 0.97, duration: 0.3, stagger: 0.03, ease: "power2.in",
      });
    }

    filterTL.add(() => {
      toHide.forEach((c) => (c.style.display = "none"));
      toShow.forEach((c) => (c.style.display = ""));
      if (journalEmpty) journalEmpty.classList.toggle("is-visible", toShow.length === 0);
      /* the grid just changed height — re-measure right away so the
         sections below are already correct while the cards animate in */
      refreshLayout();
    });

    if (toShow.length) {
      filterTL.fromTo(
        toShow,
        { opacity: 0, y: 16, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", immediateRender: false }
      );
    }
  }

  filterBtns.forEach((btn) =>
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter))
  );

  /* Topic rows navigate to 404.html — no filter scroll needed */

  /* ------------------------------------------------------------------ */
  /* 4–7. Trending / Topics / Editor's Note / Final CTA                  */
  /* AOS data-attributes on the HTML elements handle all scroll-reveal   */
  /* for these sections — no GSAP ScrollTrigger needed here.             */
  /* ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------ */
  /* NEWSLETTER FORM (footer) — front-end only confirmation              */
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