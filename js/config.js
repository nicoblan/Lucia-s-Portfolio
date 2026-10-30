/* ==========================================================================
   CONFIGURACIÓN CENTRAL — [Lu - cía]®
   --------------------------------------------------------------------------
   Todo lo que cambia seguido vive acá: email, redes, imágenes de backstage
   y textos de las áreas. No hace falta tocar el HTML para actualizarlos.
   Se carga como script clásico (no módulo) para que el sitio funcione
   también abriendo index.html con doble clic.
   ========================================================================== */

/* Páginas de un cuaderno (Trendforecast): assets/img/trend/<carpeta>/01.jpg,
   02.jpg… hasta `n`, en orden. */
function paginas(carpeta, n, titulo) {
  return Array.from({ length: n }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return { src: `assets/img/trend/${carpeta}/${num}.jpg`, alt: `${titulo} — página ${i + 1}`, caption: "" };
  });
}

window.SITE_CONFIG = {
  /* ---------- Contacto ---------- */
  contact: {
    email: "luchyderegibus@gmail.com",   // a dónde llegan los mensajes del formulario
    // envio: "formsubmit" manda el mensaje directo a ese mail (servicio gratuito
    // formsubmit.co). La PRIMERA vez llega un mail de activación: hay que
    // confirmarlo una sola vez y desde ahí llegan todos los mensajes.
    envio: "formsubmit",
    // Más confiable: Web3Forms (gratis). Entrá a https://web3forms.com, poné
    // luchyderegibus@gmail.com y te llega por mail una "Access Key": pegala acá.
    // Si está completa, se usa en lugar de formsubmit.
    web3formsKey: "",
    // Alternativa: endpoint de Formspree (https://formspree.io/f/XXXX). Si se
    // completa, se usa en lugar de formsubmit.
    formspreeEndpoint: "",
    cv: "assets/cv/CV-Lucia-Deregibus-Mongardi.pdf"   // botón "Descargar CV" en Contacto
  },

  /* ---------- Redes ---------- */
  socials: [
    { id: "instagram", label: "Instagram", url: "https://www.instagram.com/lderegibus____/" },
    { id: "linkedin",  label: "LinkedIn",  url: "https://www.linkedin.com/in/lucia-deregibus-mongardi-96272822a/" },
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
                 images[]: { src, alt, caption, pos, forma }  (src null = placeholder)
                 Puede haber cualquier cantidad de fotos: el collage se arma solo.
                 forma (opcional): "h" si la foto es horizontal (por defecto, vertical).
                 pos (opcional): qué parte de la foto se ve cuando el recuadro
                 la recorta, ej. "50% 20%" = centrada y más arriba (la cara).
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
      image: "assets/img/portada-estilismo.jpg",
      imageAlt: "Lucía sentada en el pasto bajo los árboles, con saco negro y pollera blanca",
      projects: [
      {
        title: "Las Pepas",
        year: "",
        client: "Materia Fotografía de moda",
        role: "Estilismo",
        resumen: "Campaña en exteriores y contenido para redes, sin perder los valores de la marca.",   // 1 línea para el carrusel del final
        description: "Para este proyecto de la materia Fotografía de moda, bajo la consigna de crear una campaña en exteriores y material para redes sociales, con su partido conceptual, realizamos un mapa de diseño, moodboard, estilismo y análisis de campañas anteriores para crear una nueva temática e historia, manteniendo los valores y el concepto propio de la marca.",
        images: [
          { src: "assets/img/pepas/01.jpg", alt: "Las Pepas — modelo agachada en el asfalto con camisa naranja con plumas y pantalón plateado", caption: "", pos: "50% 20%" },
          { src: "assets/img/pepas/02.jpg", alt: "Las Pepas — detalle de puños de plumas lilas, pantalón plateado y zapatos atados", caption: "" },
          { src: "assets/img/pepas/03.jpg", alt: "Las Pepas — modelo con campera roja y pollera blanca apoyada en un farol dorado", caption: "" },
          { src: "assets/img/pepas/04.jpg", alt: "Las Pepas — las dos modelos en un puesto de flores", caption: "" },
          { src: "assets/img/pepas/05.jpg", alt: "Las Pepas — detalle de campera roja, cinturón y pollera blanca junto al farol", caption: "" }
        ]
      },
      {
        title: "Shooting conceptual",
        year: "",
        client: "Materia Fotografía de moda",
        role: "Dirección de arte, estilismo y fotografía",
        resumen: "Un shooting en exteriores a partir de una sola palabra: Waldeinsamkeit.",   // 1 línea para el carrusel del final
        description: "Para este proyecto de la materia Fotografía de moda, bajo la consigna de realizar un shooting en exteriores partiendo de una palabra —en este caso, Waldeinsamkeit—, con su partido conceptual, realicé un mapa de diseño, moodboard y estilismo.\n\nWaldeinsamkeit: «El sentimiento de soledad y conexión con la naturaleza cuando se está a solas en el bosque».",
        images: [
          { src: "assets/img/shooting-conceptual/01.jpg", alt: "Shooting conceptual — retrato de la modelo con saco negro en el bosque", caption: "", pos: "50% 30%" },
          { src: "assets/img/shooting-conceptual/02.jpg", alt: "Shooting conceptual — modelo con vestido rojo agachada entre la vegetación", caption: "", forma: "h" },
          { src: "assets/img/shooting-conceptual/03.jpg", alt: "Shooting conceptual — modelo acostada en el pasto, vista desde arriba", caption: "" },
          { src: "assets/img/shooting-conceptual/04.jpg", alt: "Shooting conceptual — modelo recostada sobre la rama de un árbol", caption: "", forma: "h" },
          { src: "assets/img/shooting-conceptual/05.jpg", alt: "Shooting conceptual — modelo apoyada en un árbol, en un claro del bosque", caption: "", forma: "h" },
          { src: "assets/img/shooting-conceptual/06.jpg", alt: "Shooting conceptual — modelo de pie entre pastos altos", caption: "", forma: "h" },
          { src: "assets/img/shooting-conceptual/07.jpg", alt: "Shooting conceptual — modelo con los brazos en alto bajo un tronco", caption: "", pos: "50% 30%" }
        ]
      },
      {
        title: "Foto beauty",
        year: "",
        client: "Fotografía digital",
        role: "Dirección de arte, estilismo y fotografía",
        resumen: "Fotos en crudo: una pequeña selección de fotografía digital.",   // 1 línea para el carrusel del final
        description: "",   // sin texto debajo del título
        images: [
          { src: "assets/img/foto-beauty/01.jpg", alt: "Foto beauty — modelo sentada con fondo oscuro", caption: "" },
          { src: "assets/img/foto-beauty/02.jpg", alt: "Foto beauty — modelo con el pelo en movimiento", caption: "" },
          { src: "assets/img/foto-beauty/03.jpg", alt: "Foto beauty — primer plano de la mirada con pañuelo azul", caption: "" }
        ]
      },
      {
        // también está en Trendforecast (ahí como cuaderno); acá, solo las fotos
        title: "Pre adolescentes",
        year: "",
        client: "Laboratorio de tendencias",
        role: "Dirección de arte, estilismo, fotografía y casting",
        resumen: "Fotos en crudo de la entrega final de laboratorio de tendencias.",   // 1 línea para el carrusel del final
        description: "",   // sin texto debajo del título
        images: [
          { src: "assets/img/pre-adolescentes/01.jpg", alt: "Pre adolescentes — una nena sentada en el piso y otra agachada", caption: "" },
          { src: "assets/img/pre-adolescentes/02.jpg", alt: "Pre adolescentes — tres nenas jugando, vistas desde arriba", caption: "" },
          { src: "assets/img/pre-adolescentes/03.jpg", alt: "Pre adolescentes — dos nenas agachadas con abrigos de lana", caption: "" },
          { src: "assets/img/pre-adolescentes/04.jpg", alt: "Pre adolescentes — tres nenas mirando a cámara desde abajo", caption: "" },
          { src: "assets/img/pre-adolescentes/05.jpg", alt: "Pre adolescentes — tres nenas tirando de una prenda sobre baúles", caption: "" },
          { src: "assets/img/pre-adolescentes/06.jpg", alt: "Pre adolescentes — tres nenas abrazadas sobre un baúl", caption: "" }
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
        title: "Lo que ha sido pesado",
        year: "",
        client: "",
        role: "",
        resumen: "Fashion film académico sobre un objeto antimoda: la mancuerna.",   // 1 línea para el carrusel del final
        description: "Fashion film académico con la consigna de trabajar un objeto antimoda, como lo fue en este caso la mancuerna.\n\nMi rol fue directora de fotografía, montaje, diseño sonoro y guionista.",
        video: "assets/video/lo-que-ha-sido-pesado.mp4",
        images: []
      },
      {
        title: "Qué es la moda para mí",
        year: "",
        client: "",
        role: "",
        resumen: "Fashion film experimental con estética de los años 60.",   // 1 línea para el carrusel del final
        description: "Fashion film académico de carácter experimental bajo la consigna «¿Qué es la moda para mí?», ambientado y dirigido bajo una estética de los años 60.\n\nMi rol fue directora de fotografía, montaje, diseño sonoro y guionista.",
        video: null,   // pendiente: falta el video (va como .mp4 en assets/video/)
        images: []
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
      text: "Relevamiento de diseñadores y temporadas anteriores, diferentes universos para relacionar tipologías, texturas, premisas y conceptos. Análisis de tipologías y campañas para poder detectar futuras tendencias (micro y macro). Cartas de materiales, partidos morfológicos y conceptuales. Creación de diferentes tipologías y elementos que representen las nuevas tendencias.",
      tags: ["Investigación de tendencias","Coolhunting","Análisis cultural","Lectura de consumo","Moodboards","Reportes de tendencias","Forecasting"],   // 7 palabras clave: roles
      image: null,
      imageAlt: "Muestra de trendforecast",
      /* En los cuadernos: `images` son las páginas del PDF (con paginas()),
         `pageRatio` es ancho ÷ alto de UNA página y `pdf` es el archivo que
         se descarga con el botón "Descargar PDF". */
      projects: [
      {
        title: "Pre adolescentes",
        etiqueta: "Trabajo destacado",
        year: "2027/2028",
        client: "Trend report · Sector preadolescente",
        role: "",
        resumen: "Trend report 2027/2028 del sector preadolescente: los videojuegos como estilo de vida.",   // 1 línea para el carrusel del final
        description: "Desarrollo de una macrotendencia nacida a partir de la idea de los videojuegos como nuevo estilo de vida preadolescente, donde cambia su manera de vincularse con el mundo, con sus pares, su familia y su manera de consumir.\n\nLo que derivó en tres microtendencias, cada una interpretada como un nivel de juego más que nos lleva a volver a vincularnos de manera física conviviendo con la tecnología.",
        pdf: "assets/pdf/Pre-adolescentes-Trend-Report.pdf",
        pageRatio: 0.707,
        images: paginas("pre-adolescentes", 26, "Pre adolescentes")
      },
      {
        title: "Ritos gastronómicos",
        year: "2027/2028",
        client: "Trend report · Sector gastronómico",
        role: "",
        resumen: "Trend report 2027/2028 del sector gastronómico: el café como experiencia de lujo.",   // 1 línea para el carrusel del final
        description: "Desarrollo de una macrotendencia nacida a partir de la idea de “si hoy en día todos los cafés son de especialidad, ¿qué lo hace realmente especial?”.\n\nDonde encontramos como respuesta al café como una nueva experiencia sensorial de exclusividad y lujo, donde entendamos la trazabilidad del mismo, desde el grano hasta la bebida.",
        pdf: "assets/pdf/Ritos-Gastronomicos-Trend-Report.pdf",
        pageRatio: 1,
        images: paginas("ritos-gastronomicos", 42, "Ritos gastronómicos")
      },
      {
        title: "ArteBA",
        year: "",
        client: "Análisis de tendencias",
        role: "",
        resumen: "Libro de tendencias en formato horizontal.",   // 1 línea para el carrusel del final
        description: "",
        pdf: "assets/pdf/ArteBA.pdf",
        pageRatio: 2,   // libro horizontal rectangular
        images: paginas("arteba", 29, "ArteBA")
      },
      {
        title: "La cosmética del futuro",
        year: "2070",
        client: "Investigación de tendencias · Cosmética",
        role: "",
        resumen: "La cosmética como herramienta de construcción de la imagen personal.",   // 1 línea para el carrusel del final
        description: "La investigación de tendencias analizó el universo de la cosmética para identificar una posible macrotendencia orientada al consumo futuro de los preadolescentes en el año 2070. Se exploró la relación entre la ilusión, la simulación y el efecto placebo.\n\nLa investigación plantea que la cosmética podría dejar de cumplir una función exclusivamente práctica para convertirse en una herramienta de construcción de la imagen personal, donde la apariencia y la percepción adquieren mayor importancia que la funcionalidad real del producto.",
        pdf: "assets/pdf/La-Cosmetica-del-Futuro.pdf",
        pageRatio: 1,
        images: paginas("cosmetica-del-futuro", 44, "La cosmética del futuro")
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
