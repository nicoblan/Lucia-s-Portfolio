/* ==========================================================================
   [Lu - cía]® — Intro de entrada (canvas)
   --------------------------------------------------------------------------
   Réplica de la referencia "Circle transition" (Pinterest, 5,4 s). Los
   tiempos y posiciones salen de medir el video cuadro por cuadro.

   SECUENCIA (en segundos del video; la intro la reproduce comprimida en
   DURATION = 2 s: misma coreografía y mismas curvas, ~3 veces más rápido)
   0.00–0.20  Dos círculos asoman en los bordes izquierdo (blanco) y
              derecho (oscuro), a media altura. Quietos.
   0.20–0.73  Avanzan hacia el centro acelerando (ease-in) y se cruzan.
              Donde se superponen, la intersección se pinta amarilla.
   0.73–1.93  El par gira en sentido horario alrededor del centro. La
              distancia entre ambos "respira": se abre, se cierra casi
              hasta superponerse (~1.65 s) y se vuelve a abrir. Cuando
              están cerca del centro giran mucho más rápido.
   1.93–2.07  Latigazo: el par gira ~120° de golpe y cada círculo se
              divide en dos (blanco → verde + oscuro; oscuro → blanco +
              amarillo). Quedan cuatro círculos en grilla de 2×2.
   2.07–2.80  La grilla gira 45° (queda en cruz: verde arriba, blanco a la
              derecha, amarillo abajo, oscuro a la izquierda) y se frena.
   2.80–3.73  La cruz se contrae al centro, gira rapidísimo mientras está
              junta, se vuelve a abrir y termina de girar hasta quedar de
              nuevo en grilla 2×2.
   3.73–4.07  Pausa en grilla.
   4.07–4.53  La grilla se contrae y gira hasta colapsar en un solo disco.
   4.53–4.80  Solo quedan blanco (apenas arriba) y amarillo (apenas abajo).
   4.80–5.10  Blanco sale hacia arriba y amarillo hacia abajo, acelerando.
   5.10–5.20  Fondo vacío.
   Fin        (fuera del video) el fondo se desvanece y deja ver el hero,
              que ya está en su posición final.

   CÓMO ESTÁ HECHO
   - Una sola timeline: un requestAnimationFrame calcula el tiempo t y
     todas las piezas salen de funciones de t, así nada se desincroniza.
   - Cada "pista" (radio, ángulo, separación, salida) es una lista de
     keyframes medidos en el video, interpolados con una curva cúbica
     monótona: el easing es el del video, sin sobrepasos inventados.
   - Las intersecciones tienen colores propios (como en la referencia):
     se dibuja cada combinación de círculos recortada (clip) por los
     círculos que la forman, de menor a mayor, y la de más círculos queda
     arriba.
   - Medidas en unidades del "escenario" S = lado menor de la pantalla
     (el video es cuadrado). Las entradas y salidas se estiran hasta los
     bordes reales de la pantalla para que funcione en horizontal y en
     vertical.
   ========================================================================== */
