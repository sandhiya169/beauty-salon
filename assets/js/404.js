/* ==========================================================================
   Stackly — 404.js
   Standalone script for 404.html. No preloader, no nav — this page loads
   fast and alone. Entrance sequence → floating chair → drifting petals
   → cursor → chip stagger.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ------------------------------------------------------------------ */
  /* AOS                                                                 */
  /* ------------------------------------------------------------------ */
  AOS.init({
    duration: 700,
    easing: "ease-out-cubic",
    once: true,
    offset: 40,
    disable: reduceMotion,
  });

  /* ------------------------------------------------------------------ */
  /* CUSTOM CURSOR                                                       */
  /* ------------------------------------------------------------------ */
  const cursorDot = $("#cursorDot");
  if (cursorDot && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorDot.classList.add("is-active");
      gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.25, ease: "power2.out" });
    });
    $$("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-big"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-big"));
    });
  }

  /* ------------------------------------------------------------------ */
  /* ENTRANCE SEQUENCE                                                   */
  /* ------------------------------------------------------------------ */
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".err__mark", { y: -16, opacity: 0, duration: 0.6 })
    .from(".err__chair", { scale: 0.75, opacity: 0, rotation: -6, duration: 0.9, ease: "back.out(1.5)" }, "-=0.3")
    .from(".err__eyebrow", { y: 16, opacity: 0, duration: 0.5 }, "-=0.5")
    .from(".err__num span", { y: 48, opacity: 0, duration: 0.7, stagger: 0.08 }, "-=0.35")
    .from(".err__line, .err__sub", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.35")
    .from(".err__actions .btn", { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.35")
    .from(".err__rooms", { y: 20, opacity: 0, duration: 0.6 }, "-=0.2")
    .from(".err__chip", { y: 14, opacity: 0, duration: 0.45, stagger: 0.06 }, "-=0.35")
    .from(".err__petal", { scale: 0, opacity: 0, duration: 0.6, stagger: 0.12, ease: "back.out(2)" }, "-=0.6");

  /* ------------------------------------------------------------------ */
  /* THE CHAIR — a slow idle sway, plus it leans away from the pointer   */
  /* ------------------------------------------------------------------ */
  const chair = $("#errChair");
  const stage = $("#errStage");

  if (chair && !reduceMotion) {
    gsap.to(chair, {
      y: -10,
      rotation: 1.4,
      duration: 2.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      transformOrigin: "50% 100%",
      delay: 1.4,
    });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      stage.addEventListener("mousemove", (e) => {
        const rect = stage.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        gsap.to(chair, { rotation: relX * -8, duration: 0.6, ease: "power2.out" });
      });
      stage.addEventListener("mouseleave", () => {
        gsap.to(chair, { rotation: 0, duration: 0.8, ease: "power2.out" });
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* PETALS — continuous gentle drift                                    */
  /* ------------------------------------------------------------------ */
  if (!reduceMotion) {
    $$(".err__petal").forEach((petal, i) => {
      gsap.to(petal, {
        y: i % 2 ? 22 : -22,
        x: i % 2 ? -14 : 14,
        rotation: i % 2 ? -18 : 18,
        duration: 5 + i,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.4,
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* MIRRORED "0" — subtle continuous wobble to read as a mirror image   */
  /* ------------------------------------------------------------------ */
  const mirror = $(".err__num-mirror");
  if (mirror && !reduceMotion) {
    gsap.to(mirror, {
      skewY: 3,
      duration: 2.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2,
    });
  }
});