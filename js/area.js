/* ==========================================================================
   [Lu - cía]® — página de cada área (area.html?a=ID)
   --------------------------------------------------------------------------
   Arma todo desde SITE_CONFIG.services[...].projects (js/config.js):
   portada del área, índice de proyectos, galerías, visor a pantalla
   completa y navegación a la área anterior / siguiente.
   ========================================================================== */
(function () {
  "use strict";

  const { CONFIG, $, $$, reduceMotion, finePointer, EASE_OUT,
          initReveal, initBackstage, initCursor, initNavMenus, wipeTo, wipeIn } = window.LU; // js/common.js

  const services = CONFIG.services || [];
  const id = new URLSearchParams(location.search).get("a");
  const index = services.findIndex(s => s.id === id);

  // Área inexistente → volvemos a la grilla de áreas
  if (index < 0) { location.replace("index.html#areas"); return; }

  const area = services[index];
  const root = $("[data-area-root]");
  const pad = (n) => String(n).padStart(2, "0");
  // Escapa texto de config.js antes de meterlo en el HTML
  const esc = (str = "") => String(str).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  /* ------------------------------------------------------------------------
     1. METADATOS: título de la pestaña y descripción según el área
     ------------------------------------------------------------------------ */
  document.title = `${area.title} — [Lu - cía]® Lucía Deregibus Mongardi`;
  const desc = $('meta[name="description"]');
  if (desc) desc.setAttribute("content", `${area.title}: ${area.text}`);
  document.body.dataset.color = area.color;

  /* ------------------------------------------------------------------------
     2. MARCADO
     ------------------------------------------------------------------------ */
  // Placeholder con los signos de la marca mientras no haya imagen
  const placeholder = (label) =>
    `<span class="ph" aria-hidden="true"><span class="ph__signs"><span class="sign sign--tri"></span><span class="sign sign--circle"></span><span class="sign sign--square"></span></span><span class="ph__label">${esc(label)}</span></span>`;

  // Video: .mp4 / .webm → <video>; cualquier otra URL → iframe (YouTube/Vimeo embed)
  const videoHTML = (src, title) => /\.(mp4|webm)(\?|$)/i.test(src)
    ? `<video class="project__video" src="${esc(src)}" controls playsinline preload="metadata"></video>`
    : `<iframe class="project__video" src="${esc(src)}" title="${esc(title)}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

  const metaHTML = (p) => {
    const rows = [["Año", p.year], ["Cliente", p.client], ["Rol", p.role]].filter(([, v]) => v);
    return rows.length
      ? `<dl class="project__meta">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`
      : "";
  };

  const projects = area.projects || [];
  let flatIndex = 0; // índice global de imagen para el visor
  const allImages = [];

  /* Collage: las imágenes se superponen como piezas impresas apoyadas
     unas sobre otras (inspiración: collage de estampillas). Cada grupo de 5
     usa este molde sobre una grilla de 12 columnas; el grupo siguiente se
     apila debajo. [columna, ancho, fila, alto, giro en grados] */
  const COLLAGE = [
    [1, 6, 1, 6, -3],
    [6, 4, 2, 5, 4],
    [9, 4, 1, 4, -2.5],
    [2, 4, 6, 5, 2.5],
    [7, 5, 6, 5, -3.5]
  ];
  const BLOCK_ROWS = 10;

  /* Libro (layout: "libro", p. ej. Diseño Editorial). Referencia: cuaderno
     anillado visto desde arriba que se hojea en cortes secos (stop-motion).
     images[0] = tapa; el resto = páginas en orden, de a dos por doble
     página; al final, la contratapa. Los separadores de colores pasan del
     borde derecho al izquierdo a medida que avanzan las páginas. */
  const TAB_COLORS = ["blue", "red", "yellow", "green", "orange"];
  const pageHTML = (img, k, label) => img
    ? `<button type="button" class="book__page" data-open="${k}" aria-label="Ver en grande: ${esc(img.alt || label)}">${img.src
        ? `<img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" decoding="async">`
        : placeholder(label)}</button>`
    : `<span class="book__page book__page--blank" aria-hidden="true"></span>`;

  function bookHTML(p) {
    const imgs = (p.images || []).map((img) => { const k = flatIndex++; allImages.push({ ...img, project: p.title }); return { img, k }; });
    if (!imgs.length) return "";
    const [cover, ...pages] = imgs;
    const spreads = [];
    for (let i = 0; i < pages.length; i += 2) spreads.push([pages[i], pages[i + 1]]);
    const states = [
      `<div class="book__state book__state--cover" data-state><span class="book__half book__half--right">${pageHTML(cover.img, cover.k, "Tapa")}</span></div>`,
      ...spreads.map(([l, r], si) => `<div class="book__state" data-state>
          <span class="book__half book__half--left">${pageHTML(l.img, l.k, `Página ${si * 2 + 1}`)}</span>
          <span class="book__half book__half--right">${r ? pageHTML(r.img, r.k, `Página ${si * 2 + 2}`) : pageHTML(null)}</span>
        </div>`),
      `<div class="book__state book__state--back" data-state><span class="book__half book__half--left"><span class="book__page book__page--back" aria-hidden="true"><span class="book__mark">[Lu-]®</span></span></span></div>`
    ].join("");
    const tabs = TAB_COLORS.map((c, i) => `<span class="book__tab book__tab--${c}" style="--t:${i}" data-tab></span>`).join("");
    const rings = Array.from({ length: 9 }, () => "<i></i>").join("");
    return `<div class="book" data-book data-reveal>
        <div class="book__stage">
          <div class="book__object">
            ${states}
            <span class="book__rings" aria-hidden="true">${rings}</span>
            <span class="book__tabs" aria-hidden="true">${tabs}</span>
          </div>
        </div>
        <div class="book__controls">
          <button type="button" class="book__btn" data-book-prev aria-label="Página anterior">←</button>
          <span class="book__count" data-book-count aria-live="polite">Tapa</span>
          <button type="button" class="book__btn" data-book-next aria-label="Página siguiente">→</button>
        </div>
      </div>`;
  }

  const projectsHTML = projects.map((p, pi) => {
    const isBook = area.layout === "libro";
    const items = isBook ? "" : (p.images || []).map((img, ii) => {
      const k = flatIndex++;
      allImages.push({ ...img, project: p.title });
      const [col, span, row, rows, rot] = COLLAGE[ii % COLLAGE.length];
      const r0 = row + Math.floor(ii / COLLAGE.length) * BLOCK_ROWS;
      const inner = img.src
        ? `<img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" decoding="async">`
        : placeholder(img.caption || `Imagen ${ii + 1}`);
      return `<li class="collage__cell" data-reveal style="grid-column:${col} / span ${span};grid-row:${r0} / span ${rows};--rot:${rot}deg;--z:${ii + 1}">
          <button type="button" class="collage__card" data-open="${k}" aria-label="Ver en grande: ${esc(img.alt || img.caption || `imagen ${ii + 1}`)}">
            <span class="collage__img">${inner}</span>
            ${img.caption ? `<span class="collage__caption">${esc(img.caption)}</span>` : ""}
          </button>
        </li>`;
    }).join("");

    return `<article class="project" id="proyecto-${pi + 1}" aria-labelledby="proyecto-${pi + 1}-t">
        <header class="project__head" data-reveal>
          <span class="project__num">${pad(pi + 1)}</span>
          <h2 class="project__title" id="proyecto-${pi + 1}-t">${esc(p.title)}</h2>
          ${metaHTML(p)}
        </header>
        ${p.description ? `<p class="project__desc" data-reveal>${esc(p.description)}</p>` : ""}
        ${p.video ? `<div class="project__video-wrap" data-reveal>${videoHTML(p.video, p.title)}</div>` : ""}
        ${isBook ? bookHTML(p) : items ? `<ul class="collage" role="list">${items}</ul>` : ""}
      </article>`;
  }).join("");

  const prev = services[(index - 1 + services.length) % services.length];
  const next = services[(index + 1) % services.length];

  root.innerHTML = `
    <header class="area-hero area-hero--${area.color}">
      <div class="area-hero__top">
        <a class="area-back" href="index.html#areas" data-wipe="${area.color}">← Todas las áreas</a>
        <span class="area-hero__kicker">${pad(index + 1)} / ${pad(services.length)}</span>
      </div>
      <h1 class="area-hero__title">${esc(area.title)}</h1>
      <div class="area-hero__foot">
        <p class="area-hero__text">${esc(area.text)}</p>
        <ul class="panel__tags area-hero__tags">${(area.tags || []).map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
    </header>

    ${projects.length > 1 ? `
    <nav class="area-index" aria-label="Proyectos de ${esc(area.title)}">
      <span class="label">${pad(projects.length)} proyectos</span>
      <ol>${projects.map((p, pi) => `<li><a href="#proyecto-${pi + 1}"><span>${pad(pi + 1)}</span>${esc(p.title)}</a></li>`).join("")}</ol>
    </nav>` : ""}

    <div class="projects">
      ${projectsHTML || `<p class="area-empty">Todavía no hay proyectos cargados. Lo obvio: pronto.</p>`}
    </div>

    <nav class="area-pager" aria-label="Otras áreas">
      <a class="area-pager__link area-pager__link--${prev.color}" href="area.html?a=${prev.id}" data-wipe="${prev.color}">
        <span class="label">← Anterior</span><span class="area-pager__title">${esc(prev.title)}</span>
      </a>
      <a class="area-pager__link area-pager__link--${next.color}" href="area.html?a=${next.id}" data-wipe="${next.color}">
        <span class="label">Siguiente →</span><span class="area-pager__title">${esc(next.title)}</span>
      </a>
    </nav>`;

  /* ------------------------------------------------------------------------
     3. VISOR (lightbox) con <dialog>: foco atrapado y Esc nativos.
     Flechas ← → del teclado o botones para recorrer TODAS las imágenes
     del área, en orden. También se puede deslizar con el dedo.
     ------------------------------------------------------------------------ */
  function initLightbox() {
    const dlg = $("[data-lightbox]");
    if (!dlg || !allImages.length) return;
    const media = $("[data-lb-media]", dlg), caption = $("[data-lb-caption]", dlg), count = $("[data-lb-count]", dlg);
    let current = 0;

    const show = (k, dir = 0) => {
      current = (k + allImages.length) % allImages.length;
      const img = allImages[current];
      media.innerHTML = img.src
        ? `<img src="${esc(img.src)}" alt="${esc(img.alt)}">`
        : placeholder(img.caption || img.alt || "");
      caption.textContent = [img.project, img.caption].filter(Boolean).join(" — ");
      count.textContent = `${current + 1} / ${allImages.length}`;
      if (!reduceMotion && dir) {
        media.firstElementChild.animate(
          [{ opacity: 0, transform: `translateX(${dir * 40}px)` }, { opacity: 1, transform: "none" }],
          { duration: 450, easing: EASE_OUT });
      }
    };

    $$("[data-open]").forEach(btn => btn.addEventListener("click", () => {
      show(parseInt(btn.dataset.open, 10));
      dlg.showModal();
      document.documentElement.classList.add("lightbox-open");
    }));
    $("[data-lb-prev]", dlg).addEventListener("click", () => show(current - 1, -1));
    $("[data-lb-next]", dlg).addEventListener("click", () => show(current + 1, 1));
    $("[data-lb-close]", dlg).addEventListener("click", () => dlg.close());
    dlg.addEventListener("close", () => document.documentElement.classList.remove("lightbox-open"));
    // Clic en el fondo oscuro → cerrar
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(current - 1, -1);
      if (e.key === "ArrowRight") show(current + 1, 1);
    });
    // Deslizar en pantallas táctiles
    let x0 = null;
    dlg.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      x0 = null;
    });
  }

  /* ------------------------------------------------------------------------
     3b. COLLAGE 3D: cada pieza se inclina hacia el cursor (perspectiva) y
     pasa al frente. `TILT` = grados máximos. El giro de reposo (--rot) y
     la profundidad están en css/area.css (.collage__card).
     ------------------------------------------------------------------------ */
  function initCollageTilt() {
    if (reduceMotion || !finePointer.matches) return;
    const TILT = 12;
    $$(".collage__card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", `${(px * TILT).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${(-py * TILT).toFixed(2)}deg`);
        card.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
        card.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`);
      });
      card.addEventListener("mouseleave", () => {
        card.style.removeProperty("--rx"); card.style.removeProperty("--ry");
      });
    });
  }

  /* ------------------------------------------------------------------------
     3c. LIBRO: se hojea solo, en cortes secos como la referencia
     Tapa (quieta un rato) → dobles páginas cada `PAGE_MS` → contratapa →
     vuelve a empezar. Con el mouse encima se pausa; las flechas pasan
     página a mano. Solo corre mientras está en pantalla. Con movimiento
     reducido no se hojea solo (las flechas siguen andando).
     ------------------------------------------------------------------------ */
  function initBooks() {
    const PAGE_MS = 420, COVER_MS = 1300, BACK_MS = 1000;
    $$("[data-book]").forEach((book) => {
      const states = $$("[data-state]", book);
      const tabs = $$("[data-tab]", book);
      const count = $("[data-book-count]", book);
      const last = states.length - 1, spreads = last - 1;
      let i = 0, timer = null, visible = false, hover = false;

      const label = (n) => {
        if (n === 0) return "Tapa";
        if (n === last) return "Contratapa";
        const a = n * 2 - 1, hasRight = !!$(".book__half--right .book__page:not(.book__page--blank)", states[n]);
        return hasRight ? `Páginas ${a}–${a + 1}` : `Página ${a}`;
      };
      const show = (n) => {
        i = (n + states.length) % states.length;
        states.forEach((s, k) => s.classList.toggle("is-current", k === i));
        book.dataset.mode = i === 0 ? "cover" : i === last ? "back" : "open";
        // separadores: pasan a la izquierda a medida que se avanza
        tabs.forEach((t, k) => {
          const threshold = ((k + 1) * spreads) / (tabs.length + 1);
          t.classList.toggle("is-left", i === last || (i > 0 && i > threshold));
        });
        count.textContent = label(i);
      };
      const tick = () => {
        clearTimeout(timer);
        if (reduceMotion || !visible || hover) return;
        const wait = i === 0 ? COVER_MS : i === last ? BACK_MS : PAGE_MS;
        timer = setTimeout(() => { show(i + 1); tick(); }, wait);
      };

      $("[data-book-prev]", book).addEventListener("click", () => { show(i - 1); });
      $("[data-book-next]", book).addEventListener("click", () => { show(i + 1); });
      book.addEventListener("mouseenter", () => { hover = true; clearTimeout(timer); });
      book.addEventListener("mouseleave", () => { hover = false; tick(); });
      book.addEventListener("focusin", () => { hover = true; clearTimeout(timer); });
      book.addEventListener("focusout", () => { hover = false; tick(); });
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; tick(); }, { threshold: .35 }).observe(book);
      show(0);
    });
  }

  /* ------------------------------------------------------------------------
     4. ENTRADA DE LA PORTADA: el título sube desde una máscara
     ------------------------------------------------------------------------ */
  function animateHero() {
    if (reduceMotion) return;
    const title = $(".area-hero__title");
    title.animate([{ transform: "translateY(40%)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 1100, delay: 350, easing: EASE_OUT, fill: "backwards" });
    $$(".area-hero__foot > *").forEach((el, i) =>
      el.animate([{ transform: "translateY(20px)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 900, delay: 600 + i * 120, easing: EASE_OUT, fill: "backwards" }));
  }

  /* ------------------------------------------------------------------------
     5. LINKS CON TRANSICIÓN de color (volver / anterior / siguiente)
     ------------------------------------------------------------------------ */
  function initWipeLinks() {
    $$("[data-wipe]").forEach(a => a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // nueva pestaña: normal
      e.preventDefault();
      wipeTo(a.href, a.dataset.wipe, a);
    }));
  }

  /* ------------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------------ */
  const year = $("[data-year]"); if (year) year.textContent = new Date().getFullYear();
  wipeIn(area.color);
  initBackstage();
  initCursor();
  initNavMenus();
  initReveal();
  initLightbox();
  initCollageTilt();
  initBooks();
  initWipeLinks();
  animateHero();
})();
