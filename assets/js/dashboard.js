/* ==========================================================================
   Stackly — dashboard.js
   Sidebar section switching, mobile drawer, logout / home, and the
   demo-only action buttons that route to the 404 page.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("dashSidebar");
  const overlay = document.getElementById("dashOverlay");
  const menuToggle = document.getElementById("dashMenuToggle");
  const topbarTitle = document.getElementById("dashTopbarTitle");
  const navLinks = document.querySelectorAll(".dash-nav__link[data-section]");
  const sections = document.querySelectorAll(".dash-section");

  const userEmail = sessionStorage.getItem("userEmail");
  if (userEmail) {
    document.querySelectorAll(".dash-user-email, .dash-sidebar__user-email").forEach(el => {
      el.textContent = userEmail;
    });
    document.querySelectorAll(".dash-avatar").forEach(el => {
      el.textContent = userEmail.charAt(0).toUpperCase();
    });
  }

  function openSidebar() {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-visible");
  }
  function closeSidebar() {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-visible");
  }

  if (menuToggle) menuToggle.addEventListener("click", openSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const target = link.dataset.section;

      navLinks.forEach((l) => l.classList.remove("is-active"));
      link.classList.add("is-active");

      sections.forEach((sec) => sec.classList.toggle("is-active", sec.id === target));

      if (topbarTitle) topbarTitle.textContent = link.dataset.label || link.textContent.trim();

      document.querySelector(".dash-content")?.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      closeSidebar();
    });
  });

  /* Responsive tables — copy each column heading onto its cells so the
     stacked mobile layout (see dashboard.css) can label every value.
     New rows added later are labelled automatically. */
  document.querySelectorAll(".dash-table").forEach((table) => {
    const heads = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim());
    table.querySelectorAll("tbody tr").forEach((row) => {
      Array.from(row.children).forEach((cell, i) => {
        if (heads[i]) cell.setAttribute("data-label", heads[i]);
      });
    });
  });

  /* Logout — return to the login screen and clear session */
  document.querySelectorAll(".js-logout").forEach((btn) => {
    btn.addEventListener("click", () => {
      sessionStorage.removeItem("userEmail");
      window.location.href = "login.html";
    });
  });

  /* Back to home */
  document.querySelectorAll(".js-home").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  });

  /* Every demo action button routes to the 404 page */
  document.querySelectorAll(".js-action").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "404.html";
    });
  });
});