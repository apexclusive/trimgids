/* ==========================================================================
   Pupgids — gedeelde scripts
   Gebruikt door: index.html · rassen.html · pomeriaan.html
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* Bebouwde pagina's (voor slimme link-afhandeling in de preview) */
  var GEBOUWD = [
    "/", "/index.html", "/rassen.html", "/pomeriaan.html", "/trimsalon.html",
    "/404.html", "/privacy.html", "/voorwaarden.html",
    "/premium.html", "/quiz.html", "/salon.html", "/binnenkort.html"
  ];

  /* Slug: hoofdletterongevoelig, accenten en leestekens eruit */
  function slug(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function isIntern(href) { return href && href.charAt(0) === "/"; }

  function isGebouwd(href) {
    if (!isIntern(href)) return true;
    var path = href.split("?")[0].split("#")[0];
    return GEBOUWD.indexOf(path) !== -1;
  }

  /* Dynamisch jaartal */
  $$(".jaar").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Sticky nav schaduw */
  var nav = $("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobiel menu */
  var toggle = $("#nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("#menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* Toast */
  function toast(msg) {
    var t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove("show"); }, 3000);
  }

  /* Slimme link-afhandeling: nog niet gebouwde pagina's → toast i.p.v. 404 */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href === "#") {
      e.preventDefault();
      toast("Dit is een voorbeeld — deze pagina volgt in de volgende stap.");
      return;
    }
    if (isIntern(href) && !isGebouwd(href)) {
      e.preventDefault();
      toast("Deze pagina (" + href + ") volgt in de volgende stap.");
    }
  });

  /* Zoekfunctie */
  window.zoek = function (e) {
    if (e) e.preventDefault();
    var catSel = $("#cat");
    var cat = catSel ? catSel.value : "trimsalon";
    var pl = slug($("#plaats").value);
    var ras = $("#ras") ? $("#ras").value : "";
    var form = $(".zoek");
    if (!pl) {
      form.classList.add("fout");
      $("#plaats").focus();
      return false;
    }
    form.classList.remove("fout");
    if (cat !== "trimsalon") {
      window.location.href = "/binnenkort.html?cat=" + encodeURIComponent(cat);
      return false;
    }
    var url = "/trimsalon.html?plaats=" + encodeURIComponent(pl) + (ras ? "&ras=" + encodeURIComponent(ras) : "");
    window.location.href = url;
    return false;
  };

  /* Deep link: ?ras=… & ?cat=… vooraf invullen (vanaf rassenpagina) */
  function prefillSearch() {
    var form = $(".zoek");
    if (!form) return;
    /* Op de resultatenpagina doet het inline script de prefill; niet scrollen/focussen */
    var opResultaten = /trimsalon\.html/.test(window.location.pathname);
    var p = new URLSearchParams(window.location.search);
    var ras = p.get("ras");
    var cat = p.get("cat");
    if (cat) { var c = $("#cat"); if (c) c.value = cat; }
    if (ras) {
      var r = $("#ras");
      if (r) {
        var opt = Array.prototype.slice.call(r.options).filter(function (o) { return o.value === ras; })[0];
        if (opt) { r.value = ras; }
      }
      if (!opResultaten) {
        var pl = $("#plaats");
        if (pl) {
          form.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(function () { pl.focus(); }, 450);
        }
      }
    }
  }

  /* Nieuwsbrief (frontend-demo) */
  window.abonneer = function (e) {
    if (e) e.preventDefault();
    var form = $("#nieuwsbrief");
    if (!form) return false;
    var input = form.querySelector("input[type=email]");
    var uit = $("#nieuwsbrief-uit");
    var email = input.value.trim();
    var honing = form.querySelector("input[name=website]").value;
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (honing) { uit.hidden = true; return false; }
    if (!ok) {
      uit.textContent = "Vul een geldig e-mailadres in.";
      uit.className = "nf-uit fout";
      uit.hidden = false;
      input.focus();
      return false;
    }
    var btn = form.querySelector("button");
    btn.disabled = true;
    uit.className = "nf-uit";
    uit.textContent = "Even wachten…";
    uit.hidden = false;
    setTimeout(function () {
      uit.textContent = "Gelukt! Check je inbox om je aanmelding te bevestigen.";
      form.reset();
      btn.disabled = false;
    }, 600);
    return false;
  };

  /* Reveal-on-scroll */
  function initReveal() {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var revealEls = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ======================================================================
     Rassenpagina: filter & teller
     ====================================================================== */
  function initRassenFilter() {
    var zoek = $("#rassen-zoek");
    if (!zoek) return;

    var groepSel = $("#rassen-groep");
    var zorgSel = $("#rassen-zorg");
    var teller = $("#rassen-teller");
    var groepen = $$(".groep");
    var kaarten = $$(".raskaart");
    var totaal = kaarten.length;

    function filter() {
      var q = slug(zoek.value);
      var g = groepSel.value;
      var z = zorgSel.value;
      var zichtbaar = 0;

      kaarten.forEach(function (k) {
        var naam = k.getAttribute("data-naam") || "";
        var groep = k.getAttribute("data-groep") || "";
        var zorg = k.getAttribute("data-zorg") || "";
        var okNaam = !q || naam.indexOf(q) !== -1;
        var okGroep = !g || groep === g;
        var okZorg = !z || zorg === z;
        var toon = okNaam && okGroep && okZorg;
        k.hidden = !toon;
        if (toon) zichtbaar++;
      });

      groepen.forEach(function (sec) {
        var cards = sec.querySelectorAll(".raskaart");
        var leeg = true;
        Array.prototype.forEach.call(cards, function (c) { if (!c.hidden) leeg = false; });
        sec.classList.toggle("leeg", leeg);
      });

      if (teller) {
        teller.textContent = zichtbaar === totaal
          ? totaal + " rassen"
          : zichtbaar + " van " + totaal + " rassen";
      }
    }

    zoek.addEventListener("input", filter);
    if (groepSel) groepSel.addEventListener("change", filter);
    if (zorgSel) zorgSel.addEventListener("change", filter);

    /* Deep link: ?ras=slug → zoekterm + scroll */
    var p = new URLSearchParams(window.location.search);
    var ras = p.get("ras");
    if (ras) {
      var kaart = $('.raskaart[data-slug="' + ras + '"]');
      if (kaart) {
        zoek.value = kaart.getAttribute("data-naam") || "";
        filter();
        setTimeout(function () { kaart.scrollIntoView({ behavior: "smooth", block: "center" }); }, 350);
      }
    }
    /* Deep link: ?zorg=scheren|plukken|… → verzorgingsfilter */
    var zorg = p.get("zorg");
    if (zorg && zorgSel) {
      var geldig = Array.prototype.slice.call(zorgSel.options).some(function (o) { return o.value === zorg; });
      if (geldig) { zorgSel.value = zorg; filter(); }
    }
  }

  /* Init */
  document.addEventListener("DOMContentLoaded", function () {
    prefillSearch();
    initReveal();
    initRassenFilter();
  });
})();
