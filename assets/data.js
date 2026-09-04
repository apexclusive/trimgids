/* ==========================================================================
   Pupgids — gedeelde demo-data
   Gebruikt door: trimsalon.html · salon.html
   Let op: dit zijn voorbeeldgegevens (duidelijk gelabeld), geen echte salons.
   ========================================================================== */
window.PupData = (function () {
  "use strict";

  var PLACES = {
    maastricht:  { label: "Maastricht",  prov: "Limburg",  wijken: ["Wyck", "Heer", "Amby", "Sint Pieter"] },
    heerlen:     { label: "Heerlen",     prov: "Limburg",  wijken: ["Heerlerheide", "Hoensbroek", "Heerlerbaan"] },
    sittard:     { label: "Sittard",     prov: "Limburg",  wijken: ["Limbrichterveld", "Baandert", "Ophoven"] },
    geleen:      { label: "Geleen",      prov: "Limburg",  wijken: ["Lindenheuvel", "Kluis", "Oud-Geleen"] },
    venlo:       { label: "Venlo",       prov: "Limburg",  wijken: ["Blerick", "Tegelen", "Centrum"] },
    roermond:    { label: "Roermond",    prov: "Limburg",  wijken: ["Hoogvonderen", "Roermondse Veld", "Centrum"] },
    weert:       { label: "Weert",       prov: "Limburg",  wijken: ["Leuken", "Boshoven", "Graswinkel"] },
    kerkrade:    { label: "Kerkrade",    prov: "Limburg",  wijken: ["Eygelshoven", "Chevremont", "Spekholzerheide"] },
    venray:      { label: "Venray",      prov: "Limburg",  wijken: ["Centrum", "Smakterheide", "Brukske"] },
    valkenburg:  { label: "Valkenburg",  prov: "Limburg",  wijken: ["Centrum", "Sibbe", "Houthem"] },
    meerssen:    { label: "Meerssen",    prov: "Limburg",  wijken: ["Centrum", "Bunde", "Rothem"] },
    eindhoven:   { label: "Eindhoven",   prov: "Brabant",  wijken: ["Stratum", "Gestel", "Woensel"] }
  };

  var RAS_LABELS = {
    "pomeriaan": "Pomeriaan", "labradoodle": "Labradoodle", "goldendoodle": "Goldendoodle",
    "cockapoo": "Cockapoo", "poedel": "Poedel", "maltezer": "Maltezer", "shih-tzu": "Shih Tzu",
    "schnauzer": "Schnauzer", "cocker-spaniel": "Cocker Spaniël", "golden-retriever": "Golden Retriever",
    "labrador": "Labrador", "berner-sennen": "Berner Sennenhond", "husky": "Husky",
    "cavalier": "Cavalier King Charles", "westie": "Westie"
  };

  var SPECS = [
    ["angst", "Angstige honden"], ["klitten", "Klitten"],
    ["dubbel", "Dubbele vacht"], ["pluk", "Plukken"], ["puppy", "Puppy's"]
  ];

  var NAMEN = ["Pootlief", "Kwispel", "Vacht & Co", "Het Plukhuis", "Wolletje", "De Blower", "Trimtafel", "Zachte Pootjes"];
  var THUMBS = ["images/cat-trim.jpg", "images/hero.jpg", "images/puppy.jpg", "images/cat-opvang.jpg"];
  var GALLERY = ["images/hero.jpg", "images/cat-trim.jpg", "images/puppy.jpg", "images/pom-borstel.jpg"];

  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h || 1; }
  function rng(seed) { return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }

  function maakSalons(plaatsSlug) {
    var p = PLACES[plaatsSlug];
    var r = rng(hash(plaatsSlug));
    var n = 3 + Math.floor(r() * 2); /* 3–4 voorbeeldsalons */
    var rasSlugs = Object.keys(RAS_LABELS);
    var salons = [];
    for (var i = 0; i < n; i++) {
      var wijk = p.wijken[i % p.wijken.length];
      var naam = "Trimsalon " + NAMEN[Math.floor(r() * NAMEN.length)] + " · " + wijk;
      var alle = r() < 0.22;
      var rassen = [];
      if (!alle) {
        var kopie = rasSlugs.slice();
        for (var j = kopie.length - 1; j > 0; j--) { var k = Math.floor(r() * (j + 1)); var t = kopie[j]; kopie[j] = kopie[k]; kopie[k] = t; }
        rassen = kopie.slice(0, 3 + Math.floor(r() * 3));
      }
      var specs = [];
      var specSlugs = SPECS.slice();
      for (var s2 = specSlugs.length - 1; s2 > 0; s2--) { var k2 = Math.floor(r() * (s2 + 1)); var t2 = specSlugs[s2]; specSlugs[s2] = specSlugs[k2]; specSlugs[k2] = t2; }
      specs = specSlugs.slice(0, 1 + Math.floor(r() * 3)).map(function (x) { return x[0]; });
      salons.push({
        naam: naam,
        wijk: wijk,
        plaats: p.label,
        prov: p.prov,
        alle: alle,
        rassen: rassen,
        specs: specs,
        rating: (4.4 + r() * 0.6).toFixed(1),
        reviews: 8 + Math.floor(r() * 110),
        prijs: 45 + Math.floor(r() * 50),
        plek: r() < 0.6,
        premium: i === 0,
        afstand: (0.5 + r() * 4).toFixed(1),
        thumb: THUMBS[Math.floor(r() * THUMBS.length)]
      });
    }
    return salons;
  }

  /* Bouw een detailpagina-URL met alle relevante parameters */
  function salonUrl(s, plaatsSlug, rasParam) {
    var q = new URLSearchParams();
    q.set("naam", s.naam);
    q.set("plaats", plaatsSlug || "");
    q.set("ras", rasParam || "");
    q.set("prijs", s.prijs);
    q.set("rating", s.rating);
    q.set("rev", s.reviews);
    q.set("specs", s.specs.join(","));
    q.set("prem", s.premium ? "1" : "0");
    q.set("plek", s.plek ? "1" : "0");
    q.set("alle", s.alle ? "1" : "0");
    q.set("rassen", s.rassen.join(","));
    q.set("wijk", s.wijk);
    q.set("thumb", s.thumb.replace("images/", ""));
    return "salon.html?" + q.toString();
  }

  return {
    PLACES: PLACES,
    RAS_LABELS: RAS_LABELS,
    SPECS: SPECS,
    NAMEN: NAMEN,
    THUMBS: THUMBS,
    GALLERY: GALLERY,
    hash: hash,
    rng: rng,
    maakSalons: maakSalons,
    salonUrl: salonUrl
  };
})();
