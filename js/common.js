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
     Al salir: un círculo del color del área crece desde donde se hizo
     clic (o desde el centro del panel/link) hasta cubrir la pantalla, y
     recién ahí se navega.
     Al entrar: el color se desvanece (sin cortina) mientras el contenido
     sube apenas y aparece. Se siente más liviano que un barrido.
     `WIPE_MS` = salida; `IN_MS` = entrada; `EASE_ORGANIC` = curva suave
     (igual que --ease-organic en CSS).
     ------------------------------------------------------------------------ */
  const PALETTE = { red: "#ff3131", blue: "#1800ad", yellow: "#ffde59", green: "#7ed957", orange: "#ff751f" };
  const WIPE_MS = 700, IN_MS = 650;
  const EASE_ORGANIC = "cubic-bezier(.45,0,.15,1)";

  // Último punto donde se hizo clic/toque: de ahí nace el círculo
  let lastPoint = null;
  window.addEventListener("pointerdown", (e) => { lastPoint = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { passive: true });

  function makeWipe(color) {
    const el = document.createElement("div");
    el.className = "page-wipe";
    el.setAttribute("aria-hidden", "true");
    el.style.background = PALETTE[color] || color;
    document.body.appendChild(el);
    return el;
  }

  // fromEl: elemento clickeado (si no hubo clic reciente, el círculo sale de su centro)
  function wipeTo(href, color, fromEl) {
    if (reduceMotion) { window.location.href = href; return; }
    const wipe = makeWipe(color);
    let x = innerWidth / 2, y = innerHeight / 2;
    if (lastPoint && performance.now() - lastPoint.t < 800) { x = lastPoint.x; y = lastPoint.y; }
    else if (fromEl) { const r = fromEl.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    // radio hasta la esquina más lejana: cubre toda la pantalla justo al final
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    wipe.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${radius}px at ${x}px ${y}px)` }],
      { duration: WIPE_MS, easing: EASE_ORGANIC, fill: "forwards" })
      .finished.then(() => { window.location.href = href; });
  }

  function wipeIn(color) {
    if (reduceMotion) return;
    const wipe = makeWipe(color);
    wipe.animate([{ opacity: 1 }, { opacity: 0 }],
      { duration: IN_MS, delay: 60, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" })
      .finished.then(() => wipe.remove());
    const main = $("main");
    if (main) main.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }],
      { duration: IN_MS + 300, delay: 60, easing: EASE_ORGANIC, fill: "backwards" });
  }

  /* ------------------------------------------------------------------------
     5. MENÚS DESPLEGABLES DEL NAV (Áreas y About)
     Al pasar el cursor (o llegar con Tab) por "Áreas" o "About" se
     despliega hacia abajo la lista de sus secciones con un subtítulo.
     - Áreas: sale de SITE_CONFIG.services (title + subtitle) y lleva a la
       página de cada área con la transición de color.
     - About: lista fija de abajo (ABOUT_ITEMS), con anclas del index.
     La apertura es CSS (:hover / :focus-within); en celular no se muestra.
     ------------------------------------------------------------------------ */
  const ABOUT_ITEMS = [
    { href: "#quien-soy",  title: "Quién soy",   subtitle: "Yo soy mi nombre",                   color: "red" },
    { href: "#manifiesto", title: "Manifiesto",  subtitle: "Lo evidente me interesa demasiado",  color: "yellow" },
    { href: "#conceptos",  title: "Conceptos",   subtitle: "Volver a lo básico · Ironía · Sistema", color: "green" }
  ];

  function initNavMenus() {
    const onIndex = !!document.getElementById("about"); // en area.html las anclas van a index.html
    const esc = (str = "") => String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

    const build = (li, items, label) => {
      const sub = document.createElement("div");
      sub.className = "nav__sub";
      sub.innerHTML = `<ul aria-label="${label}">${items.map((it, i) => `
        <li style="--i:${i}">
          <a href="${it.href}"${it.color && it.wipe ? ` data-color="${it.color}"` : ""}>
            <span class="nav__sub-dot" aria-hidden="true"${it.color ? ` style="background:${PALETTE[it.color]}"` : ""}></span>
            <span class="nav__sub-text"><span class="nav__sub-title">${esc(it.title)}</span><span class="nav__sub-subtitle">${esc(it.subtitle)}</span></span>
          </a>
        </li>`).join("")}</ul>`;
      li.classList.add("has-sub");
      li.appendChild(sub);
      return sub;
    };

    const areasLi = $('[data-menu="areas"]');
    if (areasLi) {
      const sub = build(areasLi, (CONFIG.services || []).map(s => ({
        href: `area.html?a=${s.id}`, title: s.title, subtitle: s.subtitle || "", color: s.color, wipe: true
      })), "Áreas");
      $$("a[data-color]", sub).forEach(a => a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        wipeTo(a.getAttribute("href"), a.dataset.color, a);
      }));
    }
    const aboutLi = $('[data-menu="about"]');
    if (aboutLi) {
      build(aboutLi, ABOUT_ITEMS.map(it => ({ ...it, href: (onIndex ? "" : "index.html") + it.href })), "About");
    }
    // Al elegir una opción, el menú se cierra aunque el cursor siga encima
    $$(".nav__sub a").forEach(a => a.addEventListener("click", () => {
      const li = a.closest(".has-sub");
      li.classList.add("is-closing");
      a.blur();
      li.addEventListener("mouseleave", () => li.classList.remove("is-closing"), { once: true });
    }));
  }

  // Si se vuelve con el botón "atrás" (bfcache), sacamos máscaras viejas
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) $$(".page-wipe").forEach(w => w.remove());
  });

  window.LU = { CONFIG, $, $$, reduceMotion, finePointer, EASE_OUT, EASE_BACK, PALETTE,
                initReveal, initBackstage, initCursor, initNavMenus, wipeTo, wipeIn };
})();
