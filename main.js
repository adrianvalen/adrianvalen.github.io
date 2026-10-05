(function () {
  "use strict";

  function safe(fn) {
    try { fn(); } catch (err) { /* one broken feature must not break the page */ }
  }

  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var hasIO = "IntersectionObserver" in window;

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  // Quiet reveal: each marked block fades up once when it comes into view.
  function initReveals() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    if (!hasIO) { items.forEach(function (el) { el.classList.add("is-visible"); }); return; }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { observer.observe(el); });

    // Safety net: never leave content hidden.
    setTimeout(function () { items.forEach(function (el) { el.classList.add("is-visible"); }); }, 6000);
  }

  // The room changes colour with the section you are in.
  function initScenes() {
    if (!hasIO) return;
    var scenes = document.querySelectorAll("[data-scene]");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) document.body.setAttribute("data-scene", entry.target.getAttribute("data-scene"));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    scenes.forEach(function (s) { observer.observe(s); });
  }

  // Marks the nav link of the section in view.
  function initSpy() {
    if (!hasIO) return;
    var links = document.querySelectorAll("#nav a");
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) observer.observe(s);
    });
  }

  // Pointer: shifts the hero layers, tilts the lit objects, and trails a soft light.
  function initPointer() {
    if (reduced) return;
    if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;

    var root = document.documentElement;
    var beam = document.getElementById("beam");
    var tx = 0, ty = 0, x = 0, y = 0;
    var bx = 0, by = 0, btx = 0, bty = 0;
    var raf = null, started = false;

    function tick() {
      x += (tx - x) * 0.09;
      y += (ty - y) * 0.09;
      bx += (btx - bx) * 0.12;
      by += (bty - by) * 0.12;
      root.style.setProperty("--px", x.toFixed(3));
      root.style.setProperty("--py", y.toFixed(3));
      if (beam) beam.style.transform = "translate3d(" + bx.toFixed(1) + "px," + by.toFixed(1) + "px,0)";
      var moving = Math.abs(tx - x) > 0.002 || Math.abs(ty - y) > 0.002 ||
        Math.abs(btx - bx) > 0.4 || Math.abs(bty - by) > 0.4;
      raf = moving ? requestAnimationFrame(tick) : null;
    }

    window.addEventListener("pointermove", function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      btx = e.clientX;
      bty = e.clientY;
      if (!started) {
        bx = btx; by = bty; started = true;
        if (beam) beam.classList.add("is-on");
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    document.documentElement.addEventListener("mouseleave", function () { if (beam) beam.classList.remove("is-on"); });
    document.documentElement.addEventListener("mouseenter", function () { if (beam && started) beam.classList.add("is-on"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    safe(initYear);
    safe(initReveals);
    safe(initScenes);
    safe(initSpy);
    safe(initPointer);
  });
})();
