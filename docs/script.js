/* AC Tracker — interacciones de la web
   Solo: menú móvil, acordeones, sección activa, volver arriba y buscador de herramientas. */
(function () {
  "use strict";

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu-principal");

  function closeMenu() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });

  /* ---------- Acordeones (FAQ) ---------- */
  document.querySelectorAll(".acc-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      panel.hidden = open;
    });
  });

  /* ---------- Sección activa (menú superior e índice de herramientas) ---------- */
  var navLinks = nav.querySelectorAll("a");
  var sections = document.querySelectorAll("[data-nav]");
  var toolLinks = document.querySelectorAll(".tools-index a");
  var toolCards = document.querySelectorAll(".tool-card");

  function headerOffset() {
    var h = document.querySelector(".site-header");
    return (h ? h.offsetHeight : 64) + 24;
  }

  function currentFrom(list, getId) {
    var line = headerOffset();
    var current = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].hidden) continue;
      if (list[i].getBoundingClientRect().top - line <= 0) current = getId(list[i]);
    }
    return current;
  }

  function updateActive() {
    var sec = currentFrom(sections, function (s) { return s.getAttribute("data-nav"); }) || "inicio";
    navLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + sec;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });

    var tool = currentFrom(toolCards, function (c) { return c.id; });
    toolLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-tool") === tool);
    });

    toTop.classList.toggle("show", window.scrollY > 600);
  }

  /* ---------- Volver arriba ---------- */
  var toTop = document.getElementById("to-top");
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0 });
    var logo = document.querySelector(".logo");
    if (logo) logo.focus({ preventScroll: true });
  });

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateActive();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", updateActive);
  updateActive();

  /* ---------- Buscador de la guía de herramientas ---------- */
  var input = document.getElementById("tool-search");
  var status = document.getElementById("search-status");
  var noResults = document.getElementById("no-results");

  function normalize(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
  }

  var cardText = [];
  toolCards.forEach(function (card) { cardText.push(normalize(card.textContent)); });

  input.addEventListener("input", function () {
    var q = normalize(input.value.trim());
    var shown = 0;
    toolCards.forEach(function (card, i) {
      var match = !q || cardText[i].indexOf(q) !== -1;
      card.hidden = !match;
      if (match) shown++;
      var link = document.querySelector('.tools-index a[data-tool="' + card.id + '"]');
      if (link) link.classList.toggle("is-hidden", !match);
    });
    noResults.classList.toggle("show", shown === 0);
    if (!q) status.textContent = "";
    else status.textContent = shown === 1 ? "1 herramienta coincide." : shown + " herramientas coinciden.";
    updateActive();
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && input.value) {
      input.value = "";
      input.dispatchEvent(new Event("input"));
    }
  });
})();
