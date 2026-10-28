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
area.html             Página de cada área (area.html?a=estilismo-fotografia, etc.)
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
| Email de contacto | `contact.email` (hoy `luchyderegibus@gmail.com`) |
| Envío del formulario | `contact.envio: "formsubmit"` manda cada mensaje directo al mail (formsubmit.co). **La primera vez llega un mail de activación: hay que confirmarlo una vez.** Más confiable: completar `contact.web3formsKey` (gratis en web3forms.com: se pone el mail y llega la clave). Alternativa: `contact.formspreeEndpoint`. Si el servicio no responde en 12 s, se abre el correo de quien escribe con el mensaje listo. |
| CV para descargar | `contact.cv` (hoy `assets/cv/CV-Lucia-Deregibus-Mongardi.pdf`, armado desde la imagen del CV del PDF; conviene reemplazarlo por el PDF original) |
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
- **Resumen**: al final de cada área hay un carrusel con una tarjeta por trabajo (primera imagen, título y `resumen` del proyecto).
- **Fashion Films** (`layout: "video"`): cada proyecto muestra su `video` en formato horizontal 16:9 con botón de pantalla completa; las imágenes van debajo como fotogramas.
- Las imágenes se arman como un **collage 3D**: piezas superpuestas y apenas giradas, con marco tipo impresión; con el mouse se enderezan, se inclinan hacia el cursor y pasan al frente. El molde de posiciones es `COLLAGE` en `js/area.js`. Clic en cualquiera abre el visor (flechas del teclado o deslizar con el dedo).
- **Trendforecast** (o cualquier área con `layout: "libro"`) presenta cada proyecto como un **cuaderno anillado que se hojea solo**, en cortes secos: tapa → dobles páginas → contratapa. Ahí la primera imagen es la **tapa** y las siguientes son las **páginas en orden** (de a dos por doble página); conviene subirlas verticales (3:4). Con el mouse encima se pausa y se hojea moviendo el cursor (derecha → izquierda abre, izquierda → derecha cierra; en celular, con el dedo); las flechas también pasan página. Tiempos en `PAGE_MS`, `COVER_MS` y `BACK_MS` (`js/area.js`).
- `year`, `client` (se muestra como "Contexto": materia, cliente, etc.) y `role` son opcionales: si quedan vacíos, no se muestran. En `description` se puede usar `

` para separar párrafos.
- Para YouTube usá el link "embed" (`https://www.youtube.com/embed/ID`); para Vimeo, `https://player.vimeo.com/video/ID`.
- Hoy hay proyectos de ejemplo con placeholders (`src: null`) para que veas cómo queda. Dirección Artística ya tiene el proyecto real de la identidad [Lu - cía]® con los mockups del PDF.
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

## Home: logo [Lu -] con video adentro

Réplica de la plantilla `[Lu -].pdf` (1440 × 810, fondo #1800ad). Las formas del logo están en `assets/logo/lu-mask.svg` (sacadas de la tipografía de la plantilla) y funcionan como **máscara** del video (`mask-image` en `.home__video`, `css/styles.css`).

- **Cambiar el video**: reemplazá `assets/video/home-loop.mp4` (y `home-loop.webm`, que Chrome y Firefox cargan primero) y el póster `assets/video/home-poster.jpg`.
- **Peso**: el MP4 actual pesa 6,7 MB (lo usa Safari). Conviene comprimirlo con **HandBrake** → preset *Web*, 1280×720, calidad RF 28 (queda en 1–2 MB) y reemplazarlo con el mismo nombre. El WebM ya está liviano (1,5 MB).
- Con *reducir movimiento* activado se muestra solo el póster.

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
11. **Recent projects** (`initHighlights`, sección `#recent-projects`): imágenes en `config.js` → `destacados`; cada cuánto se abre la siguiente en `destacadosInterval`.
12. **De la semana** (`renderWeekly`): canción y película al lado del logo, en `config.js` → `semana`. Se cambia a mano cada semana; si un título queda vacío, esa ficha no se muestra.
13. **Canción de fondo** (`initMusic`): si la canción tiene `youtube` (ID del video), suena desde el primer clic, toque o tecla en la página y aparece un mini reproductor en la esquina (pausa / cerrar). La ficha de la canción es el botón de play. Los navegadores no permiten que suene sola sin ese primer gesto, y YouTube exige que el reproductor esté visible (200×200 px como mínimo). Al sonar se ve la portada (`portada` en `config.js`; si no hay, la miniatura del video). El botón amarillo de la barra es play / pausa de la canción.
14. **Quién soy** (`initAboutPhoto`): la imagen creativa y la bio aparecen al hacer clic en el bloque azul "Quién soy" (o en "Quién soy" del menú About).

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
