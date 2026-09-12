/* =============================================================
   Academy — vanilla JS, zero dependencies. Each feature is guard-claused.
   ============================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile navigation ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
    function open() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    }

    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) close();
      else open();
    });

    // Close after tapping a link
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        close();
        toggle.focus();
      }
    });

    // Reset state when leaving mobile breakpoint
    var mq = window.matchMedia("(min-width: 981px)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () {
      if (mq.matches) close();
    });
  }

  /* ---------- compact header on scroll ---------- */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ---------- smooth in-page anchor scrolling ---------- */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#" || id.length < 2) return;
        var target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
        if (typeof target.focus === "function") {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count-up statistics ---------- */
  function initCountUp() {
    var nums = document.querySelectorAll(".stat__num[data-count]");
    if (!nums.length) return;

    // No-JS and reduced-motion users keep the real values baked into the markup.
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1500;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
        else el.textContent = prefix + target + suffix;
      }
      window.requestAnimationFrame(step);
    }

    // Reset to zero so the animation has somewhere to count up from.
    nums.forEach(function (el) {
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      el.textContent = prefix + "0" + suffix;
    });

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- footer subscribe form ---------- */
  function initSubscribe() {
    var form = document.getElementById("subscribe");
    if (!form) return;
    var input = form.querySelector('input[type="email"]');
    var msg = document.getElementById("sub-msg");
    if (!input || !msg) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = input.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        msg.textContent = "Please enter a valid email address.";
        msg.className = "subscribe__msg err";
        input.focus();
        return;
      }
      msg.textContent = "Thank you — admissions updates are on their way.";
      msg.className = "subscribe__msg ok";
      form.reset();
    });
  }

  /* ---------- boot ---------- */
  function init() {
    initMobileNav();
    initHeaderScroll();
    initSmoothScroll();
    initReveal();
    initCountUp();
    initSubscribe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
