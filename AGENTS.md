# RIBBIT — AGENTS.md

Guía para agentes (y humanos) que trabajen en este repo. RIBBIT es un animador de SVG con
exportación a video **AVI lossless BGRA con canal alfa**, pensado para superponer texto animado
sobre video en editores profesionales (Premiere/After Effects/Resolve).

## Stack

- Vite + React 19 + TypeScript (scaffold `react-ts` estándar).
- Sin dependencias de runtime más allá de `react`/`react-dom`: el parseo SVG usa `DOMParser`
  nativo, la rasterización usa `Image` + `<canvas>`, y el contenedor AVI se arma a mano con
  `DataView`/`Uint8Array`. No hay backend ni build step aparte de Vite.
- Comandos: `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run lint`.

## Flujo de datos de alto nivel

```
useSvgFiles          → mesa de trabajo (hasta 5 SVGs), archivo activo
        │
useSvgScene(file,cfg) → parsea el SVG (svgParser) + construye la escena (frameRenderer.buildScene)
        │                según config.textEditActive → devuelve { parsed, renderer, totalDuration }
        │
usePlayback(duration) → loop de rAF que acumula tiempo real (t) y llama renderer.applyTime(t, cfg)
        │
FrameRenderer.applyTime → muta atributos SVG en vivo (transform/opacity/dash/filter) por letra
```

`App.tsx` es el único lugar que junta estos tres hooks; los componentes de `components/` son
puramente de presentación y reciben todo por props (config + callback `onChange(patch)`).

## Piezas clave en `src/lib/`

- **`easings.ts`**: `backOut`/`elasticOut`/`easeOut`/`bounceOut`, todas normalizadas para que
  `f(0) = 0` y `f(1) = 1` (verificado). `backOut`/`elasticOut` hacen overshoot fuera de `[0,1]`
  a propósito (efecto resorte/rebote).
- **`animationEngine.ts`**: `computeFrameState(t, letter, config)` es una **función pura del
  tiempo**, no de `requestAnimationFrame`. Esto es el invariante más importante del proyecto:
  el preview en vivo (`usePlayback`, acumulando `performance.now()`) y el exportador
  (`exportEngine`, con `t = frameIndex / fps` fijo) llaman exactamente la misma función, así que
  el video exportado es pixel-a-pixel consistente con lo que se ve en pantalla.
- **`motionBlur.ts`**: envuelve `computeFrameState` calculando velocidad por diferencia finita
  entre `t` y `t - 1/fps` (un "frame de obturador"). El blur es siempre vertical porque el motor
  sólo produce desplazamiento en Y (Slide Y); si en el futuro se agrega desplazamiento en X hay
  que revisar `blurAngle`.
- **`svgParser.ts`**: separa los hijos del SVG en `outlineLetters` (stroke sin fill → write-on),
  `fillLetters` (fill sólido → relleno retardado) y `extraGroups` (grupos cuyo `id`/`class`
  matchea `/bg|background|mascot|logo|deco/i`, preservados sin animar). Requiere adjuntar el SVG
  a un host oculto pero en el DOM (`getHiddenHost`) porque `getBBox()`/`getComputedStyle()` no
  son fiables en elementos completamente desconectados en todos los navegadores.
- **`textLayout.ts`**: en modo edición de texto, distribuye cada carácter a lo largo de un arco
  circular (relación sagitta-cuerda-radio, curvatura ∝ `fontSize`) y genera un `<g>` por letra
  con `data-base-transform` (la rotación del arco) que `frameRenderer` compone con la animación
  de entrada.
- **`frameRenderer.ts`**: `buildScene()` decide qué letras están activas (oculta los paths
  originales y inyecta las líneas de texto cuando `config.textEditActive`). `FrameRenderer` crea
  un `<filter>`/`feGaussianBlur` por letra (para motion blur) y en `applyTime()` escribe
  `transform`/`opacity`/`stroke-dasharray`/`fill-opacity`/`filter`/colores directamente como
  atributos SVG — sin re-render de React — para que la animación corra a 60fps sin trabajo del
  reconciler.
- **`aviWriter.ts`**: contenedor RIFF/AVI armado a mano (`avih`/`strh`/`strf` con
  `BITMAPINFOHEADER` 32bpp `BI_RGB`, `movi` con chunks `00dc`, `idx1`). Los frames se guardan
  **BGRA bottom-up** (requisito del DIB con `biHeight` positivo). Verificado con un script
  standalone en Node que arma un video de 2 frames y confirma magic bytes + orden de canales.
- **`exportEngine.ts`**: por cada frame, aplica `renderer.applyTime(frameIndex/fps, config)`
  sobre el SVG activo (el mismo nodo que usa el preview, no un clon), lo serializa
  (`XMLSerializer`), lo rasteriza vía `Image` + canvas offscreen, y alimenta `AVIWriter`. Al
  terminar restaura `viewBox`/`width`/`height` originales; el caller (`App.tsx`) debe re-aplicar
  el tiempo de preview actual después (ver `resyncSignal`).

## Convenciones de React a tener en cuenta

- Este proyecto usa una versión de `eslint-plugin-react-hooks` que **prohíbe mutar
  `ref.current` durante el render** (patrón "latest ref"). Esas asignaciones van dentro de un
  `useEffect` (ver `usePlayback.ts`, `useSvgFiles.ts`, `PreviewPane.tsx`). No revertir a
  `ref.current = x` fuera de un effect/callback.
- `tsconfig.app.json` tiene `erasableSyntaxOnly: true`: no usar parameter properties en
  constructores (`constructor(private x: number)`) — hay que declarar el campo y asignarlo en el
  cuerpo del constructor (ver `AVIWriter`, `FrameRenderer`).
- El deps-array de varios `useMemo`/`useEffect` es intencionalmente parcial (p. ej. `useSvgScene`
  sólo re-parsea cuando cambia `activeFile?.id`, no en cada cambio de `config`). Estos casos
  llevan `eslint-disable-next-line react-hooks/exhaustive-deps` — es deliberado, no un descuido.

## Decisiones ya tomadas (no repreguntar)

- Arquitectura: React/TS dentro del scaffold Vite, **no** un `index.html` vanilla suelto.
- Tipografías premium del brief original (Aeonik, Satoshi, BentonSans, Bhineka, Korb) están
  fuera de alcance; sólo se usan Google Fonts enlazadas en `index.html` (Anybody, Barlow
  Condensed, Outfit, Inter) + fallback de sistema (`"Arial Black", Impact, sans-serif`).
- El plan completo de la primera implementación está en
  `C:\Users\user\.claude\plans\quiero-hacer-este-proyecto-luminous-locket.md` si hace falta el
  razonamiento original.

## Pendiente de verificación manual (no se pudo probar en navegador real)

La lógica pura (easings, motor de animación, escritor AVI) se verificó con un script Node
standalone fuera del repo. Falta lo que requiere un navegador real:

1. Subir un SVG real y confirmar que `svgParser` clasifica bien outline/fill/extra en un
   archivo exportado desde Illustrator/Figma (la heurística por `computedStyle` puede fallar si
   el SVG usa clases CSS externas en vez de atributos `fill`/`stroke` inline). Sólo se probó con
   un SVG sintético (paths duplicados stroke+fill) usado para validar el motor de animación.
2. Comprobar visualmente el modo edición de texto (curvatura del arco, tracking, tamaños Y).
3. Confirmar que el AVI exportado abre con transparencia real en Premiere/AE/Resolve/VLC/ffprobe.
4. Confirmar drag&drop de archivos sobre el preview y el límite de 5 archivos en la mesa de
   trabajo.