(function () {
  "use strict";

  const canvas = document.querySelector("[data-intro]");
  if (!canvas) return;
  const root = document.documentElement;

  // Una vez por sesión y nunca con movimiento reducido (lo decide el <head>)
  if (root.classList.contains("intro-seen")) { canvas.remove(); return; }
  try { sessionStorage.setItem("lu-intro", "1"); } catch (e) {}

  /* ------------------------------------------------------------------------
     COLORES
     La referencia usa azul #0071fd, azul oscuro #12204f, blanco, amarillo
     #ffc20e y verde #00b25a. Acá están mapeados a la paleta de la marca;
     para usar los originales, cambiá estos valores.
     ------------------------------------------------------------------------ */
  const C = {
    bg:     "#1800ad", // fondo            (ref. azul)
    dark:   "#ff3131", // círculo "oscuro" (ref. azul oscuro) → rojo de la marca
    white:  "#ffffff", // blanco
    yellow: "#ffde59", // amarillo
    green:  "#7ed957"  // verde
  };

  /* ------------------------------------------------------------------------
     MEDIDAS Y TIEMPOS
     ------------------------------------------------------------------------ */
  const D = 0.36;           // diámetro de cada círculo (fracción de S)
  const T_SPLIT = 1.985;    // s: el par se divide en cuatro
  const T_EXIT = 4.53;      // s: colapso final; empiezan las salidas
  const T_EMPTY = 5.2;      // s: pantalla vacía (fin del video)
  const DURATION = 2.0;     // s reales que dura toda la intro (con el fundido)
  const FADE = 0.3;         // s reales: el fondo se desvanece y aparece el hero
  // Velocidad: los 5,2 s del video entran en (DURATION - FADE) s reales
  const SPEED = T_EMPTY / (DURATION - FADE);

  /* ------------------------------------------------------------------------
     PISTAS (keyframes medidos en el video: [segundo, valor])
     ------------------------------------------------------------------------ */
  // Distancia del centro de cada círculo (o de cada par) al centro, en S
  const RHO = [
    [0, .67], [.20, .67], [.27, .65], [.33, .64], [.40, .58], [.53, .43], [.60, .305],
    [.67, .155], [.73, .03], [.80, .02], [.87, .05], [1.0, .075], [1.20, .095], [1.33, .09],
    [1.47, .09], [1.53, .079], [1.60, .03], [1.67, .02], [1.80, .05], [1.87, .114],
    [1.93, .148], [2.0, .19], [2.07, .21], [2.27, .20], [2.47, .19], [2.80, .19],
    [2.87, .175], [2.93, .12], [3.0, .03], [3.07, .10], [3.20, .15], [3.30, .17],
    [3.40, .19], [3.53, .20], [3.73, .20], [4.07, .20], [4.20, .18], [4.27, .14],
    [4.33, .06], [4.40, .04], [4.53, .01]
  ];
  // Ángulo (grados, horario; 0 = derecha) del círculo blanco del par inicial.
  // Después de la división es el ángulo del par verde+oscuro.
  const ANGLE = [
    [0, 180], [.60, 180], [.67, 194], [.73, 225], [.80, 300], [.87, 405], [1.0, 440],
    [1.20, 468], [1.33, 497], [1.47, 513], [1.53, 522], [1.60, 600], [1.67, 700],
    [1.80, 725], [1.87, 743], [1.93, 786], [1.965, 796], [2.0, 842], [2.07, 900], [2.27, 933],
    [2.47, 943], [2.67, 945], [2.80, 945], [2.93, 965], [3.0, 1000], [3.07, 1119],
    [3.20, 1140], [3.27, 1177], [3.33, 1197], [3.40, 1215], [3.53, 1236], [3.60, 1249],
    [3.73, 1260], [4.07, 1260], [4.20, 1272], [4.27, 1300], [4.33, 1335], [4.40, 1365],
    [4.53, 1395]
  ];
  // Media apertura de cada par al dividirse (grados): 0 = encimados, 45 = grilla
  const SPLIT = [[T_SPLIT, 0], [2.0, 5], [2.07, 45], [T_EXIT, 45]];
  // Salida vertical de blanco (arriba) y amarillo (abajo), en S
  const EXIT = [[T_EXIT, 0], [4.60, .025], [4.80, .03], [4.87, .09], [4.93, .20], [5.0, .43], [5.07, .67], [5.13, .68], [5.2, .72]];
  // Tamaño de verde y oscuro al final: se apagan escondidos bajo el disco central
  const FADE_NG = [[4.45, 1], [4.56, 0]];

  /* ------------------------------------------------------------------------
     INTERPOLACIÓN CÚBICA MONÓTONA (Fritsch–Carlson)
     Pasa exactamente por los keyframes, sin rebotes que no estén en el video.
     ------------------------------------------------------------------------ */
  function track(points) {
    const n = points.length, x = points.map(p => p[0]), y = points.map(p => p[1]);
    const d = [], m = new Array(n);
    for (let i = 0; i < n - 1; i++) d[i] = (y[i + 1] - y[i]) / (x[i + 1] - x[i]);
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
    }
    return (t) => {
      if (t <= x[0]) return y[0];
      if (t >= x[n - 1]) return y[n - 1];
      let i = 0; while (t > x[i + 1]) i++;
      const h = x[i + 1] - x[i], u = (t - x[i]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * y[i] + (u3 - 2 * u2 + u) * h * m[i] +
             (-2 * u3 + 3 * u2) * y[i + 1] + (u3 - u2) * h * m[i + 1];
    };
  }
  const rho = track(RHO), angle = track(ANGLE), split = track(SPLIT), exit = track(EXIT), ngScale = track(FADE_NG);

  /* ------------------------------------------------------------------------
     COLOR DE CADA ZONA según qué círculos la cubren (medido en el video)
     Bits: W=blanco 1, N=oscuro 2, Y=amarillo 4, G=verde 8
     ------------------------------------------------------------------------ */
  const W = 1, N = 2, Y = 4, G = 8;
  const ZONE = {
    [W]: C.white, [N]: C.dark, [Y]: C.yellow, [G]: C.green,
    [G | W]: C.yellow,   // verde ∩ blanco
    [W | Y]: C.dark,     // blanco ∩ amarillo
    [Y | N]: C.bg,       // amarillo ∩ oscuro → "agujero" del color de fondo
    [N | G]: C.white,    // oscuro ∩ verde
    [W | N]: C.dark,     // diagonales (solo se tocan en el centro)
    [Y | G]: C.dark
  };
  const zoneColor = (mask) => ZONE[mask] || C.dark; // 3 o 4 círculos: oscuro
  // Todas las combinaciones, de menos a más círculos
  const MASKS = Array.from({ length: 15 }, (_, i) => i + 1)
    .sort((a, b) => popcount(a) - popcount(b));
  function popcount(v) { let c = 0; while (v) { c += v & 1; v >>= 1; } return c; }

  /* ------------------------------------------------------------------------
     DIBUJO
     ------------------------------------------------------------------------ */
  const ctx = canvas.getContext("2d");
  let vw = 0, vh = 0, S = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth; vh = window.innerHeight; S = Math.min(vw, vh);
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Más allá de ~0.17 S el círculo ya está saliendo del cuadrado del video:
  // estiramos esa parte hasta el borde real de la pantalla en ese eje.
  const EDGE = 0.17, FAR = 0.67;
  function stretch(dist, axisSize) {
    const extra = Math.max(0, (axisSize - S) / 2);
    const k = Math.min(1, Math.max(0, (Math.abs(dist) - EDGE) / (FAR - EDGE)));
    return Math.sign(dist) * (Math.abs(dist) * S + k * extra);
  }

  function polar(r, deg) {
    const a = deg * Math.PI / 180;
    return { x: vw / 2 + stretch(r * Math.cos(a), vw), y: vh / 2 + stretch(r * Math.sin(a), vh) };
  }

  // Devuelve los círculos de este instante: [{bit, x, y, r}]
  function circlesAt(t) {
    const R = D * S / 2;
    if (t < T_SPLIT) {
      // Par inicial. Se dibuja con la misma lógica de 4 círculos: el blanco
      // es verde+oscuro encimados (su cruce es blanco) y el oscuro es
      // blanco+amarillo encimados (su cruce es oscuro). Así el paso a cuatro
      // es continuo. El cruce entre ambos pares se ve amarillo.
      const a = angle(t), r = rho(t);
      const p = polar(r, a), q = polar(r, a + 180);
      return { pairs: true, list: [
        { bit: N, ...p, r: R }, { bit: G, ...p, r: R },
        { bit: W, ...q, r: R }, { bit: Y, ...q, r: R }
      ] };
    }
    if (t < T_EXIT) {
      const a = angle(t), r = rho(t), s = split(t), k = ngScale(t);
      return { pairs: false, list: [
        { bit: N, ...polar(r, a - s), r: R * k },
        { bit: G, ...polar(r, a + s), r: R * k },
        { bit: W, ...polar(r, a + 180 - s), r: R },
        { bit: Y, ...polar(r, a + 180 + s), r: R }
      ] };
    }
    const e = exit(t);
    return { pairs: false, list: [
      { bit: W, ...polar(e, 270), r: R },
      { bit: Y, ...polar(e, 90), r: R }
    ] };
  }

  function draw(t) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, vw, vh);
    const { pairs, list } = circlesAt(t);
    const live = list.filter(c => c.r > 0.5);
    if (pairs) {
      // Antes de dividirse: dos discos (blanco, oscuro) y su cruce amarillo
      const white = live.find(c => c.bit === N), dark = live.find(c => c.bit === W);
      disc(white, C.white); disc(dark, C.dark);
      ctx.save(); clipTo(white); disc(dark, C.yellow); ctx.restore();
      return;
    }
    // Cada combinación, recortada por los círculos que la forman
    for (const mask of MASKS) {
      const members = live.filter(c => mask & c.bit);
      if (members.length !== popcount(mask)) continue;
      ctx.save();
      for (let i = 1; i < members.length; i++) clipTo(members[i]);
      disc(members[0], zoneColor(mask));
      ctx.restore();
    }
  }
  function disc(c, color) { ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
  function clipTo(c) { ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.clip(); }

  /* ------------------------------------------------------------------------
     TIMELINE ÚNICA
     ------------------------------------------------------------------------ */
  let start = null, raf = 0, finished = false;
  function frame(now) {
    if (start === null) start = now;
    const t = (now - start) / 1000 * SPEED; // tiempo "del video"
    draw(Math.min(t, T_EMPTY));
    if (t >= T_EMPTY) { reveal(); return; }
    raf = requestAnimationFrame(frame);
  }

  // Final: el fondo se desvanece y queda el hero, que ya está en su lugar
  function reveal() {
    if (finished) return; finished = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", skip);
    canvas.removeEventListener("pointerdown", skip);
    canvas.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE * 1000, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" })
      .finished.then(() => {
        canvas.remove();
        root.classList.remove("intro-running");
      });
  }
  // Clic, toque o tecla: saltear
  function skip() { reveal(); }

  resize();

  // Para ajustar tiempos: index.html?intro-frame=2.4 muestra ese instante quieto
  const still = new URLSearchParams(location.search).get("intro-frame");
  if (still !== null) {
    try { sessionStorage.removeItem("lu-intro"); } catch (e) {}
    draw(parseFloat(still) || 0);
    window.luIntroFrame = draw; // desde la consola: luIntroFrame(3.1)
    root.classList.add("intro-running");
    canvas.addEventListener("pointerdown", skip);
    return;
  }

  draw(0);
  root.classList.add("intro-running");
  window.addEventListener("resize", () => { resize(); });
  window.addEventListener("keydown", skip);
  canvas.addEventListener("pointerdown", skip);
  raf = requestAnimationFrame(frame);
})();
