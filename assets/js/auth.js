/* ==========================================================================
   Stackly — auth.js
   Client-side validation ONLY. No credentials are ever stored, sent, or
   verified — this file simply checks that fields look well-formed, then
   simulates success and redirects.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^[0-9+\-\s()]{7,15}$/;

  /* ------------------------------------------------------------ */
  /* Helpers                                                        */
  /* ------------------------------------------------------------ */
  function setError(input, message) {
    const group = input.closest(".form-group");
    if (!group) return;
    group.classList.add("has-error");
    const err = group.querySelector(".field-error");
    if (err) err.textContent = message;
  }
  function clearError(input) {
    const group = input.closest(".form-group");
    if (!group) return;
    group.classList.remove("has-error");
  }
  function required(input, label) {
    if (!input.value.trim()) {
      setError(input, `${label} is required.`);
      return false;
    }
    clearError(input);
    return true;
  }

  /* ------------------------------------------------------------ */
  /* Role toggles (Customer / Salon Manager)                        */
  /* ------------------------------------------------------------ */
  document.querySelectorAll(".role-toggle").forEach((toggle) => {
    toggle.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggle.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        toggle.dataset.role = btn.dataset.role;
      });
    });
  });

  /* ------------------------------------------------------------ */
  /* Password show/hide                                             */
  /* ------------------------------------------------------------ */
  document.querySelectorAll(".password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      btn.textContent = isHidden ? "Hide" : "Show";
    });
  });

  /* ------------------------------------------------------------ */
  /* LOGIN FORM                                                     */
  /* ------------------------------------------------------------ */
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    const note = document.getElementById("loginNote");
    const roleToggle = document.getElementById("loginRoleToggle");

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      if (!required(email, "Email")) valid = false;
      else if (!EMAIL_RE.test(email.value.trim())) {
        setError(email, "Enter a valid email address.");
        valid = false;
      }

      if (!required(password, "Password")) valid = false;
      else if (password.value.length < 6) {
        setError(password, "Password must be at least 6 characters.");
        valid = false;
      }

      if (!valid) {
        note.textContent = "Please fix the highlighted fields.";
        note.className = "form-note is-error";
        return;
      }

      const role = roleToggle ? roleToggle.dataset.role : "customer";
      sessionStorage.setItem("userEmail", email.value.trim());
      note.textContent = "Signed in — redirecting to your dashboard…";
      note.className = "form-note is-success";
      loginForm.querySelector(".auth-submit").setAttribute("disabled", "true");

      setTimeout(() => {
        window.location.href = role === "manager" ? "salon-dashboard.html" : "customer-dashboard.html";
      }, 900);
    });

    document.querySelectorAll(".js-google-auth").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (btn.tagName === "A" && btn.getAttribute("href") === "404.html") {
           // Let the link behave normally
           return;
        }
        e.preventDefault();
        const role = roleToggle ? roleToggle.dataset.role : "customer";
        sessionStorage.setItem("userEmail", "google.user@example.com");
        note.textContent = "Connecting to Google…";
        note.className = "form-note is-success";
        setTimeout(() => {
          window.location.href = role === "manager" ? "salon-dashboard.html" : "customer-dashboard.html";
        }, 900);
      });
    });
  }

  /* ------------------------------------------------------------ */
  /* SIGNUP FORM                                                    */
  /* ------------------------------------------------------------ */
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    const name = document.getElementById("signupName");
    const email = document.getElementById("signupEmail");
    const phone = document.getElementById("signupPhone");
    const password = document.getElementById("signupPassword");
    const confirm = document.getElementById("signupConfirm");
    const terms = document.getElementById("signupTerms");
    const note = document.getElementById("signupNote");

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      if (!required(name, "Full name")) valid = false;

      if (!required(email, "Email")) valid = false;
      else if (!EMAIL_RE.test(email.value.trim())) {
        setError(email, "Enter a valid email address.");
        valid = false;
      }

      if (phone.value.trim() && !PHONE_RE.test(phone.value.trim())) {
        setError(phone, "Enter a valid phone number.");
        valid = false;
      } else {
        clearError(phone);
      }

      if (!required(password, "Password")) valid = false;
      else if (password.value.length < 8) {
        setError(password, "Password must be at least 8 characters.");
        valid = false;
      }

      if (!required(confirm, "Confirm password")) valid = false;
      else if (confirm.value !== password.value) {
        setError(confirm, "Passwords do not match.");
        valid = false;
      }

      if (!terms.checked) {
        note.textContent = "Please accept the terms to continue.";
        note.className = "form-note is-error";
        valid = false;
      }

      if (!valid) {
        if (terms.checked) {
          note.textContent = "Please fix the highlighted fields.";
          note.className = "form-note is-error";
        }
        return;
      }

      /* No credentials are stored anywhere — form is simply reset. */
      sessionStorage.setItem("userEmail", email.value.trim());
      note.textContent = "Account created — redirecting to sign in…";
      note.className = "form-note is-success";
      signupForm.querySelector(".auth-submit").setAttribute("disabled", "true");
      signupForm.reset();

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1100);
    });
  }
});
