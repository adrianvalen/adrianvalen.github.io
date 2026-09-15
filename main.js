window.__BRAND__ = {
  name: "Adrián Valenzuela",
  accent: "#E2703A",
  email: "advadi2@gmail.com"
};

(function () {
  "use strict";

  function safe(fn) {
    try { fn(); } catch (err) { /* one broken feature must not break the page */ }
  }

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function initNavToggle() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { observer.observe(el); });

    // Safety net: if something goes wrong with IO timing, reveal everything anyway.
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }, 4000);
  }

  function initHeroParallax() {
    if (prefersReducedMotion) return;
    var graphic = document.getElementById("heroGraphic");
    if (!graphic) return;
    var cards = graphic.querySelectorAll(".hg-card, .hg-badge");
    if (!cards.length) return;

    var raf = null;
    window.addEventListener("mousemove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var x = (e.clientX / window.innerWidth - 0.5);
        var y = (e.clientY / window.innerHeight - 0.5);
        cards.forEach(function (card, i) {
          var depth = (i + 1) * 4;
          card.style.setProperty("--px", (x * depth).toFixed(2) + "px");
          card.style.setProperty("--py", (y * depth).toFixed(2) + "px");
          card.style.translate = "var(--px, 0) var(--py, 0)";
        });
        raf = null;
      });
    }, { passive: true });
  }

  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var note = document.getElementById("formNote");
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(fieldId, message) {
      var field = document.getElementById(fieldId);
      var errorEl = form.querySelector('[data-error-for="' + fieldId + '"]');
      if (!field || !errorEl) return;
      field.closest(".field").classList.toggle("has-error", !!message);
      errorEl.textContent = message || "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("cf-name").value.trim();
      var email = document.getElementById("cf-email").value.trim();
      var message = document.getElementById("cf-message").value.trim();

      var valid = true;
      setError("cf-name", name ? "" : "Escribe tu nombre.");
      if (!name) valid = false;

      if (!email) { setError("cf-email", "Escribe tu email."); valid = false; }
      else if (!emailPattern.test(email)) { setError("cf-email", "Ese email no parece correcto."); valid = false; }
      else { setError("cf-email", ""); }

      setError("cf-message", message ? "" : "Cuéntame brevemente tu proyecto.");
      if (!message) valid = false;

      if (!valid) {
        note.textContent = "Revisa los campos marcados en rojo.";
        note.classList.remove("is-success");
        return;
      }

      var subject = "Contacto vía portfolio — " + name;
      var body = "Nombre: " + name + "\nEmail: " + email + "\n\n" + message;
      var mailto = "mailto:" + window.__BRAND__.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      note.textContent = "Se ha abierto tu gestor de correo con el mensaje listo. Si no ocurre nada, escríbeme a " + window.__BRAND__.email + ".";
      note.classList.add("is-success");
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    safe(initYear);
    safe(initNavToggle);
    safe(initReveal);
    safe(initHeroParallax);
    safe(initContactForm);
  });
})();
