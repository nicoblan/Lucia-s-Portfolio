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
    email: "contacto@ejemplo.com",        // ← reemplazar por el email real
    // Si completás un endpoint de Formspree (https://formspree.io/f/XXXX),
    // el formulario lo usa en lugar de abrir el cliente de correo (mailto).
    formspreeEndpoint: ""
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

  /* ---------- Destacados (sección debajo del inicio) ----------
     Rectángulos que se abren y cierran solos; con el mouse se abre el que
     está debajo del cursor. Recomendado: entre 4 y 7 imágenes verticales.
     href: link opcional al hacer clic (ej. "area.html?a=fotografia") */
  destacados: [
    { src: "assets/img/mockup-tote.webp",      alt: "Bolsa de tela con el logo [Lu-] estampado",                   caption: "Tote bag",        href: "area.html?a=branding-marketing" },
    { src: "assets/img/mockup-subte.webp",     alt: "Afiche azul con el logo [Lu-] en un vagón de subte",          caption: "Vía pública",     href: "area.html?a=branding-marketing" },
    { src: "assets/img/lucia-imagen-creativa.webp", alt: "Imagen creativa: Lucía hoy señala una foto suya de chica", caption: "Imagen creativa", href: "" },
    { src: "assets/img/mockup-tarjeta.webp",   alt: "Tarjeta amarilla con el logo [Lu - cía] en la mano",          caption: "Tarjeta",         href: "area.html?a=branding-marketing" },
    { src: "assets/img/mockup-medias.webp",    alt: "Medias azules con etiqueta [Lu-]",                            caption: "Packaging",       href: "area.html?a=branding-marketing" },
    { src: "assets/img/mockup-caballete.webp", alt: "Cartel caballete con una persona y el logo [Lu-]",            caption: "Cartel",          href: "area.html?a=branding-marketing" }
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
      id: "fotografia",
      title: "Fotografía",
      color: "red",
      kicker: "01",
      subtitle: "Concepto, equipo y set",   // se ve en el menú desplegable de "Áreas"
      text: "Producción de sesiones de principio a fin: concepto, equipo, locación y set. La foto dura un instante; lo que la sostiene lleva semanas. ¿Quién se acuerda de eso? Yo.",
      tags: ["Concepto", "Casting", "Locación", "Set", "Equipo"],
      image: null,
      imageAlt: "Muestra de producción fotográfica",
      projects: [
      {
        title: "Proyecto de ejemplo 01",
        year: "",
        client: "",
        role: "",
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
      title: "Fashion Films",
      color: "blue",
      kicker: "02",
      subtitle: "Visiones que se mueven",   // se ve en el menú desplegable de "Áreas"
      text: "Traduzco una visión en algo que se mueve. Ordeno ideas, tiempos y personas para que la pieza diga lo que tiene que decir, y no un poco más.",
      tags: ["Preproducción", "Guion", "Rodaje", "Dirección de arte", "Postproducción"],
      image: null,
      imageAlt: "Muestra de fashion film",
      projects: [
      {
        title: "Fashion film de ejemplo 01",
        year: "",
        client: "",
        role: "",
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        video: null,           // ej. "https://www.youtube.com/embed/ID" o "assets/video/film.mp4"
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
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        video: null,
        images: [
          { src: null, alt: "Fashion film — imagen 1", caption: "" },
          { src: null, alt: "Fashion film — imagen 2", caption: "" },
          { src: null, alt: "Fashion film — imagen 3", caption: "" }
        ]
      }
      ]
    },
    {
      id: "tendencias",
      title: "Tendencias",
      color: "green",
      kicker: "03",
      subtitle: "Lo evidente, dos veces",   // se ve en el menú desplegable de "Áreas"
      text: "Miro donde aparentemente no hay nada que mirar. Leo lo evidente dos veces, porque la segunda lectura suele ser la interesante.",
      tags: ["Investigación", "Moodboards", "Lectura cultural", "Forecasting", "Referencias"],
      image: null,
      imageAlt: "Muestra de investigación de tendencias",
      projects: [
      {
        title: "Investigación de ejemplo 01",
        year: "",
        client: "",
        role: "",
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
      id: "diseno-editorial",
      title: "Diseño Editorial",
      color: "orange",
      kicker: "04",
      subtitle: "El vacío también construye",   // se ve en el menú desplegable de "Áreas"
      text: "Dejo espacio para que los elementos respiren. Si todo llama la atención, nada realmente destaca. El vacío también construye ritmo, jerarquía y tensión.",
      tags: ["Retícula", "Tipografía", "Composición", "Jerarquía", "Ritmo"],
      image: null,
      imageAlt: "Muestra de diseño editorial",
      projects: [
      {
        title: "Pieza editorial de ejemplo 01",
        year: "",
        client: "",
        role: "",
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        images: [
          { src: null, alt: "Diseño editorial — imagen 1", caption: "" },
          { src: null, alt: "Diseño editorial — imagen 2", caption: "" },
          { src: null, alt: "Diseño editorial — imagen 3", caption: "" },
          { src: null, alt: "Diseño editorial — imagen 4", caption: "" },
          { src: null, alt: "Diseño editorial — imagen 5", caption: "" }
        ]
      },
      {
        title: "Pieza editorial de ejemplo 02",
        year: "",
        client: "",
        role: "",
        description: "Texto del proyecto: qué se pidió, qué se hizo y qué se aprendió. Reemplazar en js/config.js.",
        images: [
          { src: null, alt: "Diseño editorial — imagen 1", caption: "" },
          { src: null, alt: "Diseño editorial — imagen 2", caption: "" },
          { src: null, alt: "Diseño editorial — imagen 3", caption: "" }
        ]
      }
      ]
    },
    {
      id: "branding-marketing",
      title: "Branding & Marketing",
      color: "yellow",
      kicker: "05",
      subtitle: "Sistema, signos y comunicación",   // se ve en el menú desplegable de "Áreas"
      text: "Construyo algo complejo a partir de recursos simples. Color, tipografía, signos y composición funcionando como un mismo lenguaje. Esta marca es la prueba.",
      tags: ["Identidad", "Sistema", "Comunicación", "RR.PP.", "Estrategia"],
      image: "assets/img/mockup-tarjeta.webp",
      imageAlt: "Tarjeta amarilla con el logo [Lu - cía] sostenida en la mano",
      projects: [
      {
        title: "[Lu - cía]® — Identidad de marca personal",
        year: "",
        client: "Proyecto propio",
        role: "Concepto, identidad y sistema",
        description: "Mi nombre es mi identidad. No necesito construir un símbolo que me represente: parto de lo más literal. Tomo mi propio nombre y lo convierto en materia gráfica. Color, tipografía, signos, planos y composición funcionan como un mismo lenguaje.",
        images: [
          { src: "assets/img/mockup-subte.webp",     alt: "Afiche azul con el logo [Lu-] en un vagón de subte", caption: "Vía pública" },
          { src: "assets/img/mockup-tote.webp",      alt: "Bolsa de tela con el logo [Lu-] estampado", caption: "Tote bag" },
          { src: "assets/img/mockup-tarjeta.webp",   alt: "Tarjeta amarilla con el logo [Lu - cía] sostenida en la mano", caption: "Tarjeta" },
          { src: "assets/img/mockup-medias.webp",    alt: "Medias azules con etiqueta [Lu-]", caption: "Packaging" },
          { src: "assets/img/mockup-caballete.webp", alt: "Cartel caballete con una persona y el logo [Lu-]", caption: "Cartel" },
          { src: "assets/img/mockup-cartel.webp",    alt: "Cartel en la entrada del subte con los signos triángulo, círculo y cuadrado", caption: "Signos" },
          { src: "assets/img/lucia-imagen-creativa.webp", alt: "Imagen creativa: Lucía hoy señala una foto suya de chica", caption: "Imagen creativa" }
        ]
      },
      {
        title: "Proyecto de ejemplo 02",
        year: "",
        client: "",
        role: "",
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
