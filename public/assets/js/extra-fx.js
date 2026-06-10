/* ============================================================
   ISAAC ZAPATA — efectos extra "más locos"
   Módulo aislado: no toca interactions.js. Respeta reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function lerp(a, b, n) { return a + (b - a) * n; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ------------------------------------------------------------
     1 · SCRAMBLE / DECODE de texto al hover (temático copywriter)
     ------------------------------------------------------------ */
  var GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@*/<>_";
  function attachScramble(el) {
    var raf = 0;
    el.addEventListener("mouseenter", function () {
      if (el._scrambling) return;
      var original = el.textContent;
      if (!original) return;
      el._scrambling = true;
      var len = original.length;
      var start = performance.now();
      var dur = 90 + len * 28;
      (function tick(now) {
        var p = clamp((now - start) / dur, 0, 1);
        var reveal = p * len;
        var out = "";
        for (var i = 0; i < len; i++) {
          var ch = original[i];
          if (ch === " " || i < reveal) out += ch;
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (p < 1) { raf = requestAnimationFrame(tick); }
        else { el.textContent = original; el._scrambling = false; }
      })(start);
    });
  }
  if (!reduce) {
    document.querySelectorAll(
      ".nav__links a, .mobile-menu__links a, .contact__socials a, .work__foot .tag"
    ).forEach(attachScramble);
  }

  /* ------------------------------------------------------------
     2 · GRANO DE PELÍCULA (textura animada, full-screen)
     ------------------------------------------------------------ */
  var grain = document.createElement("div");
  grain.className = "fx-grain";
  document.body.appendChild(grain);

  /* ------------------------------------------------------------
     3 · SPOTLIGHT que sigue el cursor (brillo azul)
     ------------------------------------------------------------ */
  if (finePointer && !reduce) {
    var spot = document.createElement("div");
    spot.className = "fx-spot";
    document.body.appendChild(spot);
    var sx = window.innerWidth / 2, sy = window.innerHeight / 2, tsx = sx, tsy = sy, shown = false;
    window.addEventListener("mousemove", function (e) {
      tsx = e.clientX; tsy = e.clientY;
      if (!shown) { shown = true; spot.style.opacity = "1"; }
    }, { passive: true });
    (function spotLoop() {
      sx = lerp(sx, tsx, 0.12); sy = lerp(sy, tsy, 0.12);
      spot.style.setProperty("--mx", sx + "px");
      spot.style.setProperty("--my", sy + "px");
      requestAnimationFrame(spotLoop);
    })();
  }

  /* ------------------------------------------------------------
     4 · MARQUEES reactivos al scroll (surge de velocidad)
     ------------------------------------------------------------ */
  if (!reduce && "getAnimations" in Element.prototype) {
    var anims = [];
    document.querySelectorAll(".marquee__track").forEach(function (t) {
      var a = t.getAnimations()[0];
      if (a) anims.push(a);
    });
    if (anims.length) {
      var lastY = window.scrollY, vel = 0;
      (function surgeLoop() {
        var y = window.scrollY;
        vel = lerp(vel, Math.abs(y - lastY), 0.18);
        lastY = y;
        var rate = 1 + clamp(vel * 0.14, 0, 6);
        for (var i = 0; i < anims.length; i++) {
          try { anims[i].playbackRate = rate; } catch (e) {}
        }
        requestAnimationFrame(surgeLoop);
      })();
    }
  }

  /* ------------------------------------------------------------
     5 · CASOS ligados al scroll vertical (drift horizontal, desktop)
        Se entrega al usuario apenas arrastra; respeta el solapamiento del hero.
     ------------------------------------------------------------ */
  (function () {
    if (reduce || !finePointer) return;
    var car = document.getElementById("casesCarousel");
    var sec = document.getElementById("cases");
    if (!car || !sec) return;
    var userTook = false;
    car.addEventListener("mousedown", function () { userTook = true; });
    function maxX() { return Math.max(0, car.scrollWidth - car.clientWidth); }
    function onScroll() {
      if (userTook) return;
      var r = sec.getBoundingClientRect();
      var vh = window.innerHeight;
      var span = r.height + vh;
      var p = clamp((vh - r.top) / span, 0, 1);
      car.scrollLeft = maxX() * p;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();
})();
