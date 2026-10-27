# [Lu - cía]® — Portfolio de Lucía Deregibus Mongardi

PR producer · Concept & Vision translator.
Sitio construido sobre la identidad de marca personal (TP2): una página principal con scroll vertical y una página por cada área con todos sus proyectos.

## Stack (y por qué)

HTML + CSS + JavaScript **vanilla**, sin build ni dependencias.

- El concepto de la marca es *reducción*: el código también. No hace falta Node, React ni un bundler para un sitio de una página.
- Las animaciones usan la **Web Animations API** (`element.animate`) y **IntersectionObserver**, nativos en todos los navegadores actuales. GSAP no aporta nada que justifique sumar ~70 KB en este caso.
- Se puede abrir `index.html` con doble clic y funciona (los scripts son clásicos, no módulos).

## Estructura

```
index.html            Página principal: estructura y textos fijos de las secciones
area.html             Página de cada área (area.html?a=fotografia, etc.)
css/styles.css        Estilos generales, tokens de color, responsive y movimiento reducido
css/area.css          Estilos solo de la página de área (portada, galería, visor)
js/config.js          ← CONFIGURACIÓN CENTRAL (email, redes, backstage, áreas y proyectos)
js/common.js          Código compartido: reveal, fondo, cursor y transición entre páginas
js/main.js            Animaciones e interacciones de la página principal
js/area.js            Arma la página de área desde config.js (proyectos, galería, visor)
assets/img/           Imágenes (WebP). backstage/ para las fotos del fondo
assets/logo/          logo.svg (estático) y favicon.svg
assets/fonts/         Fuente licenciada (Helvetica World), ver abajo
```

## Correrlo localmente

Opción rápida: abrir `index.html` en el navegador.

Opción recomendada (servidor local, igual que en producción):

```bash
npx http-server . -p 5500 -c-1
```

y entrar a http://localhost:5500.

## Reemplazar textos e imágenes

Todo lo que cambia seguido está en **`js/config.js`**:

| Qué | Dónde |
| --- | --- |
| Email de contacto | `contact.email` (hoy `contacto@ejemplo.com`) |
| Formulario con Formspree | `contact.formspreeEndpoint` (vacío = abre el cliente de correo) |
| Instagram / LinkedIn / Behance | `socials[].url` |
| Fotos de backstage del fondo | `backstage[]` → `src`, `alt`, `production` |
| Textos, tags e imagen de cada área | `services[]` |

**Backstage:** copiá las fotos a `assets/img/backstage/` (WebP, ~1600 px de ancho, < 250 KB) y poné la ruta en `src`, por ejemplo `"assets/img/backstage/editorial-01.webp"`. Mientras `src` sea `null` no se muestra foto: queda el fondo que va cambiando entre tonos claros de la paleta (`@keyframes tones` en `css/styles.css`, velocidad en `--tone-speed`). Las fotos se suman encima, suaves.

**Imagen de muestra de cada área (en el inicio):** en `services[].image` con su `imageAlt`.

### Cargar los proyectos de cada área

Al hacer clic en un área del inicio (o en "Ver todo") se abre su página con todos los proyectos. Cada área tiene una lista `projects` en `js/config.js`:

```js
projects: [
  {
    title: "Campaña Invierno",
    year: "2026",
    client: "Marca X",
    role: "Producción general",
    description: "Qué se pidió, qué se hizo y qué se aprendió.",
    video: "https://www.youtube.com/embed/ID_DEL_VIDEO",   // opcional (o "assets/video/film.mp4")
    images: [
      { src: "assets/img/fotografia/invierno-01.webp", alt: "Descripción de la foto", caption: "Portada" },
      { src: "assets/img/fotografia/invierno-02.webp", alt: "Descripción de la foto", caption: "" }
    ]
  }
]
```

- Las imágenes van en una carpeta por área, por ejemplo `assets/img/fotografia/`.
- Las imágenes se arman como un **collage 3D**: piezas superpuestas y apenas giradas, con marco tipo impresión; con el mouse se enderezan, se inclinan hacia el cursor y pasan al frente. El molde de posiciones es `COLLAGE` en `js/area.js`. Clic en cualquiera abre el visor (flechas del teclado o deslizar con el dedo).
- `year`, `client` y `role` son opcionales: si quedan vacíos, no se muestran.
- Para YouTube usá el link "embed" (`https://www.youtube.com/embed/ID`); para Vimeo, `https://player.vimeo.com/video/ID`.
- Hoy hay proyectos de ejemplo con placeholders (`src: null`) para que veas cómo queda. Branding & Marketing ya tiene el proyecto real de la identidad [Lu - cía]® con los mockups del PDF.
- Se pueden sumar o borrar proyectos e imágenes libremente; la página se arma sola.

**Textos de hero, About, manifiesto y bloques conceptuales:** están directamente en `index.html` (son textos literales del PDF y cambian poco).

Para convertir JPG/PNG a WebP: https://squoosh.app (gratis, en el navegador).

## Tipografía: Helvetica

Todo el sitio (títulos y cuerpos) usa Helvetica, a través de la familia `"Lu Helvetica"` definida al principio de `css/styles.css`. Busca la fuente en este orden:

