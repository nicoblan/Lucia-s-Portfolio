/* ==========================================================================
   [Lu - cía]® — código compartido entre páginas
   --------------------------------------------------------------------------
   Lo usan index.html (js/main.js) y area.html (js/area.js):
   constantes de movimiento, reveal al hacer scroll, fondo de tonalidades /
   backstage y cursor personalizado. Todo queda en window.LU.
   ========================================================================== */
(function () {
  "use strict";

  const CONFIG = window.SITE_CONFIG || {};
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Si la persona pidió menos movimiento, no animamos nada que se desplace.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Mouse / trackpad (no touch): habilita hover de paneles y cursor propio
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  // Curvas compartidas (mismas que en CSS)
  const EASE_OUT = "cubic-bezier(.16, 1, .3, 1)";
  const EASE_BACK = "cubic-bezier(.34, 1.56, .64, 1)"; // leve rebote

  /* ------------------------------------------------------------------------
     1. REVEAL al entrar en pantalla (IntersectionObserver)
     El CSS define el "antes" (.js [data-reveal]) y el "después" (.is-in).
     data-reveal="clip" → se descubre de abajo hacia arriba
     data-reveal="wipe" → se descubre de izquierda a derecha
     ------------------------------------------------------------------------ */
  function initReveal() {
    const els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("is-in")); return; }
    // Ojo: IntersectionObserver respeta el clip-path, así que un elemento
    // recortado al 100% "no se ve" nunca. Para clip/wipe observamos al padre.
    const targets = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (targets.get(entry.target) || []).forEach(el => el.classList.add("is-in"));
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
    els.forEach(el => {
      const clipped = el.dataset.reveal === "clip" || el.dataset.reveal === "wipe";
      const watch = clipped ? el.parentElement : el;
      if (!targets.has(watch)) targets.set(watch, []);
      targets.get(watch).push(el);
      io.observe(watch);
    });
  }

  /* ------------------------------------------------------------------------
     2. FONDO DE BACKSTAGE: cross-fade + Ken Burns (en CSS)
     Las imágenes salen de SITE_CONFIG.backstage. Sin `src` → placeholder.
     El botón amarillo del nav lo pausa (pauta WCAG 2.2.2 para contenido
     que se mueve solo). También se pausa si la pestaña no está visible.
     ------------------------------------------------------------------------ */
  function initBackstage() {
    const stage = $(".backstage__stage");
    // Las tonalidades del fondo son CSS (@keyframes tones). Acá solo se
    // suman las fotos que tengan `src`; sin fotos, queda el fondo de color.
    const list = (CONFIG.backstage || []).filter((item) => item.src);
    let paused = reduceMotion, timer = null;
    const stop = () => { clearInterval(timer); timer = null; };
    let play = () => {};

    if (stage && list.length) {
      const credit = document.createElement("p");
      credit.className = "backstage__credit";
      credit.setAttribute("aria-hidden", "true");
      document.body.appendChild(credit);

      const slides = list.map((item) => {
        const slide = document.createElement("div");
        slide.className = "backstage__slide";
        const img = document.createElement("img");
        img.src = item.src; img.alt = item.alt || ""; img.loading = "lazy"; img.decoding = "async";
        slide.appendChild(img);
        stage.appendChild(slide);
        return slide;
      });

      let i = 0;
      const show = (n) => {
        slides.forEach((s, k) => s.classList.toggle("is-active", k === n));
        credit.textContent = `Backstage — ${list[n].production || ""}`;
      };
      const next = () => { i = (i + 1) % slides.length; show(i); };
      play = () => { stop(); if (!paused && slides.length > 1) timer = setInterval(next, CONFIG.backstageInterval || 7000); };
      show(0);
      play();
    }

    const btn = $("[data-backstage-toggle]");
    const syncBtn = () => {
      btn.setAttribute("aria-pressed", String(paused));
      $(".visually-hidden", btn).textContent = paused ? "Reanudar fondo de backstage" : "Pausar fondo de backstage";
      document.documentElement.classList.toggle("backstage-paused", paused);
    };
    if (btn) {
      syncBtn();
      btn.addEventListener("click", () => { paused = !paused; syncBtn(); play(); });
    }
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : play()));
  }

  /* ------------------------------------------------------------------------
     3. CURSOR PERSONALIZADO
     Un círculo blanco con mix-blend-mode: difference (en CSS): sobre blanco
     se ve negro y sobre cada color muestra su negativo (rojo → cian,
     azul → amarillo, etc.). Sobre algo clickeable crece; al presionar se
     achica un poco, como un "clic" visual.
     `LERP` = cuánto persigue al mouse por frame (1 = pegado, 0.1 = muy lento).
     ------------------------------------------------------------------------ */
  function initCursor() {
    const cursor = $(".cursor");
    if (!cursor || !finePointer.matches) return;
    document.documentElement.classList.add("has-cursor");

    const LERP = reduceMotion ? 1 : 0.22;
    const CLICKABLE = "a, button, input, textarea, select, label, [role='button'], .panel";
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;

    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      cursor.classList.add("is-visible");
      cursor.classList.toggle("is-hover", !!e.target.closest(CLICKABLE));
    }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
    window.addEventListener("mousedown", () => cursor.classList.add("is-down"));
    window.addEventListener("mouseup", () => cursor.classList.remove("is-down"));

    const tick = () => {
      cx += (x - cx) * LERP;
      cy += (y - cy) * LERP;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ------------------------------------------------------------------------
     4. TRANSICIÓN ENTRE PÁGINAS (inicio ↔ áreas)
     Al salir: una máscara del color del área crece desde el panel (o el
     link) clickeado hasta cubrir la pantalla, y recién ahí se navega.
     Al entrar: la página arranca tapada con ese color y la máscara se
     retira hacia arriba. `WIPE_MS` controla la duración de cada mitad.
     ------------------------------------------------------------------------ */
  const PALETTE = { red: "#ff3131", blue: "#1800ad", yellow: "#ffde59", green: "#7ed957", orange: "#ff751f" };
  const WIPE_MS = 650;

  function makeWipe(color) {
    const el = document.createElement("div");
    el.className = "page-wipe";
    el.setAttribute("aria-hidden", "true");
    el.style.background = PALETTE[color] || color;
    document.body.appendChild(el);
    return el;
  }

  // fromEl: elemento desde donde crece la máscara (opcional)
  function wipeTo(href, color, fromEl) {
    if (reduceMotion) { window.location.href = href; return; }
    const wipe = makeWipe(color);
    const r = fromEl ? fromEl.getBoundingClientRect()
                     : { top: innerHeight / 2, left: innerWidth / 2, right: innerWidth / 2, bottom: innerHeight / 2 };
    const start = `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 48px)`;
    wipe.animate([{ clipPath: start }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }],
      { duration: WIPE_MS, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" })
      .finished.then(() => { window.location.href = href; });
  }

  function wipeIn(color) {
    if (reduceMotion) return;
    const wipe = makeWipe(color);
    wipe.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }],
      { duration: WIPE_MS, delay: 80, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" })
      .finished.then(() => wipe.remove());
  }

  // Si se vuelve con el botón "atrás" (bfcache), sacamos máscaras viejas
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) $$(".page-wipe").forEach(w => w.remove());
  });

  window.LU = { CONFIG, $, $$, reduceMotion, finePointer, EASE_OUT, EASE_BACK, PALETTE,
                initReveal, initBackstage, initCursor, wipeTo, wipeIn };
})();
