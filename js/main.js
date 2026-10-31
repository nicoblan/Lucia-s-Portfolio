/* ==========================================================================
   [Lu - cía]® — interacciones y movimiento
   --------------------------------------------------------------------------
   Vanilla JS, sin dependencias. Animaciones con la Web Animations API
   (element.animate) e IntersectionObserver. Cada bloque está separado y
   comentado para poder ajustar tiempos, curvas y distancias.
   ========================================================================== */
(function () {
  "use strict";

  const { CONFIG, $, $$, reduceMotion, finePointer, EASE_OUT, EASE_BACK,
          initReveal, initBackstage, initCursor, initNavMenus, wipeTo } = window.LU; // js/common.js

  /* ------------------------------------------------------------------------
     1. LOGO: las piezas entran por separado y se ensamblan
     Orden: corchetes → "Lu" → guión → "cía" → ®
     Para cambiar el ritmo, tocá `delay` y `duration` de cada pieza.
     Nota: el keyframe final repite la transformación base del CSS
     (scaleY de los corchetes, skew de "cía") para que no "salte" al terminar.
     ------------------------------------------------------------------------ */
  function animateLogo() {
    const logo = $("[data-logo]");
    if (!logo) return Promise.resolve();
    const piece = (name) => $(`[data-piece="${name}"]`, logo);

    const steps = [
      // Corchete izquierdo: llega desde la izquierda, girando
      { el: piece("bl"), delay: 100, duration: 900, easing: EASE_OUT, keyframes: [
        { opacity: 0, transform: "translateX(-40vw) rotate(-90deg) scaleY(1.18)" },
        { opacity: 1, transform: "translateX(0) rotate(0) scaleY(1.18)" } ] },
      // Corchete derecho: espejo del izquierdo
      { el: piece("br"), delay: 100, duration: 900, easing: EASE_OUT, keyframes: [
        { opacity: 0, transform: "translateX(40vw) rotate(90deg) scaleY(1.18)" },
        { opacity: 1, transform: "translateX(0) rotate(0) scaleY(1.18)" } ] },
      // "Lu": cae como un bloque de presencia
      { el: piece("lu"), delay: 650, duration: 800, easing: EASE_BACK, keyframes: [
        { opacity: 0, transform: "translateY(-80%) scale(.6)" },
        { opacity: 1, transform: "translateY(0) scale(1)" } ] },
      // Guión: la interrupción. Crece de 0 y se pasa un poco
      { el: piece("dash"), delay: 1050, duration: 650, easing: EASE_BACK, keyframes: [
        { opacity: 0, transform: "scaleX(0)" },
        { opacity: 1, transform: "scaleX(1)" } ] },
      // "cía": entra desde la derecha y termina inclinada
      { el: piece("cia"), delay: 1250, duration: 900, easing: EASE_OUT, keyframes: [
        { opacity: 0, transform: "translateX(30%) skewX(-30deg)" },
        { opacity: 1, transform: "translateX(0) skewX(-6deg)" } ] },
      // ®: aparece al final, como una firma
      { el: piece("r"), delay: 1800, duration: 500, easing: EASE_BACK, keyframes: [
        { opacity: 0, transform: "scale(0) rotate(-180deg)" },
        { opacity: 1, transform: "scale(1) rotate(0)" } ] }
    ];

    const anims = steps.filter(s => s.el).map(s =>
      s.el.animate(s.keyframes, { delay: s.delay, duration: s.duration, easing: s.easing, fill: "both" })
    );
    return Promise.all(anims.map(a => a.finished));
  }

  /* ------------------------------------------------------------------------
     2. HERO: entrada escalonada del nombre y las píldoras
     Las palabras suben desde una máscara; las píldoras se estiran (scaleX).
     `stagger` = separación entre elementos en ms.
     ------------------------------------------------------------------------ */
  function animateHero() {
    const stagger = 140;
    const startAt = 700; // arranca mientras el logo se termina de armar

    $$("[data-word]").forEach((w, i) => {
      w.animate(
        [{ opacity: 1, transform: "translateY(105%)" }, { opacity: 1, transform: "translateY(0)" }],
        { delay: startAt + i * stagger, duration: 1100, easing: EASE_OUT, fill: "both" }
      );
    });

    $$("[data-pill]").forEach((p, i) => {
      p.animate(
        [{ opacity: 1, transform: "scaleX(0)" }, { opacity: 1, transform: "scaleX(1)" }],
        { delay: startAt + 300 + i * stagger, duration: 1200, easing: EASE_OUT, fill: "both" }
      );
    });

    $$("[data-hero-fade]").forEach((el, i) => {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { delay: 1600 + i * 200, duration: 800, fill: "both" });
    });

    // Las fotos del hero entran desde abajo con un recorte (clip-path)
    $$(".hero__gallery .shot").forEach((s, i) => {
      s.animate(
        [{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
        { delay: 1400 + i * 160, duration: 1200, easing: "cubic-bezier(.76,0,.24,1)", fill: "backwards" }
      );
    });
  }

  /* ------------------------------------------------------------------------
     3. PARALLAX suave para elementos con [data-speed]
     speed > 0 se mueve más lento que el scroll; < 0 va en contra.
     Un solo requestAnimationFrame por frame para todo el sitio.
     ------------------------------------------------------------------------ */
  const scrollHandlers = [];
  function onScrollFrame(fn) { scrollHandlers.push(fn); }

  function initScrollLoop() {
    let ticking = false;
    const run = () => {
      const y = window.scrollY;
      scrollHandlers.forEach(fn => fn(y));
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(run); }
    }, { passive: true });
    run();
  }

  function initParallax() {
    const items = $$("[data-speed]");
    onScrollFrame(() => {
      const vh = window.innerHeight;
      items.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return; // fuera de pantalla: no calcular
        const speed = parseFloat(el.dataset.speed) || 0;
        const offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. ÁREAS: paneles generados desde SITE_CONFIG.services
     Se abren con hover (mouse) o con clic/toque; uno abierto a la vez.
     Clic sobre un panel ya abierto (o en "Ver todo") → página del área
     (area.html?a=ID) con una transición del color del panel.
     ------------------------------------------------------------------------ */
  function placeholderSigns() {
    return '<div class="panel__placeholder" aria-hidden="true"><div>' +
      '<span class="sign sign--tri"></span><span class="sign sign--circle"></span><span class="sign sign--square"></span>' +
      "</div></div>";
  }

  function renderPanels() {
    const wrap = $("[data-panels]");
    if (!wrap) return;
    (CONFIG.services || []).forEach((s) => {
      const panel = document.createElement("article");
      panel.className = `panel panel--${s.color}`;
      panel.dataset.reveal = "";
      const media = s.image
        ? `<figure class="panel__media"><img src="${s.image}" alt="${s.imageAlt || ""}" loading="lazy"${s.imagePos ? ` style="object-position:${s.imagePos}"` : ""}></figure>`
        : `<figure class="panel__media">${placeholderSigns()}<figcaption class="visually-hidden">${s.imageAlt || ""}</figcaption></figure>`;
      panel.innerHTML = `
        <button type="button" class="panel__btn" aria-expanded="false" aria-controls="panel-${s.id}">
          <span class="panel__kicker">${s.kicker}</span>
          <h3 class="panel__title">${s.title}</h3>
        </button>
        <div class="panel__body" id="panel-${s.id}">
          <div>
            <p class="panel__text">${s.text}</p>
            <ul class="panel__tags">${(s.tags || []).map(t => `<li>${t}</li>`).join("")}</ul>
            <a class="panel__more" href="area.html?a=${s.id}" data-area-link>Ver todo<span class="visually-hidden"> el contenido de ${s.title}</span> <span aria-hidden="true">→</span></a>
          </div>
          ${media}
        </div>`;
      wrap.appendChild(panel);
    });

    // Apertura básica: un panel abierto a la vez (el primero, por defecto)
    const panels = $$(".panel", wrap);
    const open = (target) => {
      panels.forEach((p) => {
        const isTarget = p === target;
        const body = $(".panel__body", p);
        p.classList.toggle("is-open", isTarget);
        $(".panel__btn", p).setAttribute("aria-expanded", String(isTarget));
        // al cerrar, se oculta recién cuando terminó de desvanecerse (CSS)
        clearTimeout(body._hideTimer);
        if (isTarget) body.hidden = false;
        else if (!body.hidden) body._hideTimer = setTimeout(() => { body.hidden = true; }, 460);
      });
    };
    // Ancho del panel abierto (flex-grow 5 contra 1 de los demás), para que
    // su contenido tenga ese ancho desde el principio y no se reacomode
    const setOpenWidth = () => {
      const cs = getComputedStyle(wrap);
      const inner = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const gaps = (parseFloat(cs.columnGap) || 0) * (panels.length - 1);
      wrap.style.setProperty("--open-w", `${(inner - gaps) * 5 / (5 + panels.length - 1)}px`);
    };
    setOpenWidth();
    window.addEventListener("resize", setOpenWidth);
    const services = CONFIG.services || [];
    const goTo = (p, e) => {
      const s = services[panels.indexOf(p)];
      if (e && (e.metaKey || e.ctrlKey || e.shiftKey)) return; // nueva pestaña: comportamiento normal
      if (e) e.preventDefault();
      wipeTo(`area.html?a=${s.id}`, s.color, p);
    };
    panels.forEach((p) => {
      $(".panel__btn", p).addEventListener("click", () => {
        if (p.classList.contains("is-open")) goTo(p); else open(p);
      });
      $("[data-area-link]", p).addEventListener("click", (e) => goTo(p, e));
      // Con mouse, el panel se abre solo al pasar por encima.
      // Usamos mousemove (y no mouseenter) porque al abrirse un panel los
      // demás se corren: con mouseenter el panel que queda bajo el puntero
      // quieto se abriría solo y entrarían en cadena. mousemove solo
      // dispara si la persona realmente mueve el mouse.
      // Un pequeño retardo evita que se abran todos al cruzar la fila rápido.
      let hoverTimer;
      p.addEventListener("mousemove", () => {
        if (!finePointer.matches || p.classList.contains("is-open") || hoverTimer) return;
        hoverTimer = setTimeout(() => { hoverTimer = null; open(p); }, 140);
      });
      p.addEventListener("mouseleave", () => { clearTimeout(hoverTimer); hoverTimer = null; });
    });
    if (panels[0]) open(panels[0]);
  }

  /* ------------------------------------------------------------------------
     5. CONTACTO: redes desde config + acordeón accesible
     ------------------------------------------------------------------------ */
  function renderSocials() {
    const list = $("[data-options]");
    if (!list) return;
    const colors = ["blue", "green", "orange"];
    // Las redes que todavía tienen el placeholder "USUARIO" no se muestran
    (CONFIG.socials || []).filter(s => s.url && !s.url.includes("USUARIO")).forEach((s, k) => {
      const li = document.createElement("li");
      li.className = `option option--${colors[k % colors.length]}`;
      li.innerHTML = `
        <h3><a class="option__link" href="${s.url}" target="_blank" rel="noopener noreferrer">
          <span class="option__num">0${k + 2}</span><span class="option__label">${s.label}</span>
          <span class="option__arrow" aria-hidden="true">→</span>
          <span class="visually-hidden">(se abre en una pestaña nueva)</span>
        </a></h3>`;
      list.appendChild(li);
    });
  }

  function initAccordion() {
    $$(".option__btn").forEach((btn) => {
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. NAV: marca la sección visible
     ------------------------------------------------------------------------ */
  function initNav() {
    const links = $$(".nav__list > li > a");
    const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const link = map.get(e.target.id);
        if (link && e.isIntersecting) {
          links.forEach(l => { l.classList.remove("is-current"); l.removeAttribute("aria-current"); });
          link.classList.add("is-current");
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach(s => io.observe(s));
  }

  /* ------------------------------------------------------------------------
     7. MANIFIESTO: toggle Resumen / Completo con revelado palabra por palabra
     Los párrafos con [data-split] se cortan en <span> por palabra la primera
     vez. Al mostrarse, cada palabra sube y aparece con un pequeño retardo.
     `WORD_DELAY` = ms entre palabras; `MAX_TOTAL` limita la duración total.
     ------------------------------------------------------------------------ */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="split-word">${w}</span>`).join(" ");
    el.dataset.splitDone = "1";
  }

  function revealWords(container) {
    if (reduceMotion) return;
    const WORD_DELAY = 22, MAX_TOTAL = 1800;
    const words = $$(".split-word", container);
    const step = Math.min(WORD_DELAY, MAX_TOTAL / Math.max(words.length, 1));
    words.forEach((w, i) => {
      w.animate(
        [{ opacity: 0, transform: "translateY(.55em)", filter: "blur(4px)" },
         { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }],
        { delay: i * step, duration: 600, easing: EASE_OUT, fill: "backwards" }
      );
    });
  }

  function initManifesto() {
    const btns = $$("[data-manifesto]");
    const panels = $$("[data-manifesto-panel]");
    if (!btns.length) return;
    $$("[data-split]").forEach(splitWords);

    btns.forEach((btn) => btn.addEventListener("click", () => {
      const which = btn.dataset.manifesto;
      if (btn.getAttribute("aria-pressed") === "true") return;
      btns.forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
      panels.forEach((p) => {
        const show = p.dataset.manifestoPanel === which;
        p.hidden = !show;
        if (show) {
          if (which === "summary" && !reduceMotion) {
            p.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }],
              { duration: 700, easing: EASE_OUT });
          } else {
            revealWords(p);
          }
        }
      });
    }));
  }

  /* ------------------------------------------------------------------------
     8. INCLINACIÓN con el mouse para [data-tilt]
     `MAX_TILT` = grados máximos. La imagen interior se corre un poco en
     sentido contrario para dar profundidad.
     ------------------------------------------------------------------------ */
  function initTilt() {
    if (reduceMotion || !finePointer.matches) return;
    const MAX_TILT = 6;
    $$("[data-tilt]").forEach((el) => {
      const img = $("img", el);
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;  // -0.5 … 0.5
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = "transform .15s ease-out";
        el.style.transform = `perspective(900px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg)`;
        if (img) img.style.transform = `scale(1.04) translate(${(-px * 10).toFixed(1)}px, ${(-py * 10).toFixed(1)}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform .8s cubic-bezier(.16,1,.3,1)";
        el.style.transform = "";
        if (img) img.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. LOGO EN VARIANTES (tarjeta identitaria, comienzo de Contacto)
     Pasa sola a la siguiente variante del PDF cada `AUTO_MS` ms: negro con
     logo a color, y azul / rojo / verde con logo blanco. Un clic también
     la cambia (y reinicia el reloj). El nuevo color entra como un círculo
     que se expande desde el punto del clic (en automático, desde un punto
     al azar). El cambio automático se frena si la tarjeta no está en
     pantalla, si la pestaña está oculta o si se pausó el movimiento con el
     botón amarillo del menú. Con movimiento reducido no cambia sola.
     ------------------------------------------------------------------------ */
  function initVariants() {
    const card = $("[data-variant]");
    if (!card) return;
    const VARIANTS = [
      { name: "negro",  bg: "#0a0a0a", mono: false, meta: "#ffffff" },
      { name: "azul",   bg: "#1800ad", mono: true,  meta: "#ffffff" },
      { name: "rojo",   bg: "#ff3131", mono: true,  meta: "#0a0a0a" },
      { name: "verde",  bg: "#7ed957", mono: true,  meta: "#0a0a0a" }
    ];
    const logo = $(".logo", card);
    const status = document.createElement("span");
    status.className = "visually-hidden"; status.setAttribute("aria-live", "polite");
    card.appendChild(status);
    const AUTO_MS = 3200;
    let i = 0, busy = false, timer = null, onScreen = false;

    const apply = (v) => {
      card.style.setProperty("--card-bg", v.bg);
      card.style.setProperty("--card-meta", v.meta);
      logo.classList.toggle("logo--mono", v.mono);
    };

    // x, y = origen del círculo dentro de la tarjeta
    const next = (x, y) => {
      if (busy) return;
      i = (i + 1) % VARIANTS.length;
      const v = VARIANTS[i];
      if (reduceMotion) { apply(v); return; }
      busy = true;
      const r = card.getBoundingClientRect();
      const wipe = document.createElement("span");
      wipe.className = "variant-card__wipe";
      wipe.style.background = v.bg;
      card.insertBefore(wipe, card.firstChild);
      const radius = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
      wipe.animate(
        [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${radius}px at ${x}px ${y}px)` }],
        { duration: 750, easing: "cubic-bezier(.76,0,.24,1)" }
      ).finished.then(() => { apply(v); wipe.remove(); busy = false; });
      // El logo cambia de color a mitad del barrido, con un pequeño rebote
      setTimeout(() => {
        logo.classList.toggle("logo--mono", v.mono);
        logo.animate([{ transform: "scale(.94)" }, { transform: "scale(1)" }], { duration: 500, easing: EASE_BACK });
      }, 320);
    };

    // Cambio automático
    const canAuto = () => !reduceMotion && onScreen && !document.hidden &&
      !document.documentElement.classList.contains("backstage-paused");
    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        if (!canAuto()) return;
        const r = card.getBoundingClientRect();
        next(Math.random() * r.width, Math.random() * r.height);
      }, AUTO_MS);
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }).observe(card);
    }
    restart();

    // Alto de la tarjeta = hasta la línea de abajo de la última opción de
    // la derecha (con el acordeón cerrado), así las dos columnas terminan
    // juntas. Se mide sin transforms (offsetTop) por las animaciones de entrada.
    const options = $("[data-options]");
    const docTop = (el) => { let t = 0; for (; el; el = el.offsetParent) t += el.offsetTop; return t; };
    const fitHeight = () => {
      // apilado (celular/tablet): las opciones van debajo, alto normal
      const side = options && docTop(options) < docTop(card) + card.offsetHeight;
      card.classList.toggle("is-fit", !!side);
      if (!side) return;
      let bottom = docTop(options) + parseFloat(getComputedStyle(options).borderTopWidth);
      $$(".option", options).forEach((li) => {
        bottom += li.firstElementChild.offsetHeight + parseFloat(getComputedStyle(li).borderBottomWidth);
      });
      card.style.setProperty("--card-h", `${Math.round(bottom - docTop(card))}px`);
    };
    fitHeight();
    addEventListener("resize", fitHeight);
    if (document.fonts) document.fonts.ready.then(fitHeight);

    // Con clic: cambia ya y reinicia el reloj. Con teclado (detail = 0)
    // el círculo sale del centro.
    card.addEventListener("click", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.detail ? e.clientX - r.left : r.width / 2;
      const y = e.detail ? e.clientY - r.top : r.height / 2;
      next(x, y);
      status.textContent = `Variante ${VARIANTS[i].name}`;
      restart();
    });
  }

  /* ------------------------------------------------------------------------
     10. FORMULARIO DE CONTACTO
     Si config.contact.formspreeEndpoint tiene valor → envía con fetch a
     Formspree. Si no → arma un mailto: y abre el cliente de correo.
     ------------------------------------------------------------------------ */
  function initForm() {
    const form = $("[data-form]");
    if (!form) return;
    const status = $("[data-form-status]", form);
    const { email = "", formspreeEndpoint = "", envio = "", web3formsKey = "" } = CONFIG.contact || {};
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      // Validación: marcamos los campos inválidos y llevamos el foco al primero
      const fields = $$("input, textarea", form);
      let firstBad = null;
      fields.forEach((f) => {
        const bad = !f.value.trim() || (f.type === "email" && !EMAIL_RE.test(f.value.trim()));
        f.setAttribute("aria-invalid", String(bad));
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        status.textContent = "Faltan datos. Lo obvio también hay que escribirlo.";
        status.dataset.state = "error";
        firstBad.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      const btn = $("button[type='submit']", form);

      // Plan B que nunca falla: abrir el correo de quien escribe con el
      // mensaje ya armado, dirigido a CONFIG.contact.email
      const openMail = () => {
        const body = `${data.message}\n\n— ${data.name} (${data.email})`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent("Portfolio — " + data.subject)}&body=${encodeURIComponent(body)}`;
      };

      /* Envío directo al mail, en este orden:
         1. Formspree (si hay `formspreeEndpoint`)
         2. Web3Forms (si hay `web3formsKey`): el más confiable sin servidor
         3. formsubmit.co (si `envio: "formsubmit"`)
         Se manda como formulario común (sin JSON) para evitar el pedido
         previo de permisos (CORS) que duplicaba la espera. Si el servicio
         no contesta en `TIMEOUT_MS`, falla o pide activación, se abre el
         correo con el mensaje listo: el mensaje nunca se pierde. */
      const TIMEOUT_MS = 12000;
      const subject = `Portfolio — ${data.subject}`;
      let url = "", body = null;
      if (formspreeEndpoint) {
        url = formspreeEndpoint; body = new FormData(form);
      } else if (web3formsKey) {
        url = "https://api.web3forms.com/submit"; body = new FormData();
        Object.entries({ access_key: web3formsKey, subject, from_name: data.name, name: data.name, email: data.email, replyto: data.email, message: data.message })
          .forEach(([k, v]) => body.append(k, v));
      } else if (envio === "formsubmit" && email) {
        url = `https://formsubmit.co/ajax/${email}`;
        body = new URLSearchParams({ name: data.name, email: data.email, _replyto: data.email, _subject: subject, message: data.message, _template: "table", _captcha: "false" });
      }

      if (!url) {
        openMail();
        status.textContent = `Se abrió tu correo con el mensaje listo. Si no pasó nada, escribime a ${email}.`;
        status.dataset.state = "ok";
        return;
      }

      btn.disabled = true;
      status.textContent = "Enviando…"; status.dataset.state = "";
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, { method: "POST", body, headers: { Accept: "application/json" }, signal: ctrl.signal });
        const json = await res.json().catch(() => ({}));
        // formsubmit/web3forms responden 200 con success:false si algo falta (p. ej. activar)
        if (!res.ok || json.success === false || json.success === "false") throw new Error(json.message || res.status);
        form.reset();
        status.textContent = "Mensaje enviado. Te respondo pronto (y con una segunda lectura).";
        status.dataset.state = "ok";
      } catch (err) {
        openMail();
        status.textContent = `El envío directo no respondió, así que se abrió tu correo con el mensaje listo para mandar a ${email}.`;
        status.dataset.state = "error";
      } finally {
        clearTimeout(timer);
        btn.disabled = false;
      }
    });

    // Al corregir un campo se le saca la marca de error
    form.addEventListener("input", (e) => e.target.removeAttribute("aria-invalid"));
  }

  /* ------------------------------------------------------------------------
     11. DESTACADOS: rectángulos que se abren y cierran solos
     Uno está abierto (ancho) y el resto cerrados (angostos). Cada
     `destacadosInterval` ms se abre el siguiente. Con el mouse encima se
     abre el rectángulo que está debajo del cursor y el automático se pausa;
     al salir, sigue desde ahí. La transición la hace el CSS (flex-grow con
     --ease-organic), así que el ritmo se ajusta en .highlight.
     ------------------------------------------------------------------------ */
  function initHighlights() {
    const list = $("[data-highlights]");
    const items = CONFIG.destacados || [];
    if (!list || !items.length) return;

    list.innerHTML = items.map((d, i) => {
      const tag = d.href ? "a" : "div";
      const href = d.href ? ` href="${d.href}"` : "";
      return `<li class="highlight" data-reveal>
        <${tag} class="highlight__frame"${href}>
          <img src="${d.src}" alt="${d.alt || ""}" loading="lazy" decoding="async"${d.pos ? ` style="object-position:${d.pos}"` : ""}>
          <span class="highlight__caption"><span>${String(i + 1).padStart(2, "0")}</span>${d.caption || ""}</span>
        </${tag}>
      </li>`;
    }).join("");

    const cells = $$(".highlight", list);
    let current = 0, timer = null, hovering = false;
    const open = (k) => {
      current = (k + cells.length) % cells.length;
      cells.forEach((c, i) => c.classList.toggle("is-open", i === current));
    };
    const play = () => {
      clearInterval(timer);
      if (reduceMotion) return;
      timer = setInterval(() => { if (!hovering && !document.hidden) open(current + 1); }, CONFIG.destacadosInterval || 2600);
    };

    cells.forEach((c, i) => {
      // mousemove (y no mouseenter) para no abrir en cadena cuando los
      // rectángulos se corren solos debajo de un cursor quieto
      c.addEventListener("mousemove", () => { if (finePointer.matches && i !== current) open(i); });
      c.addEventListener("focusin", () => open(i));
    });
    list.addEventListener("mouseenter", () => { hovering = true; });
    list.addEventListener("mouseleave", () => { hovering = false; play(); });

    open(0);
    play();
  }

  /* ------------------------------------------------------------------------
     12. DE LA SEMANA (laterales de la barra, solo en el home)
     Canción a la izquierda del menú y película a la derecha. El título de
     cada una es una MÁSCARA del video del home: las letras dejan ver el
     mismo video que corre dentro del logo [Lu -].
     - La máscara es un SVG con el texto (mask-image), igual que el logo.
     - La canción con `youtube` es el botón de play / pausa (§13).
     - Si un título queda vacío en config.js, ese lateral no se muestra.
     ------------------------------------------------------------------------ */
  const MASK_FONT = '700 17px "Helvetica Neue", Helvetica, Arial, sans-serif';
  const esc = (str = "") => String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Arma la máscara SVG del texto, con el ancho justo de las letras
  function maskTitle(el, text) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = MASK_FONT;
    const w = Math.ceil(ctx.measureText(text).width) + 2, h = 22;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><text x="0" y="17" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" font-size="17" letter-spacing="0" fill="#fff">${esc(text)}</text></svg>`;
    const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    el.style.width = `${w}px`; el.style.height = `${h}px`;
    el.style.webkitMaskImage = url; el.style.maskImage = url;
  }

  function renderWeekly() {
    const slots = $$("[data-week-slot]");
    const items = (CONFIG.semana || []).filter(it => it.titulo);
    if (!slots.length || !items.length) return;
    const homeVideo = $("[data-home-video]");
    const sources = homeVideo ? $$("source", homeVideo).map(s => `<source src="${s.getAttribute("src")}" type="${s.type}">`).join("") : "";
    items.slice(0, slots.length).forEach((it, i) => {
      const isSong = /canci/i.test(it.tipo) && it.youtube;
      const video = sources ? `<video muted loop playsinline autoplay preload="metadata" aria-hidden="true" tabindex="-1">${sources}</video>` : "";
      const inner = `
        <span class="nav-week__type">${esc(it.tipo)}</span>
        <span class="nav-week__title" data-mask-title>${video}</span>
        <span class="visually-hidden">${esc(it.titulo)}${it.detalle ? " — " + esc(it.detalle) : ""}</span>`;
      slots[i].innerHTML = isSong
        ? `<button type="button" class="nav-week__item" data-music-toggle aria-pressed="false">${inner}<span class="visually-hidden" data-music-sr>Reproducir</span></button>`
        : it.url
          ? `<a class="nav-week__item" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${inner}<span class="visually-hidden">(se abre en una pestaña nueva)</span></a>`
          : `<span class="nav-week__item">${inner}</span>`;
      maskTitle($("[data-mask-title]", slots[i]), it.titulo);
      slots[i].classList.add("has-item");
      // Respeta movimiento reducido: el video de las letras queda quieto
      const v = $("video", slots[i]); if (v && reduceMotion) { v.removeAttribute("autoplay"); v.pause(); }
    });
  }

  // Portada de la canción: `portada` en config.js; si no hay, la miniatura
  // del video de YouTube
  function songCover(it) {
    return it.portada || `https://i.ytimg.com/vi/${encodeURIComponent(it.youtube)}/hqdefault.jpg`;
  }

  /* ------------------------------------------------------------------------
     12b. BARRA EN EL HOME: mismo largo que el logo [Lu -]
     Mientras el home está a la vista, la barra se estira hasta el ancho del
     logo y muestra la canción y la película en sus laterales. Al bajar,
     vuelve a su tamaño compacto. El cambio de ancho lo anima el CSS.
     ------------------------------------------------------------------------ */
  function initHomeNav() {
    const nav = $("[data-nav]"), home = $(".home"), logo = $(".home__logo");
    if (!nav || !home || !logo) return;
    const desktop = window.matchMedia("(min-width: 761px)");
    let compact = 0, onHome = true;
    const measure = () => {
      nav.classList.remove("nav--home");
      nav.style.width = "";
      compact = nav.getBoundingClientRect().width;   // ancho natural (sin laterales)
      apply(true);
    };
    const apply = (instant) => {
      const wide = onHome && desktop.matches;
      nav.classList.toggle("nav--home", onHome);
      if (!desktop.matches) { nav.style.width = ""; return; }
      if (instant) nav.style.transition = "none";
      nav.style.width = `${wide ? Math.round(logo.getBoundingClientRect().width) : Math.ceil(compact)}px`;
      if (instant) { nav.offsetWidth; nav.style.transition = ""; }
    };
    new IntersectionObserver(([e]) => { onHome = e.intersectionRatio > 0.45; apply(false); }, { threshold: [0, 0.45, 1] }).observe(home);
    window.addEventListener("resize", measure);
    if (document.fonts) document.fonts.ready.then(measure);
    measure();
  }

  /* ------------------------------------------------------------------------
     13. CANCIÓN DE LA SEMANA DE FONDO (YouTube)
     Límites que no se pueden saltear:
     - Los navegadores no dejan que una página suene sola al abrir: la
       música arranca con el PRIMER clic, toque o tecla en la página.
     - YouTube pide que su reproductor esté visible (mín. 200×200 px), así
       que al sonar aparece un mini reproductor en la esquina, con pausa y
       cerrar. Si se cierra, no vuelve a arrancar en esa visita.
     El reproductor se prepara apenas carga la página (quieto y oculto),
     para poder darle play dentro del mismo clic.
     ------------------------------------------------------------------------ */
  function initMusic() {
    const song = (CONFIG.semana || []).find(it => it.youtube && it.titulo);
    if (!song) return;
    let off = false;
    try { off = sessionStorage.getItem("lu-music-off") === "1"; } catch (e) {}

    const box = document.createElement("aside");
    box.className = "music";
    box.setAttribute("aria-label", "Canción de la semana");
    box.innerHTML = `
      <div class="music__head">
        <span class="music__cover" aria-hidden="true"><img alt="" src=""><span class="music__eq"><i></i><i></i><i></i></span></span>
        <span class="music__text"><span class="music__type">Canción de la semana</span><span class="music__title"></span></span>
        <button type="button" class="music__btn" data-music-pause aria-label="Pausar">❚❚</button>
        <button type="button" class="music__btn" data-music-close aria-label="Cerrar y apagar la música">×</button>
      </div>
      <div class="music__player"><div id="lu-music-player"></div></div>`;
    $(".music__title", box).textContent = `${song.titulo}${song.detalle ? " — " + song.detalle : ""}`;
    $(".music__cover img", box).src = songCover(song);
    document.body.appendChild(box);

    let player = null, ready = false, playing = false, wantPlay = false;
    const toggles = $$("[data-music-toggle]");
    const pauseBtn = $("[data-music-pause]", box);

    // El botón amarillo de la barra pasa a ser play / pausa de la canción.
    // (Se clona para sacarle la función anterior de pausar el fondo.)
    let navBtn = $("[data-backstage-toggle]");
    if (navBtn) {
      const clone = navBtn.cloneNode(true);
      // deja de ser el botón del fondo (initBackstage busca [data-backstage-toggle])
      clone.removeAttribute("data-backstage-toggle");
      clone.setAttribute("data-music-nav", "");
      navBtn.replaceWith(clone);
      navBtn = clone;
      document.documentElement.classList.remove("backstage-paused");
    }

    const sync = () => {
      document.documentElement.classList.toggle("music-playing", playing);
      toggles.forEach(t => {
        t.setAttribute("aria-pressed", String(playing));
        const sr = $("[data-music-sr]", t); if (sr) sr.textContent = playing ? "Pausar" : "Reproducir";
      });
      pauseBtn.textContent = playing ? "❚❚" : "▶";
      pauseBtn.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
      if (navBtn) {
        // aria-pressed="true" dibuja el ▶ (está en pausa); "false" dibuja ❚❚
        navBtn.setAttribute("aria-pressed", String(!playing));
        $(".visually-hidden", navBtn).textContent = playing ? "Pausar la canción de la semana" : "Reproducir la canción de la semana";
      }
    };
    sync();
    const play = () => {
      off = false;
      try { sessionStorage.removeItem("lu-music-off"); } catch (e) {}
      box.classList.add("is-on");
      document.documentElement.classList.add("music-on"); // la portada aparece apenas se pide play
      if (ready) { player.unMute(); player.playVideo(); } else wantPlay = true;
    };
    const pause = () => { if (ready) player.pauseVideo(); };

    // Carga la API de YouTube y deja el reproductor listo
    window.onYouTubeIframeAPIReady = () => {
      player = new window.YT.Player("lu-music-player", {
        width: 200, height: 200, videoId: song.youtube,
        playerVars: { playsinline: 1, loop: 1, playlist: song.youtube, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => { ready = true; if (wantPlay) { player.unMute(); player.playVideo(); } },
          onStateChange: (e) => { playing = e.data === 1; sync(); }
        }
      });
    };
    const api = document.createElement("script");
    api.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(api);

    // Primer clic / toque / tecla en cualquier lado → empieza a sonar
    const first = (e) => {
      if (e.target.closest && e.target.closest("[data-music-close], [data-music-toggle], [data-music-pause], [data-music-nav]")) return;
      window.removeEventListener("pointerdown", first, true);
      window.removeEventListener("keydown", first, true);
      if (!off) play();
    };
    window.addEventListener("pointerdown", first, true);
    window.addEventListener("keydown", first, true);

    // La ficha de la canción y el botón del reproductor: play / pausa
    toggles.forEach(t => t.addEventListener("click", () => (playing ? pause() : play())));
    pauseBtn.addEventListener("click", () => (playing ? pause() : play()));
    if (navBtn) navBtn.addEventListener("click", () => (playing ? pause() : play()));
    $("[data-music-close]", box).addEventListener("click", () => {
      pause(); off = true; box.classList.remove("is-on");
      document.documentElement.classList.remove("music-on");
      try { sessionStorage.setItem("lu-music-off", "1"); } catch (e) {}
    });
  }

  /* ------------------------------------------------------------------------
     14. QUIÉN SOY → IMAGEN CREATIVA
     La imagen creativa empieza oculta. Clic en el bloque azul "Quién soy"
     (o en "Quién soy" del menú About) la despliega de arriba hacia abajo;
     otro clic en el bloque la vuelve a guardar.
     ------------------------------------------------------------------------ */
  function initAboutPhoto() {
    const btn = $("[data-photo-toggle]"), grid = $("#about-reveal");
    if (!btn || !grid) return;
    const fig = $("#about-photo", grid), bio = $(".about__bio", grid);
    const hint = $(".statement__hint", $("#quien-soy"));
    const set = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      $(".visually-hidden", btn).textContent = open ? "Ocultar la imagen creativa" : "Ver la imagen creativa";
      if (hint) hint.firstChild.textContent = open ? "Ocultar imagen creativa " : "Ver imagen creativa ";
      $("#quien-soy").classList.toggle("is-open", open);
    };
    // La imagen se descubre de arriba hacia abajo y el texto la acompaña:
    // mismo recorte (clip) y la misma curva, el texto con un pequeño retraso.
    const REVEAL = [{ clipPath: "inset(0 0 100% 0 round 24px)", opacity: .4 }, { clipPath: "inset(0 0 0 0 round 24px)", opacity: 1 }];
    const open = () => {
      if (!grid.hidden) return;
      grid.hidden = false; set(true);
      if (!reduceMotion) {
        fig.animate(REVEAL, { duration: 900, easing: "cubic-bezier(.45,0,.15,1)" });
        bio.animate(REVEAL, { duration: 900, delay: 160, easing: "cubic-bezier(.45,0,.15,1)", fill: "backwards" });
      }
      grid.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    };
    const close = () => {
      if (grid.hidden) return;
      set(false);
      const done = () => { grid.hidden = true; };
      if (reduceMotion) return done();
      const back = [...REVEAL].reverse();
      bio.animate(back, { duration: 500, easing: "cubic-bezier(.45,0,.15,1)", fill: "forwards" });
      fig.animate(back, { duration: 600, delay: 80, easing: "cubic-bezier(.45,0,.15,1)", fill: "forwards" })
        .finished.then(() => { done(); fig.getAnimations().forEach(a => a.cancel()); bio.getAnimations().forEach(a => a.cancel()); });
    };
    btn.addEventListener("click", () => (grid.hidden ? open() : close()));
    // Desde el menú About o un link a #quien-soy
    const fromHash = () => { if (location.hash === "#quien-soy") open(); };
    window.addEventListener("hashchange", fromHash);
    $$('a[href$="#quien-soy"]').forEach(a => a.addEventListener("click", () => setTimeout(open, 400)));
    fromHash();
  }

  /* ------------------------------------------------------------------------
     16. VIDEO DEL HOME (dentro del logo [Lu -])
     - Movimiento reducido: no se reproduce; queda el póster quieto.
     - Si el navegador bloquea la reproducción, queda el póster.
     - Fuera de pantalla se pausa, para no gastar batería ni datos.
     ------------------------------------------------------------------------ */
  function initHomeVideo() {
    const video = $("[data-home-video]");
    if (!video) return;
    if (reduceMotion) {
      video.removeAttribute("autoplay");
      video.preload = "none";
      video.pause();
      video.load(); // vuelve a mostrar el póster
      return;
    }
    const tryPlay = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? tryPlay() : video.pause()), { threshold: 0.05 }).observe(video);
    } else tryPlay();
  }

  /* ------------------------------------------------------------------------
     17. ENTRADA DEL HOME (cada vez que se carga o se recarga la página)
     1. El logo se descubre de abajo hacia arriba (recorte) mientras el
        video adentro se acerca hasta su tamaño.
     2. El subtítulo sube y aparece.
     3. El pie de página entra en cascada.
     4. La barra baja desde arriba.
     Si la intro de círculos está corriendo, espera a que termine.
     El estado inicial (oculto) lo pone html.home-enter desde el <head>.
     ------------------------------------------------------------------------ */
  function initHomeEntrance() {
    const root = document.documentElement;
    if (!$(".home") || reduceMotion) { root.classList.remove("home-enter"); return; }
    const EASE = "cubic-bezier(.45,0,.15,1)";
    const run = () => {
      const box = $(".home__video"), vid = $(".home__video video"), sub = $(".home__sub"), nav = $("[data-nav]");
      const opts = (delay, duration) => ({ delay, duration, easing: EASE, fill: "backwards" });
      root.classList.remove("home-enter");
      box.animate([{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }], opts(0, 1300));
      if (vid) vid.animate([{ transform: "scale(1.25)" }, { transform: "scale(1)" }], opts(0, 1900));
      sub.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], opts(650, 900));
      $$(".home__foot span").forEach((s, i) =>
        s.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], opts(950 + i * 120, 800)));
      if (nav) nav.animate([{ opacity: 0, translate: "0 -24px" }, { opacity: 1, translate: "0 0" }], opts(400, 900));
    };
    if (root.classList.contains("intro-running")) {
      const mo = new MutationObserver(() => { if (!root.classList.contains("intro-running")) { mo.disconnect(); run(); } });
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    } else run();
  }

  /* ------------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------------ */
  initHomeEntrance();
  initHomeVideo();
  renderPanels();
  renderSocials();
  // Botón "Descargar CV": toma el archivo de config.js (o lo oculta si no hay)
  const cvBtn = $("[data-cv]");
  if (cvBtn) { const cv = (CONFIG.contact || {}).cv; if (cv) cvBtn.href = cv; else cvBtn.hidden = true; }
  initHighlights();
  renderWeekly();
  initHomeNav();
  initMusic();
  const year = $("[data-year]"); if (year) year.textContent = new Date().getFullYear();

  initBackstage();
  initAccordion();
  initNavMenus();
  initNav();
  initReveal();
  initCursor();
  initManifesto();
  initTilt();
  initVariants();
  initForm();
  initAboutPhoto();

  if (!reduceMotion) {
    animateLogo();
    animateHero();
    initParallax();
    initScrollLoop();
  }
})();
