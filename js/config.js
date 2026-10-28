/* ==========================================================================
   CONFIGURACIÓN CENTRAL — [Lu - cía]®
   --------------------------------------------------------------------------
   Todo lo que cambia seguido vive acá: email, redes, imágenes de backstage
   y textos de las áreas. No hace falta tocar el HTML para actualizarlos.
   Se carga como script clásico (no módulo) para que el sitio funcione
   también abriendo index.html con doble clic.
   ========================================================================== */

window.SITE_CONFIG = {
  /* ---------- Contacto ---------- */
  contact: {
    email: "luchyderegibus@gmail.com",   // a dónde llegan los mensajes del formulario
    // envio: "formsubmit" manda el mensaje directo a ese mail (servicio gratuito
    // formsubmit.co). La PRIMERA vez llega un mail de activación: hay que
    // confirmarlo una sola vez y desde ahí llegan todos los mensajes.
    envio: "formsubmit",
    // Alternativa: endpoint de Formspree (https://formspree.io/f/XXXX). Si se
    // completa, se usa en lugar de formsubmit.
    formspreeEndpoint: "",
    cv: "assets/cv/CV-Lucia-Deregibus-Mongardi.pdf"   // botón "Descargar CV" en Contacto
  },

  /* ---------- Redes ---------- */
  socials: [
    { id: "instagram", label: "Instagram", url: "https://www.instagram.com/lderegibus____/" },
    { id: "linkedin",  label: "LinkedIn",  url: "https://www.linkedin.com/in/lucia-belen-deregibus-mongardi-96272822a/" },
    // Mientras tenga "USUARIO" no se muestra en el sitio. Reemplazar por el link real.
    { id: "behance",   label: "Behance",   url: "https://www.behance.net/USUARIO" }
  ],

  /* ---------- Fondo global de backstage ----------
     src:  ruta a la imagen (WebP recomendado, ~1600px de ancho).
           Si es null, se omite: queda el fondo de tonalidades claras (CSS).
     alt:  descripción de la imagen (accesibilidad).
     production: nombre de la producción (se muestra como crédito).
     color: (opcional) referencia de paleta, hoy no se usa.          */
  backstage: [
    { src: null, alt: "Backstage de producción fotográfica", production: "Producción 01", color: "#1800ad" },
    { src: null, alt: "Backstage de fashion film",            production: "Producción 02", color: "#ff3131" },
    { src: null, alt: "Backstage de evento",                  production: "Producción 03", color: "#ffde59" },
    { src: null, alt: "Backstage de sesión editorial",        production: "Producción 04", color: "#7ed957" },
    { src: null, alt: "Backstage de campaña",                 production: "Producción 05", color: "#ff751f" }
  ],
  backstageInterval: 7000, // ms entre imágenes

  /* ---------- De la semana (al lado del logo, en el inicio) ----------
     Se actualiza a mano cada semana. Si un título queda vacío, esa fila
     no se muestra. url: link opcional (Spotify, YouTube, Letterboxd…). */
  semana: [
    // youtube: ID del video (lo que va después de "watch?v="). Con eso la canción
    // suena de fondo desde el primer clic en la página (ver README).
    { tipo: "Canción de la semana",  titulo: "HOUSEWIFE", detalle: "Tate McRae", url: "https://www.youtube.com/watch?v=DPEodkHzH-s", youtube: "DPEodkHzH-s" }, // detalle: artista
    { tipo: "Película de la semana", titulo: "Obsession", detalle: "Curry Barker, 2025", url: "" }  // detalle: director, año
  ],

  /* ---------- Destacados (sección debajo del inicio) ----------
     Rectángulos que se abren y cierran solos; con el mouse se abre el que
     está debajo del cursor. Son 3 imágenes (se pueden sumar más).
     href: link opcional al hacer clic (ej. "area.html?a=estilismo-fotografia") */
  destacados: [
    { src: "assets/img/mockup-tote.webp",      alt: "Bolsa de tela con el logo [Lu-] estampado",                   caption: "Tote bag",        href: "area.html?a=direccion-artistica" },
    { src: "assets/img/mockup-subte.webp",     alt: "Afiche azul con el logo [Lu-] en un vagón de subte",          caption: "Vía pública",     href: "area.html?a=direccion-artistica" },
    { src: "assets/img/lucia-imagen-creativa.webp", alt: "Imagen creativa: Lucía hoy señala una foto suya de chica", caption: "Imagen creativa", href: "" }
  ],
  destacadosInterval: 2600, // ms entre aperturas automáticas

  /* ---------- Áreas / servicios ----------
     Cada área tiene su página (area.html?a=ID) con todos sus proyectos.
     projects[]: title, year, client, role, description,
                 video (opcional: URL de YouTube/Vimeo "embed" o un .mp4),
                 images[]: { src, alt, caption }  (src null = placeholder)
     La primera imagen de cada proyecto se muestra más grande.
     color: clave de la paleta (red | blue | yellow | green | orange)
     image: imagen de muestra (null = placeholder con los signos de la marca) */
  services: [
    {
      id: "estilismo-fotografia",
      title: "Estilismo & Fotografía",
      color: "red",
      kicker: "01",
      subtitle: "Concepto, estilismo y set",   // se ve en el menú desplegable de "Áreas"
      text: "Producción de sesiones de principio a fin: concepto, equipo, locación y set. La foto dura un instante; lo que la sostiene lleva semanas. ¿Quién se acuerda de eso? Yo.",
      tags: ["Estilismo","Producción de moda","Dirección de fotografía","Casting","Scouting de locaciones","Coordinación de set","Curaduría de looks"],   // 7 palabras clave: roles
      image: null,
      imageAlt: "Muestra de estilismo y fotografía",
      projects: [
      {
        title: "Proyecto de ejemplo 01",
        year: "",
        client: "",
        role: "",
        resumen: "Resumen de una línea: qué es y qué hice.",   // 1 línea para el carrusel del final
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        images: [
          { src: null, alt: "Fotografía — imagen 1", caption: "" },
          { src: null, alt: "Fotografía — imagen 2", caption: "" },
          { src: null, alt: "Fotografía — imagen 3", caption: "" },
          { src: null, alt: "Fotografía — imagen 4", caption: "" },
          { src: null, alt: "Fotografía — imagen 5", caption: "" }
        ]
      },
      {
        title: "Proyecto de ejemplo 02",
        year: "",
        client: "",
        role: "",
        resumen: "Resumen de una línea: qué es y qué hice.",   // 1 línea para el carrusel del final
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        images: [
          { src: null, alt: "Fotografía — imagen 1", caption: "" },
          { src: null, alt: "Fotografía — imagen 2", caption: "" },
          { src: null, alt: "Fotografía — imagen 3", caption: "" },
          { src: null, alt: "Fotografía — imagen 4", caption: "" }
        ]
      },
      {
        title: "Proyecto de ejemplo 03",
        year: "",
        client: "",
        role: "",
        resumen: "Resumen de una línea: qué es y qué hice.",   // 1 línea para el carrusel del final
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        images: [
          { src: null, alt: "Fotografía — imagen 1", caption: "" },
          { src: null, alt: "Fotografía — imagen 2", caption: "" },
          { src: null, alt: "Fotografía — imagen 3", caption: "" }
        ]
      }
      ]
    },
    {
      id: "fashion-films",
      layout: "video",  // videos horizontales (16:9) con pantalla completa
      title: "Fashion Films",
      color: "blue",
      kicker: "02",
      subtitle: "Visiones que se mueven",   // se ve en el menú desplegable de "Áreas"
      text: "Traduzco una visión en algo que se mueve. Ordeno ideas, tiempos y personas para que la pieza diga lo que tiene que decir, y no un poco más.",
      tags: ["Producción ejecutiva","Guion","Dirección creativa","Casting","Coordinación de rodaje","Dirección de arte","Supervisión de edición"],   // 7 palabras clave: roles
      image: null,
      imageAlt: "Muestra de fashion film",
      projects: [
      {
        title: "Fashion film de ejemplo 01",
        year: "",
        client: "",
        role: "",
        resumen: "Resumen de una línea: qué es y qué hice.",   // 1 línea para el carrusel del final
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        video: null,   // URL "embed" de YouTube/Vimeo o un .mp4 (ej. "assets/video/film.mp4")
        images: [
          { src: null, alt: "Fashion film — imagen 1", caption: "" },
          { src: null, alt: "Fashion film — imagen 2", caption: "" },
          { src: null, alt: "Fashion film — imagen 3", caption: "" }
        ]
      },
      {
        title: "Fashion film de ejemplo 02",
        year: "",
        client: "",
        role: "",
        resumen: "Resumen de una línea: qué es y qué hice.",   // 1 línea para el carrusel del final
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        video: null,   // URL "embed" de YouTube/Vimeo o un .mp4 (ej. "assets/video/film.mp4")
        images: [
          { src: null, alt: "Fashion film — imagen 1", caption: "" },
          { src: null, alt: "Fashion film — imagen 2", caption: "" },
          { src: null, alt: "Fashion film — imagen 3", caption: "" }
        ]
      }
      ]
    },
    {
      id: "trendforecast",
      layout: "libro",  // proyectos presentados como cuaderno que se hojea (ver README)
      title: "Trendforecast",
      color: "green",
      kicker: "03",
      subtitle: "Lo evidente, dos veces",   // se ve en el menú desplegable de "Áreas"
      text: "Miro donde aparentemente no hay nada que mirar. Leo lo evidente dos veces, porque la segunda lectura suele ser la interesante.",
      tags: ["Investigación de tendencias","Coolhunting","Análisis cultural","Lectura de consumo","Moodboards","Reportes de tendencias","Forecasting"],   // 7 palabras clave: roles
      image: null,
      imageAlt: "Muestra de trendforecast",
      projects: [
      {
        title: "Investigación de ejemplo 01",
        year: "",
        client: "",
        role: "",
        resumen: "Resumen de una línea: qué es y qué hice.",   // 1 línea para el carrusel del final
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        images: [
          { src: null, alt: "Tendencias — imagen 1", caption: "" },
          { src: null, alt: "Tendencias — imagen 2", caption: "" },
          { src: null, alt: "Tendencias — imagen 3", caption: "" },
          { src: null, alt: "Tendencias — imagen 4", caption: "" }
        ]
      },
      {
        title: "Investigación de ejemplo 02",
        year: "",
        client: "",
        role: "",
        resumen: "Resumen de una línea: qué es y qué hice.",   // 1 línea para el carrusel del final
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        images: [
          { src: null, alt: "Tendencias — imagen 1", caption: "" },
          { src: null, alt: "Tendencias — imagen 2", caption: "" },
          { src: null, alt: "Tendencias — imagen 3", caption: "" }
        ]
      }
      ]
    },
    {
      id: "postproduccion",
      title: "Postproducción",
      color: "orange",
      kicker: "04",
      subtitle: "Lo que no se ve, también se edita",   // se ve en el menú desplegable de "Áreas"
      text: "La parte que no se ve y que hace que todo se vea. Selecciono, retoco y ajusto hasta que la imagen diga lo que tenía que decir, y no un poco más.",
      tags: ["Selección de material","Retoque fotográfico","Corrección de color","Edición","Montaje","Adaptación de formatos","Entrega final"],   // 7 palabras clave: roles
      image: null,
      imageAlt: "Muestra de postproducción",
      projects: [
      {
        title: "Proyecto de ejemplo 01",
        year: "",
        client: "",
        role: "",
        resumen: "Resumen de una línea: qué es y qué hice.",   // 1 línea para el carrusel del final
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        images: [
          { src: null, alt: "Postproducción — imagen 1", caption: "" },
          { src: null, alt: "Postproducción — imagen 2", caption: "" },
          { src: null, alt: "Postproducción — imagen 3", caption: "" },
          { src: null, alt: "Postproducción — imagen 4", caption: "" },
          { src: null, alt: "Postproducción — imagen 5", caption: "" }
        ]
      },
      {
        title: "Proyecto de ejemplo 02",
        year: "",
        client: "",
        role: "",
        resumen: "Resumen de una línea: qué es y qué hice.",   // 1 línea para el carrusel del final
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        images: [
          { src: null, alt: "Postproducción — imagen 1", caption: "" },
          { src: null, alt: "Postproducción — imagen 2", caption: "" },
          { src: null, alt: "Postproducción — imagen 3", caption: "" }
        ]
      }
      ]
    },
    {
      id: "direccion-artistica",
      title: "Dirección Artística",
      color: "yellow",
      kicker: "05",
      subtitle: "Sistema, signos y concepto",   // se ve en el menú desplegable de "Áreas"
      text: "Construyo algo complejo a partir de recursos simples. Color, tipografía, signos y composición funcionando como un mismo lenguaje. Esta marca es la prueba.",
      tags: ["Dirección artística","Concepto creativo","Identidad visual","Estrategia de marca","Campañas","Relaciones públicas","Comunicación"],   // 7 palabras clave: roles
      image: "assets/img/mockup-tarjeta.webp",
      imageAlt: "Tarjeta amarilla con el logo [Lu - cía] sostenida en la mano",
      projects: [
      {
        title: "[Lu - cía]® — Identidad de marca personal",
        year: "",
        client: "Proyecto propio",
        role: "Concepto, identidad y sistema",
        resumen: "Mi nombre convertido en sistema: logo, color, signos y aplicaciones.",   // 1 línea para el carrusel del final
        description: "Mi nombre es mi identidad. No necesito construir un símbolo que me represente: parto de lo más literal. Tomo mi propio nombre y lo convierto en materia gráfica. Color, tipografía, signos, planos y composición funcionan como un mismo lenguaje.",
        images: [
          { src: "assets/img/mockup-subte.webp", alt: "Afiche azul con el logo [Lu-] en un vagón de subte", caption: "Vía pública" },
          { src: "assets/img/mockup-tote.webp", alt: "Bolsa de tela con el logo [Lu-] estampado", caption: "Tote bag" },
          { src: "assets/img/mockup-tarjeta.webp", alt: "Tarjeta amarilla con el logo [Lu - cía] sostenida en la mano", caption: "Tarjeta" },
          { src: "assets/img/mockup-medias.webp", alt: "Medias azules con etiqueta [Lu-]", caption: "Packaging" },
          { src: "assets/img/mockup-caballete.webp", alt: "Cartel caballete con una persona y el logo [Lu-]", caption: "Cartel" },
          { src: "assets/img/mockup-cartel.webp", alt: "Cartel en la entrada del subte con los signos triángulo, círculo y cuadrado", caption: "Signos" },
          { src: "assets/img/lucia-imagen-creativa.webp", alt: "Imagen creativa: Lucía hoy señala una foto suya de chica", caption: "Imagen creativa" }
        ]
      },
      {
        title: "Proyecto de ejemplo 02",
        year: "",
        client: "",
        role: "",
        resumen: "Resumen de una línea: qué es y qué hice.",   // 1 línea para el carrusel del final
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        images: [
          { src: null, alt: "Branding — imagen 1", caption: "" },
          { src: null, alt: "Branding — imagen 2", caption: "" },
          { src: null, alt: "Branding — imagen 3", caption: "" }
        ]
      }
      ]
    }
  ]
};