1. **Archivos en `assets/fonts/`**: la única forma de que *todas* las visitas vean Helvetica. Helvetica es paga, así que necesitás una licencia **web** (Monotype / MyFonts / Adobe Fonts). Copiá los archivos con estos nombres (podés usar Helvetica World o Helvetica Neue, el nombre del archivo es lo de menos):
   - `HelveticaWorld-Regular.woff2`
   - `HelveticaWorld-Italic.woff2` (para "cía" en el logo)
   - `HelveticaWorld-Bold.woff2`
2. **Helvetica instalada en el dispositivo**: Mac e iPhone la traen de fábrica, así que ahí ya se ve en Helvetica aunque no haya archivos.
3. **Arial** si no encuentra ninguna de las dos. Windows y Android no traen Helvetica, así que en esos equipos se ve Arial hasta que cargues los archivos del paso 1.

Mientras falten los archivos, la consola del navegador muestra un 404 por cada uno. Es esperable y no rompe nada.

## Animaciones: dónde tocar

**`js/common.js`** (compartido entre páginas):

1. **Reveal**: agregá `data-reveal`, `data-reveal="clip"` o `data-reveal="wipe"` a cualquier elemento.
2. **Backstage**: intervalo en `config.js` → `backstageInterval`; opacidad y blur en `.backstage__slide` (CSS).
3. **Cursor** (`initCursor`): tamaño en `.cursor__dot` (CSS), seguimiento con `LERP`. Usa `mix-blend-mode: difference` para mostrar el negativo del color de abajo. Solo aparece con mouse.
4. **Transición entre páginas** (`wipeTo` / `wipeIn`): un círculo del color del área crece desde donde se hizo clic; al llegar, el color se desvanece. Duración en `WIPE_MS` / `IN_MS`.
5. **Menús desplegables** (`initNavMenus`): "Áreas" lista cada área con su `subtitle` (en `config.js`); "About" usa `ABOUT_ITEMS`.

**`js/intro.js`** (intro de entrada, solo en `index.html`): réplica de la referencia de círculos, dibujada en un `<canvas>` con una única timeline. La secuencia completa está documentada al principio del archivo.

- **Colores**: objeto `C` (hoy mapeado a la paleta; los originales de la referencia están anotados al lado).
- **Movimiento**: listas `RHO` (distancia al centro), `ANGLE` (giro), `SPLIT` (división en cuatro) y `EXIT` (salida), como `[segundo, valor]` medidos del video.
- **Duración**: `DURATION` (hoy 2 s, con el fundido final). La coreografía del video se reproduce comprimida a ese tiempo.
- **Ver un instante quieto** para ajustar: `index.html?intro-frame=2.4` (el número es el segundo del video original, de 0 a 5,2).
- Se ve una vez por sesión; con movimiento reducido no aparece; clic o tecla la saltean.

**`js/main.js`** (página principal):

1. **Logo** (`animateLogo`): cada pieza (corchetes, "Lu", guión, "cía", ®) tiene su `delay`, `duration` y keyframes.
2. **Hero** (`animateHero`): `stagger` y `startAt` controlan el ritmo del nombre y las píldoras.
3. **Parallax**: la intensidad se define en el HTML con `data-speed` (ej. `0.12`, negativo = va en contra).
4. **Áreas**: los paneles se abren con hover (mouse) o clic/toque; clic en el panel abierto o en "Ver todo" lleva a su página.
7. **Manifiesto** (`initManifesto`): ritmo del revelado con `WORD_DELAY` y `MAX_TOTAL`.
8. **Inclinación de la foto** (`initTilt`): grados máximos en `MAX_TILT`.
9. **Tarjeta identitaria** (`initVariants`): cambia sola cada `AUTO_MS` ms y también con clic. Lista `VARIANTS` (fondo, logo a color o blanco, color del texto chico).
10. **Formulario** (`initForm`): sin `formspreeEndpoint` abre el cliente de correo con `mailto:`; con endpoint envía a Formspree sin salir de la página.
11. **Destacados** (`initHighlights`): imágenes en `config.js` → `destacados`; cada cuánto se abre la siguiente en `destacadosInterval`.
12. **De la semana** (`renderWeekly`): canción y película al lado del logo, en `config.js` → `semana`. Se cambia a mano cada semana; si un título queda vacío, esa ficha no se muestra.

**`js/area.js`** (página de área): visor (`initLightbox`), entrada de la portada (`animateHero`) y links con transición (`initWipeLinks`).

Con `prefers-reduced-motion` activado no se ejecuta ninguna animación de desplazamiento y todo el contenido se muestra estático.

## Deploy

**Vercel (el que usamos):** el sitio está en GitHub (`nicoblan/Lucia-s-Portfolio`). En https://vercel.com/new → *Import* el repositorio → Framework Preset: **Other**, sin build command ni output directory → *Deploy*. Cada `git push` a `main` vuelve a publicar solo.

**Netlify:** arrastrá la carpeta del proyecto a https://app.netlify.com/drop. No hay build.

**GitHub Pages:**

1. Subí el proyecto a un repositorio.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `root`.
3. Al minuto queda en `https://USUARIO.github.io/REPO/`.

**Imagen para redes:** `assets/img/og-image.jpg` (1200×630). Está referenciada con la URL completa (`https://lucia-s-portfolio.vercel.app/...`) en `index.html` y `area.html`; si cambiás de dominio, actualizá esas URLs.
