/* ============================================================
   ISAAC ZAPATA — interacciones + movimiento "loco"
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var lang = localStorage.getItem("iz-lang") || "es";

  /* ---------- helpers ---------- */
  function lerp(a, b, n) { return a + (b - a) * n; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ============================================================
     1 · IDIOMA  ES / EN
     ============================================================ */
  function splitLines(el) {
    var raw = el.getAttribute("data-raw");
    if (raw == null) { raw = el.textContent; el.setAttribute("data-raw", raw); }
    var lines = raw.split("\n");
    el.innerHTML = lines.map(function (ln, i) {
      return '<span class="line-mask"><span style="transition-delay:' + (i * 0.09) + 's">' +
        (ln === "" ? "&nbsp;" : ln) + "</span></span>";
    }).join("");
  }

  function enhanceSplits() {
    document.querySelectorAll(".splitlines").forEach(splitLines);
  }

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll("[data-es]").forEach(function (el) {
      var val = l === "en" ? el.getAttribute("data-en") : el.getAttribute("data-es");
      if (val != null) {
        el.removeAttribute("data-raw");
        el.innerHTML = val;
      }
    });
    enhanceSplits();
    // etiquetas del cursor contextual: reactivas al idioma
    var port = document.querySelector(".hero__portrait");
    if (port && port.hasAttribute("data-cur"))
      port.setAttribute("data-cur-label", l === "en" ? "The ideas guy" : "El de las ideas");
    document.querySelectorAll(".case[data-cur]").forEach(function (c) {
      c.setAttribute("data-cur-label", l === "en" ? "Play" : "Ver");
    });
    var toggle = document.getElementById("lang");
    if (toggle) {
      toggle.querySelectorAll("span[data-lang]").forEach(function (s) {
        s.classList.toggle("on", s.getAttribute("data-lang") === l);
      });
    }
    try { localStorage.setItem("iz-lang", l); } catch (e) {}
  }

  // mark elements that should reveal line-by-line
  document.querySelectorAll(".section__title, .manifesto__q").forEach(function (el) {
    el.classList.add("splitlines");
  });

  var langBtn = document.getElementById("lang");
  if (langBtn) {
    var flip = function () { applyLang(lang === "es" ? "en" : "es"); };
    langBtn.addEventListener("click", flip);
    langBtn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });
  }
  applyLang(lang);

  /* ============================================================
     2 · HERO — split letters + entrance
     ============================================================ */
  var word = document.querySelector(".hero__word");
  if (word) {
    var chars = Array.from(word.textContent.replace("®", "").trim()); // I D E A S
    var html = chars.map(function (ch, i) {
      var delay = "transition-delay:" + (0.15 + i * 0.07) + "s";
      return '<span class="h-l"><span class="h-l__i" style="' + delay + '">' + ch + "</span></span>";
    }).join("");
    word.innerHTML = html + '<span class="reg-mark">®</span>';
  }

  var hero = document.querySelector(".hero");
  if (hero) {
    hero.classList.add("anim-ready");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add("hero-in"); });
    });
    setTimeout(function () { hero.classList.add("hero-in"); }, 1600);
    setTimeout(function () {
      document.querySelectorAll(".hero__word .h-l__i, .hero__sign, .hero__issue, .hero__meta")
        .forEach(function (s) { s.style.transition = "none"; s.style.transform = "none"; });
    }, 2000);
  }

  /* ============================================================
     3 · SCROLL REVEALS
     ============================================================ */
  var reveals = document.querySelectorAll(".reveal");
  function settle(t) {
    // safety net: guarantee final visible state even if transitions never tick
    t.style.transition = "none";
    t.style.transform = "none";
    t.querySelectorAll(".line-mask > span, .h-l__i").forEach(function (s) {
      s.style.transition = "none";
      s.style.transform = "none";
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          var t = en.target;
          setTimeout(function () { settle(t); }, 1700);
          io.unobserve(t);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    // fallback: settle anything still in view after a beat, in case the
    // observer never fires (defensive — content must never stay hidden)
    setTimeout(function () {
      reveals.forEach(function (el) {
        if (el.classList.contains("in")) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add("in");
          settle(el);
        }
      });
    }, 4000);
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ============================================================
     4 · CUSTOM CONTEXTUAL CURSOR  (desktop only)
     ============================================================ */
  var cursor = document.getElementById("cursor");
  var cursorLabel = document.getElementById("cursor-label");
  var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  var tx = cx, ty = cy;

  if (cursor && finePointer && !reduce) {
    // zones
    document.querySelectorAll(".case").forEach(function (c) {
      c.setAttribute("data-cur", "media");
      c.setAttribute("data-cur-label", lang === "en" ? "Play" : "Ver");
      c.classList.add("cursor-hide");
    });
    var portrait = document.querySelector(".hero__portrait");
    if (portrait) {
      portrait.setAttribute("data-cur", "drag");
      portrait.setAttribute("data-cur-label", lang === "en" ? "The ideas guy" : "El de las ideas");
      portrait.classList.add("cursor-hide");
    }

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!cursor.classList.contains("show")) cursor.classList.add("show");
    }, { passive: true });

    document.addEventListener("mouseover", function (e) {
      var zone = e.target.closest("[data-cur]");
      var link = e.target.closest("a, button, .lang, .case__play");
      cursor.classList.remove("is-link", "is-media", "is-drag");
      if (zone) {
        var t = zone.getAttribute("data-cur");
        cursor.classList.add(t === "drag" ? "is-drag" : "is-media");
        cursorLabel.textContent = zone.getAttribute("data-cur-label") || "";
      } else if (link) {
        cursor.classList.add("is-link");
        cursorLabel.textContent = "";
      } else {
        cursorLabel.textContent = "";
      }
    });
    document.addEventListener("mouseleave", function () { cursor.classList.remove("show"); });

    (function cursorLoop() {
      cx = lerp(cx, tx, 0.2); cy = lerp(cy, ty, 0.2);
      cursor.style.left = cx + "px";
      cursor.style.top = cy + "px";
      requestAnimationFrame(cursorLoop);
    })();
  }

  /* ============================================================
     5 · MAGNETIC ELEMENTS
     ============================================================ */
  if (finePointer && !reduce) {
    document.querySelectorAll(".nav__links a, .lang, .contact__big a, .scroll-cue, .contact__socials a")
      .forEach(function (el) {
        el.classList.add("magnetic");
        var strength = el.classList.contains("contact__big") ? 0.4 : 0.32;
        el.addEventListener("mousemove", function (e) {
          var r = el.getBoundingClientRect();
          var mx = e.clientX - (r.left + r.width / 2);
          var my = e.clientY - (r.top + r.height / 2);
          el.style.transform = "translate(" + mx * strength + "px," + my * strength + "px)";
        });
        el.addEventListener("mouseleave", function () { el.style.transform = ""; });
      });
  }

  /* ============================================================
     6 · HERO PARALLAX  (mouse + scroll, via `translate`)
     ============================================================ */
  var hWord = document.querySelector(".hero__word");
  var hPortrait = document.querySelector(".hero__portrait");
  var hMetaL = document.querySelector(".hero__meta:not(.right)");
  var hMetaR = document.querySelector(".hero__meta.right");
  var pmx = 0, pmy = 0, tmx = 0, tmy = 0, scrollY = window.scrollY;

  if (!reduce) {
    if (finePointer) {
      window.addEventListener("mousemove", function (e) {
        tmx = (e.clientX / window.innerWidth - 0.5);
        tmy = (e.clientY / window.innerHeight - 0.5);
      }, { passive: true });
    }
    (function heroLoop() {
      pmx = lerp(pmx, tmx, 0.06);
      pmy = lerp(pmy, tmy, 0.06);
      var sy = scrollY;
      if (hWord) hWord.style.translate = (pmx * 26) + "px " + (pmy * 14 - sy * 0.18) + "px";
      if (hPortrait) hPortrait.style.translate = (pmx * -38) + "px " + (pmy * -20 - sy * 0.05) + "px";
      if (hMetaL) hMetaL.style.translate = (pmx * -16) + "px 0";
      if (hMetaR) hMetaR.style.translate = (pmx * 16) + "px 0";
      requestAnimationFrame(heroLoop);
    })();
  }

  /* ============================================================
     7 · SCROLL-VELOCITY SKEW  (editorial "gooey" feel)
     ============================================================ */
  var skewers = [];
  document.querySelectorAll(".section, .manifesto, .contact").forEach(function (el) {
    el.classList.add("skewable"); skewers.push(el);
  });
  var lastY = window.scrollY, vel = 0, skew = 0;

  if (!reduce) {
    (function skewLoop() {
      scrollY = window.scrollY;
      vel = scrollY - lastY;
      lastY = scrollY;
      skew = lerp(skew, clamp(vel * 0.06, -5, 5), 0.18);
      var s = Math.abs(skew) < 0.02 ? 0 : skew;
      for (var i = 0; i < skewers.length; i++) {
        skewers[i].style.setProperty("--skew", s.toFixed(2) + "deg");
      }
      requestAnimationFrame(skewLoop);
    })();
  } else {
    window.addEventListener("scroll", function () { scrollY = window.scrollY; }, { passive: true });
  }

  /* ============================================================
     8 · 3D TILT on cards
     ============================================================ */
  if (finePointer && !reduce) {
    document.querySelectorAll(".work").forEach(function (card) {
      var base = card.classList.contains("work") ? "translateY(-6px) " : "";
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = base + "rotateY(" + (px * 7).toFixed(2) + "deg) rotateX(" +
          (-py * 7).toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ============================================================
     9 · NAV auto-hide on scroll down
     ============================================================ */
  var nav = document.querySelector(".nav");
  var navLast = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (nav) {
      if (y > navLast && y > 220) nav.classList.add("nav--up");
      else nav.classList.remove("nav--up");
    }
    navLast = y;
  }, { passive: true });

  /* ============================================================
     10 · LIGHTBOX (YouTube)
     ============================================================ */
  var lb = document.getElementById("lightbox");
  var lbFrame = document.getElementById("lb-frame");
  var lbClose = document.getElementById("lb-close");

  function openCase(yt) {
    if (!lb) return;
    if (yt) {
      lbFrame.innerHTML = '<iframe src="https://www.youtube.com/embed/' + yt +
        '?autoplay=1&rel=0" title="Caso en video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    } else {
      lbFrame.innerHTML = '<div style="width:100%;height:100%;display:grid;place-items:center;' +
        'background:#0f0e0d;color:#7c7a76;text-align:center;padding:40px;font-family:' +
        'var(--f-ui);letter-spacing:.04em;">' +
        (lang === "en"
          ? 'Add a YouTube ID to this case&rsquo;s <b style="color:#1B33FF">data-yt</b> attribute to play it here.'
          : 'Agregá el ID de YouTube en el atributo <b style="color:#1B33FF">data-yt</b> de este caso para reproducirlo aquí.') +
        "</div>";
    }
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    if (!lb) return;
    lb.classList.remove("open");
    lbFrame.innerHTML = "";
    document.body.style.overflow = "";
  }
  /* drag-to-scroll carousel (suppress click after a real drag) */
  var car = document.getElementById("casesCarousel");
  var dragged = false;
  if (car) {
    var down = false, startX = 0, startL = 0;
    car.addEventListener("mousedown", function (e) {
      down = true; dragged = false; startX = e.pageX; startL = car.scrollLeft;
    });
    window.addEventListener("mouseup", function () { down = false; car.classList.remove("grabbing"); });
    car.addEventListener("mousemove", function (e) {
      if (!down) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 4) { dragged = true; car.classList.add("grabbing"); }
      car.scrollLeft = startL - dx;
    });
  }
  document.querySelectorAll(".case").forEach(function (c) {
    c.addEventListener("click", function () {
      if (dragged) { dragged = false; return; }
      openCase(c.getAttribute("data-yt"));
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });

  /* ============================================================
     11 · MARQUEE seamless duration
     ============================================================ */
  document.querySelectorAll(".marquee__track").forEach(function (tr) {
    var w = tr.scrollWidth / 2;
    var dur = Math.max(18, w / 70);
    tr.style.animationDuration = dur + "s";
  });
})();
