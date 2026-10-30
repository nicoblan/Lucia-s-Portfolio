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
  // Encuadre opcional de una foto recortada (`pos` en config.js, ej. "50% 20%")
  const posStyle = (img) => img.pos ? ` style="object-position:${esc(img.pos)}"` : "";

  const placeholder = (label) =>
    `<span class="ph" aria-hidden="true"><span class="ph__signs"><span class="sign sign--tri"></span><span class="sign sign--circle"></span><span class="sign sign--square"></span></span><span class="ph__label">${esc(label)}</span></span>`;

  // Video: .mp4 / .webm → <video>; cualquier otra URL → iframe (YouTube/Vimeo embed)
  const videoHTML = (src, title) => /\.(mp4|webm)(\?|$)/i.test(src)
    ? `<video class="project__video" src="${esc(src)}" controls playsinline preload="metadata"></video>`
    : `<iframe class="project__video" src="${esc(src)}" title="${esc(title)}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

  const metaHTML = (p) => {
    const rows = [["Año", p.year], ["Contexto", p.client], ["Rol", p.role]].filter(([, v]) => v);
    return rows.length
      ? `<dl class="project__meta">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`
      : "";
  };

  const projects = area.projects || [];
  let flatIndex = 0; // índice global de imagen para el visor
  const allImages = [];

  /* Collage: las imágenes se superponen unas sobre otras, derechas y sin
     marco, en una grilla de 24 columnas. Se arman grupos de 3 a 5 fotos
     (parejos: 7 → 4 + 3, 6 → 3 + 3) y cada grupo se apila debajo del
     anterior, con los escalones al revés para no repetirse (el orden de
     lectura siempre es de izquierda a derecha). Cada foto ocupa un recuadro con
     su forma: vertical (por defecto) u horizontal (`forma: "h"` en config.js).
     Sirve para cualquier cantidad de fotos.
     Devuelve, por foto: [columna, ancho, fila, alto] */
  const COLS = 24;
  const CELL = { v: [6, 8], h: [10, 5] };  // [columnas, filas] de cada forma
  const DROP = [0, 2, 1, 3, 1];            // escalón vertical de cada foto del grupo
  function collageLayout(images) {
    const n = images.length, groups = Math.ceil(n / 5), out = [];
    let start = 0, top = 1;
    for (let g = 0; g < groups; g++) {
      const size = Math.ceil((n - start) / (groups - g));
      let shapes = images.slice(start, start + size).map((img) => CELL[img.forma === "h" ? "h" : "v"]);
      // Los recuadros crecen (pocas fotos) o se achican (muchas) para que
      // el grupo llene el ancho pisándose apenas: 1 columna entre foto y foto
      const sum = shapes.reduce((s, [c]) => s + c, 0);
      const k = Math.min(1.35, (COLS + size - 1) / sum);
      shapes = shapes.map(([c, r]) => [Math.floor(c * k), Math.round(r * k)]);
      const total = shapes.reduce((s, [c]) => s + c, 0);
      const gap = size > 1 ? Math.min(0, (COLS - total) / (size - 1)) : 0;
      // grupos impares: escalones invertidos, para no repetir el dibujo;
      // el más alto del grupo arranca justo debajo del grupo anterior
      const drops = shapes.map((_, i) => g % 2 ? 3 - DROP[i % DROP.length] : DROP[i % DROP.length]);
      const lift = Math.min(...drops);
      let x = Math.max(0, (COLS - total - gap * (size - 1)) / 2), bottom = 0;
      shapes.forEach(([cols, rows], i) => {
        const col = Math.round(x) + 1;
        const row = top + drops[i] - lift;
        out.push([col, cols, row, rows]);
        bottom = Math.max(bottom, row + rows);
        x += cols + gap;
      });
      top = bottom; start += size;
    }
    return out;
  }

  /* Video (layout: "video", Fashion Films): cada proyecto muestra su video
     en formato horizontal 16:9, con botón de pantalla completa. Si todavía
     no hay video, un placeholder 16:9. Las imágenes del proyecto se muestran
     debajo como fotogramas horizontales. */
  function videoProjectHTML(p) {
    const player = p.video
      ? videoHTML(p.video, p.title)
      : `<span class="vplayer__empty">${placeholder("Video próximamente")}</span>`;
    const stills = (p.images || []).map((img, ii) => {
      const k = flatIndex++;
      allImages.push({ ...img, project: p.title });
      return `<li><button type="button" class="vstill" data-open="${k}" aria-label="Ver en grande: ${esc(img.alt || `fotograma ${ii + 1}`)}">${img.src
        ? `<img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" decoding="async">`
        : placeholder(img.caption || `Fotograma ${ii + 1}`)}</button></li>`;
    }).join("");
    return `<div class="vplayer" data-vplayer data-reveal>
        <div class="vplayer__frame">${player}</div>
        ${p.video ? `<button type="button" class="vplayer__full" data-fullscreen aria-label="Ver ${esc(p.title)} en pantalla completa"><span aria-hidden="true">⤢</span> Pantalla completa</button>` : ""}
      </div>
      ${stills ? `<ul class="vstills${p.images.length === 4 ? " vstills--4" : ""}" role="list">${stills}</ul>` : ""}`;
  }

  /* Libro (layout: "libro", p. ej. Trendforecast). Referencia: sketchbook
     de tapa de cartón sobre fondo negro, con collages en cada página, que se
     hojea dando vuelta las hojas en 3D. La tapa es de cartón con el título
     del proyecto; las imágenes son las páginas en orden (de a dos por doble
     página) y al final se cierra con la contratapa.
     Cada hoja (.book__leaf) tiene frente y dorso: la tapa, las páginas y la
     contratapa se reparten de a dos caras por hoja. */
  const TAPES = ["red", "yellow", "blue", "green", "orange"];
  const faceHTML = (img, k, label, n) => img
    ? `<button type="button" class="book__page" data-open="${k}" style="--tape:var(--${TAPES[n % TAPES.length]})" aria-label="Ver en grande: ${esc(img.alt || label)}">
        <span class="book__pic">${img.src
          ? `<img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" decoding="async">`
          : placeholder(label)}</span></button>`
    : `<span class="book__page book__page--blank" aria-hidden="true"></span>`;

  function bookHTML(p) {
    const pages = (p.images || []).map((img) => { const k = flatIndex++; allImages.push({ ...img, project: p.title }); return { img, k }; });
    if (!pages.length) return "";
    const faces = [
      `<span class="book__cover" aria-hidden="true"><span class="book__label">${esc(p.title)}</span></span>`,
      ...pages.map(({ img, k }, n) => faceHTML(img, k, `Página ${n + 1}`, n))
    ];
    // la contratapa tiene que caer en el dorso de la última hoja
    if (faces.length % 2 === 0) faces.push(faceHTML(null));
    faces.push(`<span class="book__cover book__cover--back" aria-hidden="true"><span class="book__mark">[Lu-]®</span></span>`);
    const leaves = [];
    for (let i = 0; i < faces.length; i += 2) leaves.push(`<div class="book__leaf" data-leaf>
          <div class="book__face book__face--front">${faces[i]}</div>
          <div class="book__face book__face--back">${faces[i + 1]}</div>
        </div>`);
    // `pageRatio` (ancho ÷ alto de una página) da la forma del cuaderno
    const ratio = +p.pageRatio > 0 ? +p.pageRatio : 0.75;
    return `<div class="book${p.pdf ? " book--pdf" : ""}" data-book data-pages="${pages.length}" style="--pr:${ratio}" data-reveal>
        <div class="book__stage">
          <div class="book__object">${leaves.join("")}</div>
        </div>
        <div class="book__controls">
          <button type="button" class="book__btn" data-book-prev aria-label="Página anterior">←</button>
          <span class="book__count" data-book-count aria-live="polite">Tapa</span>
          <button type="button" class="book__btn" data-book-next aria-label="Página siguiente">→</button>
        </div>
        <p class="book__hint">Deslizá sobre el cuaderno: ← abre · cierra →</p>
      </div>`;
  }

  const projectsHTML = projects.map((p, pi) => {
    const isBook = area.layout === "libro", isVideo = area.layout === "video";
    const layout = isBook || isVideo ? [] : collageLayout(p.images || []);
    const items = isBook || isVideo ? "" : (p.images || []).map((img, ii) => {
      const k = flatIndex++;
      allImages.push({ ...img, project: p.title });
      const [col, span, row, rows] = layout[ii];
      const inner = img.src
        ? `<img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" decoding="async"${posStyle(img)}>`
        : placeholder(img.caption || `Imagen ${ii + 1}`);
      return `<li class="collage__cell" data-reveal style="grid-column:${col} / span ${span};grid-row:${row} / span ${rows};--rot:0deg;--z:${ii + 1}">
          <button type="button" class="collage__card" data-open="${k}" aria-label="Ver en grande: ${esc(img.alt || img.caption || `imagen ${ii + 1}`)}">
            <span class="collage__img">${inner}</span>
            ${img.caption ? `<span class="collage__caption">${esc(img.caption)}</span>` : ""}
          </button>
        </li>`;
    }).join("");

    return `<article class="project" id="proyecto-${pi + 1}" aria-labelledby="proyecto-${pi + 1}-t">
        <header class="project__head" data-reveal>
          <span class="project__num">${pad(pi + 1)}</span>
          <h2 class="project__title" id="proyecto-${pi + 1}-t">${esc(p.title)}${p.etiqueta ? ` <span class="project__tag">${esc(p.etiqueta)}</span>` : ""}</h2>
          ${metaHTML(p)}
        </header>
        ${p.description ? `<p class="project__desc" data-reveal>${esc(p.description)}</p>` : ""}
        ${p.pdf ? `<p class="project__pdf" data-reveal><a class="cv-btn" href="${esc(p.pdf)}" download>
            <span class="cv-btn__text">Descargar PDF</span><span class="cv-btn__icon" aria-hidden="true">↓</span>
            <span class="visually-hidden">— ${esc(p.title)}</span></a></p>` : ""}
        ${p.video && !isVideo ? `<div class="project__video-wrap" data-reveal>${videoHTML(p.video, p.title)}</div>` : ""}
        ${isVideo ? videoProjectHTML(p) : isBook ? bookHTML(p) : items ? `<ul class="collage" role="list">${items}</ul>` : ""}
      </article>`;
  }).join("");

  /* Resumen al final: carrusel con una tarjeta por trabajo (imagen, título
     y `resumen` del proyecto en config.js). Clic → va a ese proyecto. */
  const summaryHTML = projects.length ? `
    <section class="recap" aria-labelledby="recap-title" data-recap>
      <div class="recap__head">
        <h2 class="label" id="recap-title">R E S U M E N &nbsp; .</h2>
        <div class="recap__nav">
          <button type="button" class="book__btn" data-recap-prev aria-label="Anterior">←</button>
          <button type="button" class="book__btn" data-recap-next aria-label="Siguiente">→</button>
        </div>
      </div>
      <ul class="recap__track" data-recap-track role="list">
        ${projects.map((p, pi) => {
          const first = (p.images || [])[0];
          // sin imágenes pero con un .mp4: un fotograma del video (a los 5 s)
          const thumb = first && first.src ? `<img src="${esc(first.src)}" alt="" loading="lazy" decoding="async"${posStyle({ pos: p.portadaPos || first.pos })}>`
            : /\.(mp4|webm)$/i.test(p.video || "") ? `<video src="${esc(p.video)}#t=5" muted playsinline preload="metadata" aria-hidden="true"></video>`
            : placeholder(pad(pi + 1));
          const text = p.resumen || (p.description || "").slice(0, 110);
          return `<li class="recap__card">
            <a href="#proyecto-${pi + 1}" class="recap__link">
              <span class="recap__thumb">${thumb}</span>
              <span class="recap__num">${pad(pi + 1)}</span>
              <span class="recap__title">${esc(p.title)}</span>
              ${text ? `<span class="recap__text">${esc(text)}</span>` : ""}
            </a>
          </li>`;
        }).join("")}
      </ul>
    </section>` : "";

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

    ${summaryHTML}

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
     3c. LIBRO: se hojea solo, dando vuelta las hojas como la referencia
     Tapa (quieta un rato) → una hoja cada `PAGE_MS` → contratapa → se cierra
     y vuelve a empezar. Con el mouse encima se pausa y se hojea moviendo el
     cursor (derecha → izquierda abre, izquierda → derecha cierra); las
     flechas también pasan página. Solo corre mientras está en pantalla.
     Con movimiento reducido no se hojea solo. El giro de cada hoja lo anima
     el CSS (`FLIP_MS` tiene que coincidir con la transición de .book__leaf).
     ------------------------------------------------------------------------ */
  function initBooks() {
    const PAGE_MS = 1150, COVER_MS = 1500, BACK_MS = 1400, FLIP_MS = 900;
    $$("[data-book]").forEach((book) => {
      const leaves = $$("[data-leaf]", book);
      const count = $("[data-book-count]", book);
      const total = +book.dataset.pages;
      const last = leaves.length; // estados: 0 = tapa … last = contratapa
      let i = 0, timer = null, visible = false, hover = false;

      const label = (n) => {
        if (n === 0) return "Tapa";
        if (n === last) return "Contratapa";
        const a = n * 2 - 1, b = Math.min(a + 1, total);
        return a >= b ? `Página ${a}` : `Páginas ${a}–${b}`;
      };
      // Orden de apilado: las hojas dadas vuelta, de abajo hacia arriba a la
      // izquierda; las que faltan, al revés a la derecha. La hoja que gira
      // va arriba de todo mientras dura el giro.
      const stack = () => leaves.forEach((l, k) => {
        if (!l.classList.contains("is-moving")) l.style.zIndex = k < i ? k + 1 : last - k;
      });
      const show = (n, wrap = false) => {
        const next = wrap ? (n + last + 1) % (last + 1) : Math.max(0, Math.min(last, n));
        if (next === i) return;
        const forward = next > i;
        const moving = forward ? leaves.slice(i, next) : leaves.slice(next, i).reverse();
        i = next;
        moving.forEach((l, d) => {
          l.classList.add("is-moving");
          l.style.zIndex = last + 10 + d;
          l.style.transitionDelay = `${d * 70}ms`;
          clearTimeout(l._t);
          l._t = setTimeout(() => { l.classList.remove("is-moving"); l.style.transitionDelay = ""; stack(); }, FLIP_MS + d * 70);
        });
        leaves.forEach((l, k) => l.classList.toggle("is-turned", k < i));
        stack();
        book.dataset.mode = i === 0 ? "cover" : i === last ? "back" : "open";
        count.textContent = label(i);
      };
      const tick = () => {
        clearTimeout(timer);
        if (reduceMotion || !visible || hover) return;
        const wait = i === 0 ? COVER_MS : i === last ? BACK_MS : PAGE_MS;
        timer = setTimeout(() => { show(i + 1, true); tick(); }, wait);
      };

      $("[data-book-prev]", book).addEventListener("click", () => { show(i - 1); });
      $("[data-book-next]", book).addEventListener("click", () => { show(i + 1); });

      /* Hojear con el cursor (o el dedo): mover de DERECHA a IZQUIERDA abre
         (avanza páginas); de IZQUIERDA a DERECHA cierra (vuelve hacia la
         tapa). Cuenta el desplazamiento acumulado: cada `step` píxeles es
         una hoja. No da la vuelta: frena en la tapa y en la contratapa. */
      const stage = $(".book__stage", book);
      let lastX = null, acc = 0;
      const step = () => Math.max(40, stage.clientWidth / (last + 3));
      stage.addEventListener("pointermove", (e) => {
        if (e.pointerType === "mouse" && !finePointer.matches) return;
        if (lastX === null) { lastX = e.clientX; return; }
        acc += lastX - e.clientX; // positivo = hacia la izquierda
        lastX = e.clientX;
        const s = step();
        while (acc >= s && i < last) { acc -= s; show(i + 1); }
        while (acc <= -s && i > 0) { acc += s; show(i - 1); }
        if ((i === last && acc > 0) || (i === 0 && acc < 0)) acc = 0;
      });
      const resetDrag = () => { lastX = null; acc = 0; };
      stage.addEventListener("pointerleave", resetDrag);
      stage.addEventListener("pointerup", resetDrag);
      stage.addEventListener("pointercancel", resetDrag);
      book.addEventListener("mouseenter", () => { hover = true; clearTimeout(timer); });
      book.addEventListener("mouseleave", () => { hover = false; tick(); });
      book.addEventListener("focusin", () => { hover = true; clearTimeout(timer); });
      book.addEventListener("focusout", () => { hover = false; tick(); });
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; tick(); }, { threshold: .35 }).observe(book);
      stack();
      book.dataset.mode = "cover";
    });
  }

  /* ------------------------------------------------------------------------
     3d. VIDEOS: botón de pantalla completa
     Con un .mp4 usa el video (en iPhone, su modo de pantalla completa
     propio); con YouTube/Vimeo pone en pantalla completa el recuadro.
     ------------------------------------------------------------------------ */
  function initVideos() {
    $$("[data-vplayer]").forEach((box) => {
      const btn = $("[data-fullscreen]", box);
      if (!btn) return;
      btn.addEventListener("click", () => {
        const video = $("video", box), frame = $(".vplayer__frame", box);
        if (video && video.webkitEnterFullscreen && !video.requestFullscreen) return video.webkitEnterFullscreen();
        const el = video || frame;
        (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el);
      });
    });
  }

  /* ------------------------------------------------------------------------
     3e. RESUMEN EN CARRUSEL (al final de cada área)
     Tarjetas en fila con scroll horizontal y "imán" (scroll-snap); las
     flechas avanzan de a una tarjeta. Se puede arrastrar con el dedo o
     con el trackpad.
     ------------------------------------------------------------------------ */
  function initRecap() {
    const recap = $("[data-recap]");
    if (!recap) return;
    const track = $("[data-recap-track]", recap);
    const step = () => { const c = $(".recap__card", track); return c ? c.getBoundingClientRect().width + 14 : 300; };
    $("[data-recap-prev]", recap).addEventListener("click", () => track.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }));
    $("[data-recap-next]", recap).addEventListener("click", () => track.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }));
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
  initVideos();
  initRecap();
  initWipeLinks();
  animateHero();
})();
