---
titulo: "Plan de implementación: Tablao de Palabras (Juego 1)"
tipo: plan de implementación
fecha: 03-10-2026
estado: pendiente de revisión
---

# Tablao de Palabras: plan de implementación

> **Para agentes ejecutores:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development (recomendada) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** juego web para iPad que entrena el armado de frases en inglés mediante un recorrido Mapa → Escucha → Piano → Voz → Captura, con repaso espaciado.

**Arquitectura:** lógica pura en `src/logica/` (sin Phaser ni navegador, probada con Vitest); servicios de navegador en `src/servicios/` (voz y música); escenas de Phaser en `src/escenas/` que solo dibujan y delegan. El estado compartido vive en `src/sesion.js`.

**Tecnologías:** Phaser 3.90.x, Vite, Vitest, vite-plugin-pwa, Node 24, GitHub Pages.

**Diseño:** `docs/superpowers/specs/2026-10-03-juego-ingles-flamenco-design.md`. Leerlo antes de ejecutar.

## Restricciones globales

- Raíz del repositorio: `C:\Users\Gfigueroa\Juegos`. Código del juego en `juego-ingles/`. Todos los comandos se ejecutan desde `juego-ingles/` salvo los de git.
- En PowerShell, `npm` está bloqueado por la política de ejecución: usar la herramienta Bash o `npm.cmd`.
- Lienzo lógico de 1024 × 768, horizontal, escalado con `Phaser.Scale.FIT`.
- Botones de al menos 110 px lógicos de diámetro (2 cm en iPad).
- Navegación solo con íconos. Ningún paso exige leer.
- Sin vidas ni "game over". Ante un error, la frase se repite más lento.
- Sin archivos de audio ni de imagen dentro del juego: sonido por Web Audio, voz por `speechSynthesis`, figuras por código y emoji. Única excepción: los íconos PNG de instalación.
- Voz en inglés de Estados Unidos (`en-US`).
- Sin personajes, nombres ni imágenes de Pokémon.
- Nombres de módulos, funciones y variables en español, como en el diseño.
- Los `commit` requieren `git config user.name` y `user.email` ya definidos. Terminar cada mensaje con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Publicar en GitHub (tarea 7) exige confirmación explícita de Gonzalo antes del primer `push`.

## Foco de revisión

1. **Datos guardados dañados o de otra versión** → el juego parte de cero sin fallar. Prueba en tarea 3.
2. **La fecha del iPad retrocede o salta** (viaje, cambio manual) → ningún repaso se pierde ni falla; solo espera. Prueba en tarea 3.
3. **La voz de iOS no avisa que terminó de hablar, o no existe** → el recorrido continúa por tiempo límite. Prueba en tarea 4.
4. **Domingo → lunes y fin de mes o de año** en las frases de día y en las fechas de repaso. Prueba en tarea 1.
5. **Toques repetidos o tras completar la frase** → no se coloca un bloque dos veces ni se rompe el intento. Prueba en tarea 2.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `juego-ingles/package.json`, `vite.config.js`, `index.html` | Proyecto, construcción, página |
| `src/constantes.js` | Medidas del lienzo |
| `src/logica/calendario.js` | Claves de día, suma de días, nombre del día |
| `src/logica/contenido.js` | Las 8 frases, sus bloques y criaturas; escala musical |
| `src/logica/frase.js` | Resolver frases con fecha real, opciones de escucha, teclas por nivel, validación del intento |
| `src/logica/progreso.js` | Estado guardado: cargar, guardar, registrar éxito o fallo |
| `src/logica/repaso.js` | Qué criaturas están disponibles hoy y en qué nivel |
| `src/servicios/voz.js` | Pronunciar texto con límite de tiempo |
| `src/servicios/musica.js` | Notas, palmas, compás |
| `src/sesion.js` | Estado compartido entre escenas |
| `src/escenas/dibujo.js` | Bailarina, criatura, botón, tarjeta |
| `src/escenas/Inicio.js`, `Mapa.js`, `Coleccion.js`, `Escucha.js`, `Piano.js`, `Voz.js`, `Captura.js` | Una pantalla cada una |
| `src/main.js` | Arranque de Phaser |
| `tests/*.test.js` | Pruebas de `logica` y `servicios` |
| `scripts/generar-iconos.mjs` | Íconos PNG de instalación |
| `.github/workflows/pages.yml` | Publicación |

---

## Tarea 1: proyecto base y calendario

**Archivos:**
- Crear: `.gitignore`, `juego-ingles/package.json`, `juego-ingles/vite.config.js`, `juego-ingles/index.html`, `juego-ingles/src/constantes.js`, `juego-ingles/src/logica/calendario.js`
- Prueba: `juego-ingles/tests/calendario.test.js`

**Interfaces:**
- Produce: `ANCHO = 1024`, `ALTO = 768`; `DIAS: string[]` (domingo primero); `claveDia(fecha: Date): string` con formato `AAAA-MM-DD` en hora local; `sumarDias(clave: string, n: number): string`; `indiceDia(fecha: Date, desplazamiento = 0): number` (0 = domingo); `nombreDia(fecha: Date, desplazamiento = 0): string`.

- [ ] **Paso 1: crear el proyecto**

`.gitignore` (raíz del repositorio):

```
node_modules/
dist/
dev-dist/
```

`juego-ingles/package.json`:

```json
{
  "name": "tablao-de-palabras",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview --host",
    "test": "vitest run",
    "iconos": "node scripts/generar-iconos.mjs"
  }
}
```

Instalar dependencias:

```bash
npm install phaser@~3.90.0
npm install -D vite vitest vite-plugin-pwa
```

`juego-ingles/vite.config.js`:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  test: { environment: 'node' },
});
```

`juego-ingles/index.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Tablao" />
    <link rel="apple-touch-icon" href="./icono-180.png" />
    <title>Tablao de Palabras</title>
    <style>
      html, body { margin: 0; height: 100%; background: #fdf0d5; overflow: hidden; }
      body { touch-action: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
      #juego { width: 100vw; height: 100vh; }
      #girar { display: none; position: fixed; inset: 0; background: #fdf0d5; font-size: 120px;
               align-items: center; justify-content: center; z-index: 10; }
      @media (orientation: portrait) { #girar { display: flex; } }
    </style>
  </head>
  <body>
    <div id="juego"></div>
    <div id="girar">🔄</div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

`juego-ingles/src/constantes.js`:

```js
export const ANCHO = 1024;
export const ALTO = 768;
```

- [ ] **Paso 2: escribir la prueba que falla**

`juego-ingles/tests/calendario.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { claveDia, sumarDias, nombreDia, indiceDia } from '../src/logica/calendario.js';

describe('calendario', () => {
  it('formatea la clave del día en hora local', () => {
    expect(claveDia(new Date(2026, 9, 3, 23, 59))).toBe('2026-10-03');
    expect(claveDia(new Date(2026, 0, 5, 0, 1))).toBe('2026-01-05');
  });

  it('suma días cruzando fin de mes y de año', () => {
    expect(sumarDias('2026-10-03', 1)).toBe('2026-10-04');
    expect(sumarDias('2026-10-31', 1)).toBe('2026-11-01');
    expect(sumarDias('2026-12-30', 3)).toBe('2027-01-02');
  });

  it('nombra el día de hoy y el de mañana', () => {
    const sabado = new Date(2026, 9, 3, 12);
    expect(nombreDia(sabado)).toBe('Saturday');
    expect(nombreDia(sabado, 1)).toBe('Sunday');
  });

  it('da la vuelta de domingo a lunes', () => {
    const domingo = new Date(2026, 9, 4, 12);
    expect(nombreDia(domingo, 1)).toBe('Monday');
    expect(indiceDia(domingo, 1)).toBe(1);
    expect(indiceDia(domingo, 5)).toBe(5);
  });
});
```

- [ ] **Paso 3: ejecutar y comprobar que falla**

Ejecutar: `npm test`
Esperado: FALLA, no se encuentra `../src/logica/calendario.js`.

- [ ] **Paso 4: implementar**

`juego-ingles/src/logica/calendario.js`:

```js
export const DIAS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function claveDia(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function sumarDias(clave, n) {
  const [anio, mes, dia] = clave.split('-').map(Number);
  return claveDia(new Date(anio, mes - 1, dia + n));
}

export function indiceDia(fecha, desplazamiento = 0) {
  return (fecha.getDay() + desplazamiento) % 7;
}

export function nombreDia(fecha, desplazamiento = 0) {
  return DIAS[indiceDia(fecha, desplazamiento)];
}
```

- [ ] **Paso 5: ejecutar y comprobar que pasa**

Ejecutar: `npm test`
Esperado: 4 pruebas aprobadas.

- [ ] **Paso 6: commit**

```bash
git -C /c/Users/Gfigueroa/Juegos add .gitignore docs juego-ingles
git -C /c/Users/Gfigueroa/Juegos commit -m "Proyecto base del juego de inglés y módulo de calendario"
```

---

## Tarea 2: contenido y lógica de frases

**Archivos:**
- Crear: `juego-ingles/src/logica/contenido.js`, `juego-ingles/src/logica/frase.js`
- Prueba: `juego-ingles/tests/contenido.test.js`, `juego-ingles/tests/frase.test.js`

**Interfaces:**
- Consume: `nombreDia`, `indiceDia` de `calendario.js`.
- Produce:
  - `ESCALA: number[]` (notas MIDI, mi frigio); `FRASES: DefinicionFrase[]`.
  - `DefinicionFrase = { id, criatura: { nombre, color, emoji }, bloques: (Bloque | { dia })[], imagen: Imagen | { dia }, otras: (Imagen | { dia })[], distractor: Bloque | { dia } }`, con `Bloque = { texto, icono }` e `Imagen = { tipo: 'emoji', valor }`.
  - `resolverFrase(def, fecha: Date): Frase`, con `Frase = { id, criatura, texto, bloques: { texto, icono, nota }[], imagen, otras, distractor }`; las imágenes de día quedan como `{ tipo: 'dia', indice }`.
  - `mezclar(lista, azar = Math.random): any[]`.
  - `opcionesEscucha(frase, azar?): { imagen, correcta: boolean }[]` (3 elementos).
  - `teclasParaNivel(frase, nivel: 1|2|3, azar?): Bloque[]`.
  - `crearIntento(frase): { tocar(bloque): { ok, completa?, pista? }, erroresTotales: number }`.
  - `UMBRAL_FALLO = 3`: con 3 o más errores en el piano, un repaso cuenta como fallado.

- [ ] **Paso 1: escribir las pruebas que fallan**

`juego-ingles/tests/contenido.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { FRASES, ESCALA } from '../src/logica/contenido.js';

describe('contenido', () => {
  it('tiene 8 frases con identificador único', () => {
    expect(FRASES).toHaveLength(8);
    expect(new Set(FRASES.map((f) => f.id)).size).toBe(8);
  });

  it('cada frase tiene entre 3 y 5 bloques y cabe en la escala', () => {
    for (const f of FRASES) {
      expect(f.bloques.length).toBeGreaterThanOrEqual(3);
      expect(f.bloques.length).toBeLessThanOrEqual(5);
      expect(f.bloques.length).toBeLessThanOrEqual(ESCALA.length);
    }
  });

  it('cada frase tiene dos imágenes alternativas distintas de la correcta', () => {
    for (const f of FRASES) {
      const todas = [f.imagen, ...f.otras].map((i) => JSON.stringify(i));
      expect(f.otras).toHaveLength(2);
      expect(new Set(todas).size).toBe(3);
    }
  });

  it('ningún bloque ni distractor se repite dentro de una frase', () => {
    for (const f of FRASES) {
      const textos = [...f.bloques, f.distractor].map((b) => JSON.stringify(b));
      expect(new Set(textos).size).toBe(textos.length);
    }
  });
});
```

`juego-ingles/tests/frase.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { FRASES } from '../src/logica/contenido.js';
import {
  resolverFrase, opcionesEscucha, teclasParaNivel, crearIntento, mezclar,
} from '../src/logica/frase.js';

const sabado = new Date(2026, 9, 3, 12);
const domingo = new Date(2026, 9, 4, 12);
const def = (id) => FRASES.find((f) => f.id === id);
const sinAzar = () => 0.999;

describe('resolverFrase', () => {
  it('arma el texto y asigna una nota a cada bloque', () => {
    const frase = resolverFrase(def('dosgatos'), sabado);
    expect(frase.texto).toBe('I see two cats');
    expect(frase.bloques.map((b) => b.texto)).toEqual(['I see', 'two', 'cats']);
    expect(frase.bloques.every((b) => Number.isInteger(b.nota))).toBe(true);
  });

  it('usa el día real en las frases de hoy y de mañana', () => {
    expect(resolverFrase(def('hoy'), sabado).texto).toBe('Today is Saturday');
    expect(resolverFrase(def('manana'), sabado).texto).toBe('Tomorrow is Sunday');
    expect(resolverFrase(def('manana'), domingo).texto).toBe('Tomorrow is Monday');
  });

  it('entrega imágenes de día con índice de la semana', () => {
    const frase = resolverFrase(def('manana'), domingo);
    expect(frase.imagen).toEqual({ tipo: 'dia', indice: 1 });
    expect(frase.otras).toEqual([{ tipo: 'dia', indice: 3 }, { tipo: 'dia', indice: 5 }]);
  });
});

describe('opcionesEscucha', () => {
  it('entrega tres opciones con exactamente una correcta', () => {
    const opciones = opcionesEscucha(resolverFrase(def('gato'), sabado));
    expect(opciones).toHaveLength(3);
    expect(opciones.filter((o) => o.correcta)).toHaveLength(1);
  });
});

describe('teclasParaNivel', () => {
  const frase = resolverFrase(def('gato'), sabado);

  it('en nivel 1 entrega los bloques en orden', () => {
    expect(teclasParaNivel(frase, 1)).toEqual(frase.bloques);
  });

  it('en nivel 2 entrega los mismos bloques, nunca en el orden correcto', () => {
    for (const azar of [sinAzar, () => 0, Math.random]) {
      const teclas = teclasParaNivel(frase, 2, azar);
      expect(teclas).toHaveLength(3);
      expect(new Set(teclas)).toEqual(new Set(frase.bloques));
      expect(teclas).not.toEqual(frase.bloques);
    }
  });

  it('en nivel 3 agrega el distractor', () => {
    const teclas = teclasParaNivel(frase, 3, sinAzar);
    expect(teclas).toHaveLength(4);
    expect(teclas.map((t) => t.texto)).toContain('cats');
    expect(teclas.slice(0, 3)).not.toEqual(frase.bloques);
  });
});

describe('mezclar', () => {
  it('no modifica la lista original', () => {
    const lista = [1, 2, 3];
    mezclar(lista, () => 0);
    expect(lista).toEqual([1, 2, 3]);
  });
});

describe('crearIntento', () => {
  const frase = resolverFrase(def('gato'), sabado);
  const [veo, un, gato] = frase.bloques;

  it('acepta los bloques en orden y avisa al completar', () => {
    const intento = crearIntento(frase);
    expect(intento.tocar(veo)).toEqual({ ok: true, completa: false });
    expect(intento.tocar(un)).toEqual({ ok: true, completa: false });
    expect(intento.tocar(gato)).toEqual({ ok: true, completa: true });
    expect(intento.erroresTotales).toBe(0);
  });

  it('rechaza un bloque fuera de orden y da la pista al segundo error seguido', () => {
    const intento = crearIntento(frase);
    expect(intento.tocar(gato)).toEqual({ ok: false, pista: null });
    expect(intento.tocar(un)).toEqual({ ok: false, pista: veo });
    expect(intento.erroresTotales).toBe(2);
  });

  it('reinicia la cuenta de errores seguidos tras un acierto', () => {
    const intento = crearIntento(frase);
    intento.tocar(gato);
    intento.tocar(veo);
    expect(intento.tocar(gato)).toEqual({ ok: false, pista: null });
  });

  it('rechaza el distractor', () => {
    const intento = crearIntento(frase);
    intento.tocar(veo);
    intento.tocar(un);
    expect(intento.tocar(frase.distractor).ok).toBe(false);
  });

  it('no falla ni avanza si se toca un bloque ya colocado o tras completar', () => {
    const intento = crearIntento(frase);
    intento.tocar(veo);
    expect(intento.tocar(veo).ok).toBe(false);
    intento.tocar(un);
    intento.tocar(gato);
    expect(intento.tocar(gato)).toEqual({ ok: false, pista: null });
  });
});
```

- [ ] **Paso 2: ejecutar y comprobar que fallan**

Ejecutar: `npm test`
Esperado: FALLAN `contenido.test.js` y `frase.test.js` por módulos inexistentes.

- [ ] **Paso 3: implementar el contenido**

`juego-ingles/src/logica/contenido.js`:

```js
// Mi frigio: la escala que da el color flamenco.
export const ESCALA = [64, 65, 67, 69, 71, 72, 74, 76];

const b = (texto, icono) => ({ texto, icono });
const dia = (desplazamiento) => ({ dia: desplazamiento });
const emoji = (valor) => ({ tipo: 'emoji', valor });

// Para agregar una frase basta con sumar un elemento a esta lista.
// { dia: n } se reemplaza por el día real: 0 es hoy, 1 es mañana.
export const FRASES = [
  {
    id: 'gato',
    criatura: { nombre: 'Zarpita', color: 0xf4a261, emoji: '🐱' },
    bloques: [b('I see', '👀'), b('a', '☝️'), b('cat', '🐱')],
    imagen: emoji('🐱'),
    otras: [emoji('🐶'), emoji('🐱🐱')],
    distractor: b('cats', '🐱🐱'),
  },
  {
    id: 'perro',
    criatura: { nombre: 'Ladrín', color: 0xa98467, emoji: '🐶' },
    bloques: [b('I see', '👀'), b('a', '☝️'), b('dog', '🐶')],
    imagen: emoji('🐶'),
    otras: [emoji('🐱'), emoji('🐶🐶')],
    distractor: b('dogs', '🐶🐶'),
  },
  {
    id: 'dosgatos',
    criatura: { nombre: 'Mellis', color: 0xe76f51, emoji: '2️⃣' },
    bloques: [b('I see', '👀'), b('two', '2️⃣'), b('cats', '🐱🐱')],
    imagen: emoji('🐱🐱'),
    otras: [emoji('🐱'), emoji('🐱🐱🐱')],
    distractor: b('cat', '🐱'),
  },
  {
    id: 'trespajaros',
    criatura: { nombre: 'Trino', color: 0x2a9d8f, emoji: '🐦' },
    bloques: [b('I see', '👀'), b('three', '3️⃣'), b('birds', '🐦🐦🐦')],
    imagen: emoji('🐦🐦🐦'),
    otras: [emoji('🐦🐦'), emoji('🐱🐱🐱')],
    distractor: b('bird', '🐦'),
  },
  {
    id: 'megustanperros',
    criatura: { nombre: 'Lametón', color: 0xe5989b, emoji: '❤️' },
    bloques: [b('I', '🙋'), b('like', '❤️'), b('dogs', '🐶🐶')],
    imagen: emoji('❤️🐶'),
    otras: [emoji('❤️🐱'), emoji('👀🐶')],
    distractor: b('see', '👀'),
  },
  {
    id: 'gatosyperros',
    criatura: { nombre: 'Dúo', color: 0x9d4edd, emoji: '➕' },
    bloques: [b('I', '🙋'), b('like', '❤️'), b('cats', '🐱🐱'), b('and', '➕'), b('dogs', '🐶🐶')],
    imagen: emoji('❤️🐱🐶'),
    otras: [emoji('❤️🐱'), emoji('❤️🐶')],
    distractor: b('birds', '🐦🐦'),
  },
  {
    id: 'hoy',
    criatura: { nombre: 'Hoyito', color: 0x457b9d, emoji: '👇' },
    bloques: [b('Today', '👇'), b('is', '🟰'), dia(0)],
    imagen: dia(0),
    otras: [dia(2), dia(4)],
    distractor: b('Tomorrow', '⏭️'),
  },
  {
    id: 'manana',
    criatura: { nombre: 'Mañanita', color: 0x6a994e, emoji: '⏭️' },
    bloques: [b('Tomorrow', '⏭️'), b('is', '🟰'), dia(1)],
    imagen: dia(1),
    otras: [dia(3), dia(5)],
    distractor: b('Today', '👇'),
  },
];
```

- [ ] **Paso 4: implementar la lógica de frases**

`juego-ingles/src/logica/frase.js`:

```js
import { ESCALA } from './contenido.js';
import { nombreDia, indiceDia } from './calendario.js';

// Con esta cantidad de errores en el piano, un repaso cuenta como fallado.
export const UMBRAL_FALLO = 3;

const bloqueReal = (bloque, fecha) =>
  'dia' in bloque ? { texto: nombreDia(fecha, bloque.dia), icono: '📅' } : bloque;

const imagenReal = (imagen, fecha) =>
  'dia' in imagen ? { tipo: 'dia', indice: indiceDia(fecha, imagen.dia) } : imagen;

export function resolverFrase(def, fecha) {
  const bloques = def.bloques.map((bloque, i) => ({
    ...bloqueReal(bloque, fecha),
    nota: ESCALA[i % ESCALA.length],
  }));
  return {
    id: def.id,
    criatura: def.criatura,
    texto: bloques.map((bloque) => bloque.texto).join(' '),
    bloques,
    imagen: imagenReal(def.imagen, fecha),
    otras: def.otras.map((imagen) => imagenReal(imagen, fecha)),
    distractor: { ...bloqueReal(def.distractor, fecha), nota: null },
  };
}

export function mezclar(lista, azar = Math.random) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function opcionesEscucha(frase, azar = Math.random) {
  return mezclar(
    [
      { imagen: frase.imagen, correcta: true },
      ...frase.otras.map((imagen) => ({ imagen, correcta: false })),
    ],
    azar,
  );
}

export function teclasParaNivel(frase, nivel, azar = Math.random) {
  if (nivel <= 1) return [...frase.bloques];
  const base = nivel >= 3 ? [...frase.bloques, frase.distractor] : [...frase.bloques];
  const teclas = mezclar(base, azar);
  const quedoEnOrden = frase.bloques.every((bloque, i) => teclas[i] === bloque);
  return quedoEnOrden ? [...teclas.slice(1), teclas[0]] : teclas;
}

export function crearIntento(frase) {
  let posicion = 0;
  let erroresSeguidos = 0;
  let erroresTotales = 0;
  return {
    tocar(bloque) {
      const esperado = frase.bloques[posicion];
      if (esperado && bloque.texto === esperado.texto) {
        posicion++;
        erroresSeguidos = 0;
        return { ok: true, completa: posicion === frase.bloques.length };
      }
      if (!esperado) return { ok: false, pista: null };
      erroresSeguidos++;
      erroresTotales++;
      return { ok: false, pista: erroresSeguidos >= 2 ? esperado : null };
    },
    get erroresTotales() {
      return erroresTotales;
    },
  };
}
```

- [ ] **Paso 5: ejecutar y comprobar que pasan**

Ejecutar: `npm test`
Esperado: todas las pruebas de `calendario`, `contenido` y `frase` aprobadas.

- [ ] **Paso 6: commit**

```bash
git -C /c/Users/Gfigueroa/Juegos add juego-ingles
git -C /c/Users/Gfigueroa/Juegos commit -m "Contenido de la primera zona y lógica de frases"
```

---

## Tarea 3: progreso y repaso espaciado

**Archivos:**
- Crear: `juego-ingles/src/logica/progreso.js`, `juego-ingles/src/logica/repaso.js`
- Prueba: `juego-ingles/tests/progreso.test.js`, `juego-ingles/tests/repaso.test.js`

**Interfaces:**
- Consume: `sumarDias` de `calendario.js`; `FRASES` de `contenido.js`.
- Produce:
  - `Estado = { version: 1, criaturas: { [id]: { nivel: 1|2|3, proximoRepaso: string | null } } }`.
  - `estadoInicial(): Estado`; `cargar(almacen): Estado`; `guardar(almacen, estado): boolean`. `almacen` tiene la forma de `localStorage` y puede ser `null`.
  - `registrarExito(estado, id, hoy: string): Estado`; `registrarFallo(estado, id, hoy: string): Estado`. No modifican el estado recibido.
  - `disponibles(estado, hoy: string, frases = FRASES): { id, nivel: 1|2|3, tipo: 'captura' | 'repaso' }[]`.

- [ ] **Paso 1: escribir las pruebas que fallan**

`juego-ingles/tests/progreso.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  estadoInicial, cargar, guardar, registrarExito, registrarFallo,
} from '../src/logica/progreso.js';

function almacenFalso(inicial = {}) {
  const datos = { ...inicial };
  return {
    getItem: (clave) => (clave in datos ? datos[clave] : null),
    setItem: (clave, valor) => { datos[clave] = valor; },
    datos,
  };
}

describe('registrarExito', () => {
  it('captura en nivel 1 y agenda el repaso para el día siguiente', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(estado.criaturas.gato).toEqual({ nivel: 1, proximoRepaso: '2026-10-04' });
  });

  it('sube a nivel 2 y agenda el repaso a tres días', () => {
    let estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    estado = registrarExito(estado, 'gato', '2026-10-04');
    expect(estado.criaturas.gato).toEqual({ nivel: 2, proximoRepaso: '2026-10-07' });
  });

  it('en nivel 3 queda dominada, sin más repasos, y no pasa de 3', () => {
    let estado = estadoInicial();
    for (const dia of ['2026-10-03', '2026-10-04', '2026-10-07', '2026-10-08']) {
      estado = registrarExito(estado, 'gato', dia);
    }
    expect(estado.criaturas.gato).toEqual({ nivel: 3, proximoRepaso: null });
  });

  it('no modifica el estado recibido', () => {
    const original = estadoInicial();
    registrarExito(original, 'gato', '2026-10-03');
    expect(original).toEqual(estadoInicial());
  });
});

describe('registrarFallo', () => {
  it('mantiene el nivel y reagenda para el día siguiente', () => {
    let estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    estado = registrarFallo(estado, 'gato', '2026-10-10');
    expect(estado.criaturas.gato).toEqual({ nivel: 1, proximoRepaso: '2026-10-11' });
  });

  it('ignora una criatura no capturada', () => {
    expect(registrarFallo(estadoInicial(), 'gato', '2026-10-03')).toEqual(estadoInicial());
  });
});

describe('cargar y guardar', () => {
  it('recupera lo guardado', () => {
    const almacen = almacenFalso();
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(guardar(almacen, estado)).toBe(true);
    expect(cargar(almacen)).toEqual(estado);
  });

  it('parte de cero en el primer uso', () => {
    expect(cargar(almacenFalso())).toEqual(estadoInicial());
  });

  it('parte de cero si los datos están dañados o tienen otra forma', () => {
    const clave = 'tablao-progreso-v1';
    const casos = [
      '{no es json',
      'null',
      '[]',
      '{"version":1}',
      '{"version":2,"criaturas":{}}',
      '{"version":1,"criaturas":{"gato":{"nivel":9,"proximoRepaso":null}}}',
      '{"version":1,"criaturas":{"gato":{"nivel":1,"proximoRepaso":"mañana"}}}',
      '{"version":1,"criaturas":{"gato":"x"}}',
    ];
    for (const crudo of casos) {
      expect(cargar(almacenFalso({ [clave]: crudo }))).toEqual(estadoInicial());
    }
  });

  it('no falla si no hay almacenamiento o este lanza errores', () => {
    const roto = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('lleno'); } };
    expect(cargar(null)).toEqual(estadoInicial());
    expect(cargar(roto)).toEqual(estadoInicial());
    expect(guardar(null, estadoInicial())).toBe(false);
    expect(guardar(roto, estadoInicial())).toBe(false);
  });
});
```

`juego-ingles/tests/repaso.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { estadoInicial, registrarExito } from '../src/logica/progreso.js';
import { disponibles } from '../src/logica/repaso.js';

describe('disponibles', () => {
  it('en el primer uso ofrece capturar la primera criatura', () => {
    expect(disponibles(estadoInicial(), '2026-10-03')).toEqual([
      { id: 'gato', nivel: 1, tipo: 'captura' },
    ]);
  });

  it('el mismo día de la captura ofrece solo la siguiente criatura', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(disponibles(estado, '2026-10-03')).toEqual([
      { id: 'perro', nivel: 1, tipo: 'captura' },
    ]);
  });

  it('al día siguiente ofrece el repaso de nivel 2 además de la captura', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(disponibles(estado, '2026-10-04')).toEqual([
      { id: 'gato', nivel: 2, tipo: 'repaso' },
      { id: 'perro', nivel: 1, tipo: 'captura' },
    ]);
  });

  it('un repaso atrasado sigue disponible', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(disponibles(estado, '2026-11-20')[0]).toEqual({ id: 'gato', nivel: 2, tipo: 'repaso' });
  });

  it('si la fecha del dispositivo retrocede, el repaso espera sin fallar', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(disponibles(estado, '2026-09-01')).toEqual([
      { id: 'perro', nivel: 1, tipo: 'captura' },
    ]);
  });

  it('una criatura dominada no vuelve a repaso', () => {
    let estado = estadoInicial();
    for (const dia of ['2026-10-03', '2026-10-04', '2026-10-07']) {
      estado = registrarExito(estado, 'gato', dia);
    }
    expect(disponibles(estado, '2027-01-01').some((d) => d.id === 'gato')).toBe(false);
  });

  it('ignora criaturas guardadas que ya no existen en el contenido', () => {
    const estado = { version: 1, criaturas: { fantasma: { nivel: 1, proximoRepaso: '2026-10-01' } } };
    expect(disponibles(estado, '2026-10-03')).toEqual([
      { id: 'gato', nivel: 1, tipo: 'captura' },
    ]);
  });

  it('con todo capturado y sin repasos pendientes no ofrece nada', () => {
    const frases = [{ id: 'a' }];
    const estado = registrarExito(estadoInicial(), 'a', '2026-10-03');
    expect(disponibles(estado, '2026-10-03', frases)).toEqual([]);
  });
});
```

- [ ] **Paso 2: ejecutar y comprobar que fallan**

Ejecutar: `npm test`
Esperado: FALLAN `progreso.test.js` y `repaso.test.js` por módulos inexistentes.

- [ ] **Paso 3: implementar**

`juego-ingles/src/logica/progreso.js`:

```js
import { sumarDias } from './calendario.js';

const CLAVE = 'tablao-progreso-v1';
const FORMATO_DIA = /^\d{4}-\d{2}-\d{2}$/;

export function estadoInicial() {
  return { version: 1, criaturas: {} };
}

function esCriaturaValida(c) {
  return (
    c !== null && typeof c === 'object' &&
    [1, 2, 3].includes(c.nivel) &&
    (c.proximoRepaso === null || (typeof c.proximoRepaso === 'string' && FORMATO_DIA.test(c.proximoRepaso)))
  );
}

function esValido(datos) {
  return (
    datos !== null && typeof datos === 'object' && datos.version === 1 &&
    datos.criaturas !== null && typeof datos.criaturas === 'object' && !Array.isArray(datos.criaturas) &&
    Object.values(datos.criaturas).every(esCriaturaValida)
  );
}

export function cargar(almacen) {
  try {
    const crudo = almacen.getItem(CLAVE);
    if (!crudo) return estadoInicial();
    const datos = JSON.parse(crudo);
    return esValido(datos) ? datos : estadoInicial();
  } catch {
    return estadoInicial();
  }
}

export function guardar(almacen, estado) {
  try {
    almacen.setItem(CLAVE, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}

function conCriatura(estado, id, criatura) {
  return { ...estado, criaturas: { ...estado.criaturas, [id]: criatura } };
}

export function registrarExito(estado, id, hoy) {
  const nivel = Math.min((estado.criaturas[id]?.nivel ?? 0) + 1, 3);
  const espera = { 1: 1, 2: 3 }[nivel];
  return conCriatura(estado, id, { nivel, proximoRepaso: espera ? sumarDias(hoy, espera) : null });
}

export function registrarFallo(estado, id, hoy) {
  const actual = estado.criaturas[id];
  if (!actual) return estado;
  return conCriatura(estado, id, { ...actual, proximoRepaso: sumarDias(hoy, 1) });
}
```

`juego-ingles/src/logica/repaso.js`:

```js
import { FRASES } from './contenido.js';

export function disponibles(estado, hoy, frases = FRASES) {
  const lista = [];
  for (const frase of frases) {
    const guardada = estado.criaturas[frase.id];
    if (guardada && guardada.nivel < 3 && guardada.proximoRepaso && guardada.proximoRepaso <= hoy) {
      lista.push({ id: frase.id, nivel: guardada.nivel + 1, tipo: 'repaso' });
    }
  }
  const nueva = frases.find((frase) => !estado.criaturas[frase.id]);
  if (nueva) lista.push({ id: nueva.id, nivel: 1, tipo: 'captura' });
  return lista;
}
```

- [ ] **Paso 4: ejecutar y comprobar que pasan**

Ejecutar: `npm test`
Esperado: todas las pruebas aprobadas.

- [ ] **Paso 5: commit**

```bash
git -C /c/Users/Gfigueroa/Juegos add juego-ingles
git -C /c/Users/Gfigueroa/Juegos commit -m "Progreso guardado y repaso espaciado"
```

---

## Tarea 4: voz y música

**Archivos:**
- Crear: `juego-ingles/src/servicios/voz.js`, `juego-ingles/src/servicios/musica.js`
- Prueba: `juego-ingles/tests/voz.test.js`, `juego-ingles/tests/musica.test.js`

**Interfaces:**
- Produce:
  - `crearVoz(synth?, Enunciado?): { disponible: boolean, hablar(texto, { lento = false }?): Promise<boolean> }`. La promesa siempre se resuelve: `true` si la voz terminó, `false` si falló, no existe o venció el tiempo límite.
  - `crearMusica(Contexto?): { reanudar(), nota(midi, duracion?, cuando?), palma(cuando?, fuerte?), melodia(notas: number[]), iniciarCompas(bpm = 90), detenerCompas(), enTiempo(): boolean }`. Si el navegador no tiene Web Audio, entrega el mismo objeto con funciones vacías.
  - `distanciaAlPulso(t, inicio, intervalo): number` (segundos al pulso más cercano).

- [ ] **Paso 1: escribir las pruebas que fallan**

`juego-ingles/tests/voz.test.js`:

```js
import { describe, it, expect, vi, afterEach } from 'vitest';
import { crearVoz } from '../src/servicios/voz.js';

class EnunciadoFalso {
  constructor(texto) { this.text = texto; }
}

function synthFalso({ voces = [], alHablar = () => {} } = {}) {
  return {
    dichos: [],
    cancelados: 0,
    getVoices: () => voces,
    cancel() { this.cancelados++; },
    speak(enunciado) { this.dichos.push(enunciado); alHablar(enunciado); },
  };
}

afterEach(() => vi.useRealTimers());

describe('crearVoz', () => {
  it('habla en inglés de Estados Unidos y resuelve true al terminar', async () => {
    const synth = synthFalso({ alHablar: (e) => e.onend() });
    const voz = crearVoz(synth, EnunciadoFalso);
    await expect(voz.hablar('I see a cat')).resolves.toBe(true);
    expect(synth.dichos[0].text).toBe('I see a cat');
    expect(synth.dichos[0].lang).toBe('en-US');
    expect(synth.cancelados).toBe(1);
  });

  it('habla más lento cuando se pide', async () => {
    const synth = synthFalso({ alHablar: (e) => e.onend() });
    const voz = crearVoz(synth, EnunciadoFalso);
    await voz.hablar('cat');
    await voz.hablar('cat', { lento: true });
    expect(synth.dichos[1].rate).toBeLessThan(synth.dichos[0].rate);
  });

  it('prefiere una voz en-US y, si no hay, otra en inglés', async () => {
    const britanica = { lang: 'en-GB', name: 'Daniel' };
    const gringa = { lang: 'en-US', name: 'Samantha' };
    const espanola = { lang: 'es-ES', name: 'Mónica' };
    const conUS = synthFalso({ voces: [espanola, britanica, gringa], alHablar: (e) => e.onend() });
    await crearVoz(conUS, EnunciadoFalso).hablar('cat');
    expect(conUS.dichos[0].voice).toBe(gringa);
    const sinUS = synthFalso({ voces: [espanola, britanica], alHablar: (e) => e.onend() });
    await crearVoz(sinUS, EnunciadoFalso).hablar('cat');
    expect(sinUS.dichos[0].voice).toBe(britanica);
  });

  it('resuelve false si la voz falla', async () => {
    const synth = synthFalso({ alHablar: (e) => e.onerror() });
    await expect(crearVoz(synth, EnunciadoFalso).hablar('cat')).resolves.toBe(false);
  });

  it('resuelve false por tiempo límite si la voz nunca avisa que terminó', async () => {
    vi.useFakeTimers();
    const voz = crearVoz(synthFalso(), EnunciadoFalso);
    const promesa = voz.hablar('I see a cat');
    await vi.advanceTimersByTimeAsync(10000);
    await expect(promesa).resolves.toBe(false);
  });

  it('resuelve false sin fallar si el navegador no tiene voz', async () => {
    const voz = crearVoz(undefined, undefined);
    expect(voz.disponible).toBe(false);
    await expect(voz.hablar('cat')).resolves.toBe(false);
  });

  it('resuelve false si speak lanza un error', async () => {
    const synth = synthFalso({ alHablar: () => { throw new Error('no permitido'); } });
    await expect(crearVoz(synth, EnunciadoFalso).hablar('cat')).resolves.toBe(false);
  });
});
```

`juego-ingles/tests/musica.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { distanciaAlPulso, crearMusica } from '../src/servicios/musica.js';

describe('distanciaAlPulso', () => {
  it('es cero justo en el pulso', () => {
    expect(distanciaAlPulso(2, 0, 0.5)).toBeCloseTo(0);
  });

  it('mide hacia el pulso más cercano, antes o después', () => {
    expect(distanciaAlPulso(1.1, 0, 0.5)).toBeCloseTo(0.1);
    expect(distanciaAlPulso(1.4, 0, 0.5)).toBeCloseTo(0.1);
  });

  it('funciona antes del primer pulso', () => {
    expect(distanciaAlPulso(0.9, 1, 0.5)).toBeCloseTo(0.1);
  });
});

describe('crearMusica sin Web Audio', () => {
  it('entrega un objeto inofensivo', () => {
    const musica = crearMusica(null);
    musica.reanudar();
    musica.nota(64);
    musica.melodia([64, 65]);
    musica.iniciarCompas();
    musica.detenerCompas();
    expect(musica.enTiempo()).toBe(false);
  });
});
```

- [ ] **Paso 2: ejecutar y comprobar que fallan**

Ejecutar: `npm test`
Esperado: FALLAN `voz.test.js` y `musica.test.js` por módulos inexistentes.

- [ ] **Paso 3: implementar**

`juego-ingles/src/servicios/voz.js`:

```js
export function crearVoz(
  synth = globalThis.speechSynthesis,
  Enunciado = globalThis.SpeechSynthesisUtterance,
) {
  const disponible = Boolean(synth && Enunciado);

  function elegirVoz() {
    const voces = synth.getVoices();
    return (
      voces.find((v) => v.lang === 'en-US' && v.name.includes('Samantha')) ??
      voces.find((v) => v.lang === 'en-US') ??
      voces.find((v) => v.lang?.startsWith('en')) ??
      null
    );
  }

  return {
    disponible,
    hablar(texto, { lento = false } = {}) {
      return new Promise((resolver) => {
        if (!disponible) return resolver(false);
        let terminado = false;
        const terminar = (ok) => {
          if (terminado) return;
          terminado = true;
          clearTimeout(limite);
          resolver(ok);
        };
        // En iOS el aviso de término a veces no llega: el juego no puede quedar esperando.
        const limite = setTimeout(() => terminar(false), 2500 + texto.length * (lento ? 220 : 140));
        try {
          synth.cancel();
          const enunciado = new Enunciado(texto);
          enunciado.lang = 'en-US';
          const voz = elegirVoz();
          if (voz) enunciado.voice = voz;
          enunciado.rate = lento ? 0.6 : 0.9;
          enunciado.onend = () => terminar(true);
          enunciado.onerror = () => terminar(false);
          synth.speak(enunciado);
        } catch {
          terminar(false);
        }
      });
    },
  };
}
```

`juego-ingles/src/servicios/musica.js`:

```js
export function distanciaAlPulso(t, inicio, intervalo) {
  const fase = (((t - inicio) % intervalo) + intervalo) % intervalo;
  return Math.min(fase, intervalo - fase);
}

const frecuencia = (midi) => 440 * 2 ** ((midi - 69) / 12);

const MUSICA_VACIA = {
  reanudar() {}, nota() {}, palma() {}, melodia() {},
  iniciarCompas() {}, detenerCompas() {}, enTiempo: () => false,
};

export function crearMusica(Contexto = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
  if (!Contexto) return MUSICA_VACIA;
  const ctx = new Contexto();
  let reloj = null;
  let inicio = 0;
  let intervalo = 60 / 90;

  function reanudar() {
    // Con sesión de tipo "playback" el iPad suena aunque el interruptor esté en silencio.
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* sin soporte */ }
    if (ctx.state !== 'running') ctx.resume();
  }

  // Al volver de segundo plano iOS deja el audio detenido.
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reanudar(); });
    document.addEventListener('pointerup', reanudar);
  }

  function nota(midi, duracion = 0.6, cuando = ctx.currentTime) {
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();
    oscilador.type = 'triangle';
    oscilador.frequency.value = frecuencia(midi);
    ganancia.gain.setValueAtTime(0.0001, cuando);
    ganancia.gain.exponentialRampToValueAtTime(0.4, cuando + 0.01);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, cuando + duracion);
    oscilador.connect(ganancia).connect(ctx.destination);
    oscilador.start(cuando);
    oscilador.stop(cuando + duracion + 0.05);
  }

  function palma(cuando = ctx.currentTime, fuerte = false) {
    const muestras = Math.floor(ctx.sampleRate * 0.05);
    const bufer = ctx.createBuffer(1, muestras, ctx.sampleRate);
    const datos = bufer.getChannelData(0);
    for (let i = 0; i < muestras; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / muestras);
    const fuente = ctx.createBufferSource();
    fuente.buffer = bufer;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.frequency.value = 1800;
    const ganancia = ctx.createGain();
    ganancia.gain.value = fuerte ? 0.5 : 0.25;
    fuente.connect(filtro).connect(ganancia).connect(ctx.destination);
    fuente.start(cuando);
  }

  function detenerCompas() {
    if (reloj) clearInterval(reloj);
    reloj = null;
  }

  function iniciarCompas(bpm = 90) {
    detenerCompas();
    intervalo = 60 / bpm;
    inicio = ctx.currentTime + 0.1;
    let siguiente = 0;
    reloj = setInterval(() => {
      // Si el audio estuvo detenido, saltar los pulsos atrasados en vez de dispararlos juntos.
      const minimo = Math.ceil((ctx.currentTime - inicio) / intervalo);
      if (siguiente < minimo) siguiente = minimo;
      while (inicio + siguiente * intervalo < ctx.currentTime + 0.2) {
        palma(inicio + siguiente * intervalo, siguiente % 4 === 0);
        siguiente++;
      }
    }, 50);
  }

  return {
    reanudar,
    nota,
    palma,
    melodia(notas) { notas.forEach((midi, i) => nota(midi, 0.5, ctx.currentTime + i * 0.3)); },
    iniciarCompas,
    detenerCompas,
    enTiempo: () => reloj !== null && distanciaAlPulso(ctx.currentTime, inicio, intervalo) < 0.15,
  };
}
```

- [ ] **Paso 4: ejecutar y comprobar que pasan**

Ejecutar: `npm test`
Esperado: todas las pruebas aprobadas.

- [ ] **Paso 5: commit**

```bash
git -C /c/Users/Gfigueroa/Juegos add juego-ingles
git -C /c/Users/Gfigueroa/Juegos commit -m "Servicios de voz y música"
```

---

## Tarea 5: dibujo, sesión y pantallas de navegación

**Archivos:**
- Crear: `juego-ingles/src/sesion.js`, `juego-ingles/src/main.js`, `juego-ingles/src/escenas/dibujo.js`, `juego-ingles/src/escenas/Inicio.js`, `juego-ingles/src/escenas/Mapa.js`, `juego-ingles/src/escenas/Coleccion.js`

**Interfaces:**
- Consume: `ANCHO`, `ALTO`; `FRASES`; `claveDia`; `disponibles`; `cargar`, `guardar`; `crearVoz`; `crearMusica`; `resolverFrase`.
- Produce:
  - `sesion = { voz, musica, estado, ahora(): Date, guardarEstado(nuevo) }`. `ahora()` respeta el parámetro de URL `?fecha=AAAA-MM-DD` para pruebas.
  - `COLORES`; `crearBoton(escena, x, y, icono, alTocar, radio = 55)`; `crearBailarina(escena, x, y, escala = 1)` con método `.pose('quieta' | 'paso' | 'giro' | 'celebracion')`; `crearCriatura(escena, x, y, criatura, { silueta = false, escala = 1 }?)`; `crearTarjeta(escena, x, y, imagen, ancho = 240, alto = 240)`. Todos devuelven un `Phaser.GameObjects.Container`.
  - Escenas con claves `'Inicio'`, `'Mapa'`, `'Coleccion'`. `Mapa` inicia `'Escucha'` con `{ id, nivel, tipo }`.
  - En desarrollo, `window.__tablao = { juego, sesion }`.

- [ ] **Paso 1: sesión compartida**

`juego-ingles/src/sesion.js`:

```js
import { cargar, guardar } from './logica/progreso.js';

function almacen() {
  try { return window.localStorage; } catch { return null; }
}

// ?fecha=AAAA-MM-DD simula otro día, para probar los repasos.
function fechaDeUrl() {
  const valor = new URLSearchParams(window.location.search).get('fecha');
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const [anio, mes, dia] = valor.split('-').map(Number);
  return new Date(anio, mes - 1, dia, 12);
}

export const sesion = {
  voz: null,
  musica: null,
  estado: cargar(almacen()),
  ahora() {
    return fechaDeUrl() ?? new Date();
  },
  guardarEstado(nuevo) {
    this.estado = nuevo;
    guardar(almacen(), nuevo);
  },
};
```

- [ ] **Paso 2: figuras dibujadas por código**

`juego-ingles/src/escenas/dibujo.js`:

```js
export const COLORES = {
  fondo: 0xfdf0d5, rojo: 0xd62828, crema: 0xfff8e7, tinta: 0x3d2b1f,
  oro: 0xf4a261, gris: 0xb8b0a2, piel: 0xe0ac69,
};

export function crearBoton(escena, x, y, icono, alTocar, radio = 55) {
  const boton = escena.add.container(x, y);
  boton.add([
    escena.add.circle(0, 0, radio, COLORES.crema).setStrokeStyle(5, COLORES.tinta),
    escena.add.text(0, 0, icono, { fontSize: `${radio}px` }).setOrigin(0.5),
  ]);
  boton.setSize(radio * 2, radio * 2).setInteractive({ useHandCursor: true });
  boton.on('pointerup', () => alTocar());
  return boton;
}

// Ángulos de los brazos en radianes: [izquierdo, derecho].
const POSES = {
  quieta: [2.4, 0.75],
  paso: [3.6, 0.4],
  giro: [4.2, 5.2],
  celebracion: [4.2, 5.2],
};

export function crearBailarina(escena, x, y, escala = 1) {
  const bailarina = escena.add.container(x, y).setScale(escala);
  const g = escena.add.graphics();
  bailarina.add(g);

  function dibujar(brazoIzquierdo, brazoDerecho) {
    g.clear();
    g.fillStyle(COLORES.rojo);
    g.fillTriangle(-70, 90, 70, 90, 0, -30);
    g.fillStyle(0xffffff);
    [[-30, 60], [0, 40], [30, 60], [-10, 75], [12, 12]].forEach(([px, py]) => g.fillCircle(px, py, 7));
    g.fillStyle(COLORES.piel);
    g.fillCircle(0, -55, 24);
    g.fillStyle(COLORES.tinta);
    g.fillCircle(0, -78, 13);
    g.fillStyle(COLORES.rojo);
    g.fillCircle(16, -72, 7);
    g.lineStyle(9, COLORES.piel);
    g.lineBetween(-12, -25, -12 + Math.cos(brazoIzquierdo) * 55, -25 + Math.sin(brazoIzquierdo) * 55);
    g.lineBetween(12, -25, 12 + Math.cos(brazoDerecho) * 55, -25 + Math.sin(brazoDerecho) * 55);
  }

  bailarina.pose = (nombre) => {
    dibujar(...POSES[nombre]);
    if (nombre === 'paso') {
      escena.tweens.add({
        targets: bailarina, angle: { from: -6, to: 6 }, duration: 150, yoyo: true, repeat: 1,
        onComplete: () => bailarina.setAngle(0),
      });
    }
    if (nombre === 'giro') {
      escena.tweens.add({ targets: g, scaleX: { from: 1, to: -1 }, duration: 200, yoyo: true });
    }
    if (nombre === 'celebracion') {
      escena.tweens.add({ targets: g, y: { from: 0, to: -40 }, duration: 220, yoyo: true, repeat: 2 });
    }
    return bailarina;
  };

  return bailarina.pose('quieta');
}

export function crearCriatura(escena, x, y, criatura, { silueta = false, escala = 1 } = {}) {
  const contenedor = escena.add.container(x, y).setScale(escala);
  const g = escena.add.graphics();
  g.fillStyle(silueta ? COLORES.gris : criatura.color);
  g.fillEllipse(0, 0, 120, 110);
  g.fillTriangle(-50, -30, -30, -70, -15, -40);
  g.fillTriangle(50, -30, 30, -70, 15, -40);
  contenedor.add(g);
  if (silueta) {
    contenedor.add(
      escena.add.text(0, 0, '?', { fontSize: '64px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5),
    );
    return contenedor;
  }
  g.fillStyle(0xffffff);
  g.fillCircle(-22, -15, 13);
  g.fillCircle(22, -15, 13);
  g.fillStyle(COLORES.tinta);
  g.fillCircle(-22, -13, 6);
  g.fillCircle(22, -13, 6);
  contenedor.add(escena.add.text(0, 28, criatura.emoji, { fontSize: '34px' }).setOrigin(0.5));
  return contenedor;
}

// Semana con lunes primero; el índice de día usa 0 = domingo.
const LETRAS_SEMANA = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function crearTarjeta(escena, x, y, imagen, ancho = 240, alto = 240) {
  const tarjeta = escena.add.container(x, y);
  tarjeta.add(escena.add.rectangle(0, 0, ancho, alto, COLORES.crema).setStrokeStyle(6, COLORES.tinta));
  if (imagen.tipo === 'emoji') {
    const grande = [...imagen.valor].length <= 2;
    tarjeta.add(
      escena.add.text(0, 0, imagen.valor, { fontSize: grande ? '110px' : '60px' }).setOrigin(0.5),
    );
  } else {
    const posicion = (imagen.indice + 6) % 7;
    tarjeta.add(escena.add.text(0, -45, '📅', { fontSize: '72px' }).setOrigin(0.5));
    LETRAS_SEMANA.forEach((letra, i) => {
      const cx = -ancho / 2 + 24 + i * ((ancho - 48) / 6);
      const activo = i === posicion;
      tarjeta.add(escena.add.circle(cx, 55, activo ? 18 : 12, activo ? COLORES.rojo : COLORES.gris));
      tarjeta.add(
        escena.add
          .text(cx, 55, letra, { fontSize: activo ? '20px' : '13px', color: '#ffffff', fontStyle: 'bold' })
          .setOrigin(0.5),
      );
    });
  }
  tarjeta.setSize(ancho, alto);
  return tarjeta;
}
```

- [ ] **Paso 3: pantalla de inicio**

`juego-ingles/src/escenas/Inicio.js`:

```js
import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { crearMusica } from '../servicios/musica.js';
import { crearVoz } from '../servicios/voz.js';
import { crearBailarina, crearBoton } from './dibujo.js';

export class Inicio extends Phaser.Scene {
  constructor() {
    super('Inicio');
  }

  create() {
    crearBailarina(this, ANCHO / 2, 250, 1.6);
    this.add.text(ANCHO / 2, 450, '🔊', { fontSize: '48px' }).setOrigin(0.5);
    const boton = crearBoton(this, ANCHO / 2, 600, '▶️', () => {}, 90);
    this.tweens.add({ targets: boton, scale: 1.08, duration: 600, yoyo: true, repeat: -1 });

    // iOS solo habilita audio y voz dentro de un toque real del usuario,
    // por eso se usa el evento del navegador y no el de Phaser.
    const activar = () => {
      sesion.musica = crearMusica();
      sesion.voz = crearVoz();
      sesion.musica.reanudar();
      sesion.musica.melodia([64, 65, 67, 69]);
      sesion.voz.hablar('Hello!');
      this.scene.start('Mapa');
    };
    this.game.canvas.addEventListener('click', activar, { once: true });
  }
}
```

- [ ] **Paso 4: mapa**

`juego-ingles/src/escenas/Mapa.js`:

```js
import Phaser from 'phaser';
import { ANCHO, ALTO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { FRASES } from '../logica/contenido.js';
import { claveDia } from '../logica/calendario.js';
import { disponibles } from '../logica/repaso.js';
import { COLORES, crearBailarina, crearBoton, crearCriatura } from './dibujo.js';

const PARADAS = FRASES.map((_, i) => ({ x: 130 + i * 110, y: i % 2 === 0 ? 470 : 330 }));

export class Mapa extends Phaser.Scene {
  constructor() {
    super('Mapa');
  }

  create() {
    this.ocupada = false;
    this.dibujarPatio();

    const camino = this.add.graphics().lineStyle(14, COLORES.oro, 1);
    PARADAS.forEach((parada, i) => {
      if (i > 0) camino.lineBetween(PARADAS[i - 1].x, PARADAS[i - 1].y, parada.x, parada.y);
    });

    const tareas = disponibles(sesion.estado, claveDia(sesion.ahora()));
    const capturadas = FRASES.filter((f) => sesion.estado.criaturas[f.id]).length;
    const partida = PARADAS[Math.max(0, capturadas - 1)];

    FRASES.forEach((frase, i) => {
      const parada = PARADAS[i];
      const guardada = sesion.estado.criaturas[frase.id];
      const tarea = tareas.find((t) => t.id === frase.id);
      const criatura = crearCriatura(this, parada.x, parada.y, frase.criatura, {
        silueta: !guardada, escala: 0.75,
      });
      if (guardada) {
        this.add.text(parada.x, parada.y + 62, '⭐'.repeat(guardada.nivel), { fontSize: '22px' }).setOrigin(0.5);
      }
      if (guardada && !tarea && guardada.nivel < 3) {
        this.add.text(parada.x + 42, parada.y - 50, '💤', { fontSize: '28px' }).setOrigin(0.5);
      }
      if (tarea) {
        this.tweens.add({ targets: criatura, scale: 0.9, duration: 500, yoyo: true, repeat: -1 });
        criatura.setSize(150, 150).setInteractive({ useHandCursor: true });
        criatura.on('pointerup', () => this.irA(parada, tarea));
      }
    });

    this.bailarina = crearBailarina(this, partida.x - 60, partida.y + 70, 0.7);
    crearBoton(this, ANCHO - 80, 80, '📖', () => this.scene.start('Coleccion'));
    if (tareas.length === 0) this.bailarina.pose('celebracion');
  }

  irA(parada, tarea) {
    if (this.ocupada) return;
    this.ocupada = true;
    this.bailarina.pose('paso');
    this.tweens.add({
      targets: this.bailarina, x: parada.x - 60, y: parada.y + 70, duration: 600,
      onComplete: () => this.scene.start('Escucha', tarea),
    });
  }

  dibujarPatio() {
    const g = this.add.graphics();
    g.fillStyle(COLORES.crema);
    g.fillRect(0, 0, ANCHO, 560);
    g.fillStyle(0xe9c46a);
    g.fillRect(0, 560, ANCHO, ALTO - 560);
    g.fillStyle(0xf1dca7);
    for (let i = 0; i < 4; i++) {
      const x = 128 + i * 256;
      g.fillRect(x - 70, 150, 140, 410);
      g.fillCircle(x, 150, 70);
    }
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xbc6c25);
      g.fillRect(i * 256 - 22, 520, 44, 40);
      g.fillStyle(COLORES.rojo);
      g.fillCircle(i * 256, 505, 20);
    }
  }
}
```

- [ ] **Paso 5: colección**

`juego-ingles/src/escenas/Coleccion.js`:

```js
import Phaser from 'phaser';
import { sesion } from '../sesion.js';
import { FRASES } from '../logica/contenido.js';
import { resolverFrase } from '../logica/frase.js';
import { crearBoton, crearCriatura } from './dibujo.js';

export class Coleccion extends Phaser.Scene {
  constructor() {
    super('Coleccion');
  }

  create() {
    const fecha = sesion.ahora();
    crearBoton(this, 80, 80, '🏠', () => this.scene.start('Mapa'));
    FRASES.forEach((def, i) => {
      const x = 200 + (i % 4) * 210;
      const y = 290 + Math.floor(i / 4) * 260;
      const guardada = sesion.estado.criaturas[def.id];
      const criatura = crearCriatura(this, x, y, def.criatura, { silueta: !guardada });
      if (!guardada) return;
      this.add.text(x, y + 82, '⭐'.repeat(guardada.nivel), { fontSize: '28px' }).setOrigin(0.5);
      criatura.setSize(150, 150).setInteractive({ useHandCursor: true });
      criatura.on('pointerup', () => {
        sesion.voz.hablar(resolverFrase(def, fecha).texto);
        this.tweens.add({ targets: criatura, y: y - 25, duration: 180, yoyo: true });
      });
    });
  }
}
```

- [ ] **Paso 6: arranque**

`juego-ingles/src/main.js`:

```js
import Phaser from 'phaser';
import { ANCHO, ALTO } from './constantes.js';
import { sesion } from './sesion.js';
import { Inicio } from './escenas/Inicio.js';
import { Mapa } from './escenas/Mapa.js';
import { Coleccion } from './escenas/Coleccion.js';

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  backgroundColor: '#fdf0d5',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: ANCHO, height: ALTO },
  scene: [Inicio, Mapa, Coleccion],
});

if (import.meta.env.DEV) window.__tablao = { juego, sesion };
```

- [ ] **Paso 7: verificar en el navegador**

Ejecutar: `npm run dev` (en segundo plano) y abrir `http://localhost:5173/` con la ventana en 1024 × 768.

Comprobar:
1. Se ve la bailarina, el ícono de volumen y el botón de jugar latiendo. La consola no muestra errores.
2. Un clic en cualquier parte suena una melodía de 4 notas, se oye "Hello!" y aparece el mapa.
3. El mapa muestra 8 paradas: la primera late y es una silueta gris con "?"; las demás son siluetas quietas.
4. El botón 📖 abre la colección con 8 siluetas; 🏠 vuelve al mapa.
5. Al tocar la primera parada, la bailarina camina hacia ella. La consola muestra que la escena `Escucha` no existe todavía: es lo esperado en esta tarea.
6. Con la ventana en vertical (768 × 1024) aparece el aviso 🔄 de girar.

Ejecutar también: `npm test`. Esperado: todas las pruebas siguen aprobadas.

- [ ] **Paso 8: commit**

```bash
git -C /c/Users/Gfigueroa/Juegos add juego-ingles
git -C /c/Users/Gfigueroa/Juegos commit -m "Pantallas de inicio, mapa y colección"
```

---

## Tarea 6: recorrido de una criatura (Escucha, Piano, Voz, Captura)

**Archivos:**
- Crear: `juego-ingles/src/escenas/Escucha.js`, `juego-ingles/src/escenas/Piano.js`, `juego-ingles/src/escenas/Voz.js`, `juego-ingles/src/escenas/Captura.js`
- Modificar: `juego-ingles/src/main.js` (registrar las cuatro escenas)

**Interfaces:**
- Consume: `sesion`; `FRASES`; `resolverFrase`, `opcionesEscucha`, `teclasParaNivel`, `crearIntento`, `UMBRAL_FALLO`; `registrarExito`, `registrarFallo`; `claveDia`; funciones de `dibujo.js`.
- Produce: escenas `'Escucha'` y `'Piano'` que reciben `{ id, nivel, tipo }`; `'Voz'` y `'Captura'` que reciben `{ id, nivel, tipo, errores }`. `Captura` guarda el resultado y vuelve a `'Mapa'`.

- [ ] **Paso 1: Escucha**

`juego-ingles/src/escenas/Escucha.js`:

```js
import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { FRASES } from '../logica/contenido.js';
import { resolverFrase, opcionesEscucha } from '../logica/frase.js';
import { crearBoton, crearTarjeta } from './dibujo.js';

export class Escucha extends Phaser.Scene {
  constructor() {
    super('Escucha');
  }

  init(tarea) {
    this.tarea = tarea;
  }

  create() {
    const frase = resolverFrase(FRASES.find((f) => f.id === this.tarea.id), sesion.ahora());
    const opciones = opcionesEscucha(frase);
    let errores = 0;
    let resuelta = false;

    crearBoton(this, 80, 80, '🏠', () => this.scene.start('Mapa'));
    crearBoton(this, ANCHO / 2, 130, '🔊', () => sesion.voz.hablar(frase.texto, { lento: errores > 0 }), 70);

    const tarjetas = opciones.map((opcion, i) => {
      const tarjeta = crearTarjeta(this, 212 + i * 300, 450, opcion.imagen);
      tarjeta.setInteractive({ useHandCursor: true });
      tarjeta.on('pointerup', () => {
        if (resuelta) return;
        if (opcion.correcta) {
          resuelta = true;
          sesion.musica.melodia([64, 67, 71]);
          this.tweens.add({
            targets: tarjeta, scale: 1.2, duration: 250, yoyo: true,
            onComplete: () => this.scene.start('Piano', this.tarea),
          });
          return;
        }
        errores++;
        this.tweens.add({ targets: tarjeta, x: tarjeta.x + 12, duration: 60, yoyo: true, repeat: 3 });
        sesion.voz.hablar(frase.texto, { lento: true });
        if (errores === 2) {
          const correcta = tarjetas[opciones.findIndex((o) => o.correcta)];
          this.tweens.add({ targets: correcta, scale: 1.1, duration: 400, yoyo: true, repeat: -1 });
        }
      });
      return tarjeta;
    });

    this.time.delayedCall(400, () => sesion.voz.hablar(frase.texto));
  }
}
```

- [ ] **Paso 2: Piano**

`juego-ingles/src/escenas/Piano.js`:

```js
import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { FRASES } from '../logica/contenido.js';
import { resolverFrase, teclasParaNivel, crearIntento } from '../logica/frase.js';
import { COLORES, crearBailarina, crearBoton } from './dibujo.js';

const Y_RANURAS = 210;
const Y_TECLAS = 600;
const LADO = 140;
const PASO = LADO + 16;

export class Piano extends Phaser.Scene {
  constructor() {
    super('Piano');
  }

  init(tarea) {
    this.tarea = tarea;
  }

  create() {
    this.frase = resolverFrase(FRASES.find((f) => f.id === this.tarea.id), sesion.ahora());
    this.intento = crearIntento(this.frase);
    this.colocados = 0;
    this.teclas = [];

    const cantidad = this.frase.bloques.length;
    this.xRanura = (i) => ANCHO / 2 + (i - (cantidad - 1) / 2) * PASO;
    this.frase.bloques.forEach((_, i) => {
      this.add.rectangle(this.xRanura(i), Y_RANURAS, LADO, LADO).setStrokeStyle(4, COLORES.gris);
    });

    this.bailarina = crearBailarina(this, 90, 420, 0.8);
    crearBoton(this, 80, 80, '🏠', () => this.scene.start('Mapa'));
    crearBoton(this, ANCHO - 80, 80, '🔊', () => sesion.voz.hablar(this.frase.texto, { lento: true }));

    sesion.musica.iniciarCompas(90);
    this.events.once('shutdown', () => sesion.musica.detenerCompas());

    if (this.tarea.nivel <= 1) this.soltarSiguiente();
    else this.ponerTeclas();
  }

  crearTecla(bloque, x, y) {
    const tecla = this.add.container(x, y);
    tecla.add([
      this.add.rectangle(0, 0, LADO, LADO, COLORES.crema).setStrokeStyle(5, COLORES.tinta),
      this.add.text(0, -18, bloque.icono, { fontSize: '50px' }).setOrigin(0.5),
      this.add.text(0, 46, bloque.texto, { fontSize: '22px', color: '#3d2b1f', fontStyle: 'bold' }).setOrigin(0.5),
    ]);
    tecla.setSize(LADO, LADO).setInteractive({ useHandCursor: true });
    tecla.bloque = bloque;
    tecla.colocada = false;
    tecla.on('pointerdown', () => this.tocar(tecla));
    this.teclas.push(tecla);
    return tecla;
  }

  // Nivel 1: los bloques caen de a uno y ya en orden.
  soltarSiguiente() {
    const tecla = this.crearTecla(this.frase.bloques[this.colocados], ANCHO / 2, -90);
    this.tweens.add({ targets: tecla, y: Y_TECLAS - 80, duration: 2200, ease: 'Sine.easeIn' });
  }

  // Niveles 2 y 3: todos los bloques abajo, desordenados.
  ponerTeclas() {
    const bloques = teclasParaNivel(this.frase, this.tarea.nivel);
    bloques.forEach((bloque, i) => {
      this.crearTecla(bloque, ANCHO / 2 + (i - (bloques.length - 1) / 2) * PASO, Y_TECLAS);
    });
  }

  tocar(tecla) {
    if (tecla.colocada) return;
    const resultado = this.intento.tocar(tecla.bloque);

    if (!resultado.ok) {
      this.tweens.add({ targets: tecla, x: tecla.x + 10, duration: 50, yoyo: true, repeat: 3 });
      sesion.voz.hablar(this.frase.texto, { lento: true });
      if (resultado.pista) {
        const correcta = this.teclas.find((t) => !t.colocada && t.bloque.texto === resultado.pista.texto);
        if (correcta) this.tweens.add({ targets: correcta, scale: 1.15, duration: 300, yoyo: true, repeat: 2 });
      }
      return;
    }

    tecla.colocada = true;
    tecla.disableInteractive();
    this.tweens.killTweensOf(tecla);
    tecla.setScale(1);
    sesion.musica.nota(tecla.bloque.nota);
    sesion.voz.hablar(tecla.bloque.texto);
    if (sesion.musica.enTiempo()) this.ole(tecla);
    this.bailarina.pose(this.colocados % 2 === 0 ? 'paso' : 'giro');
    this.tweens.add({ targets: tecla, x: this.xRanura(this.colocados), y: Y_RANURAS, duration: 300 });
    this.colocados++;

    if (resultado.completa) this.terminar();
    else if (this.tarea.nivel <= 1) this.time.delayedCall(500, () => this.soltarSiguiente());
  }

  // Tocar al compás no es obligatorio: solo se celebra.
  ole(tecla) {
    const texto = this.add
      .text(tecla.x, tecla.y - 100, '¡Olé!', { fontSize: '36px', color: '#d62828', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.tweens.add({ targets: texto, y: texto.y - 60, alpha: 0, duration: 700, onComplete: () => texto.destroy() });
  }

  terminar() {
    sesion.musica.detenerCompas();
    this.teclas.forEach((tecla) => tecla.disableInteractive());
    this.time.delayedCall(800, async () => {
      sesion.musica.melodia(this.frase.bloques.map((bloque) => bloque.nota));
      this.bailarina.pose('celebracion');
      await sesion.voz.hablar(this.frase.texto);
      if (this.scene.isActive()) {
        this.scene.start('Voz', { ...this.tarea, errores: this.intento.erroresTotales });
      }
    });
  }
}
```

- [ ] **Paso 3: Voz**

`juego-ingles/src/escenas/Voz.js`:

```js
import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { FRASES } from '../logica/contenido.js';
import { resolverFrase } from '../logica/frase.js';
import { crearBoton, crearTarjeta } from './dibujo.js';

// El juego invita a repetir la frase en voz alta. No escucha ni califica.
export class Voz extends Phaser.Scene {
  constructor() {
    super('Voz');
  }

  init(tarea) {
    this.tarea = tarea;
  }

  create() {
    const frase = resolverFrase(FRASES.find((f) => f.id === this.tarea.id), sesion.ahora());
    crearTarjeta(this, ANCHO / 2, 230, frase.imagen, 280, 280);
    const boca = this.add.text(ANCHO / 2, 470, '🗣️', { fontSize: '96px' }).setOrigin(0.5).setAlpha(0.3);
    const seguir = crearBoton(this, ANCHO / 2 + 150, 650, '✅', () => this.scene.start('Captura', this.tarea), 70);
    seguir.setVisible(false);

    const invitar = async () => {
      await sesion.voz.hablar(frase.texto, { lento: true });
      if (!this.scene.isActive()) return;
      boca.setAlpha(1);
      this.tweens.add({ targets: boca, scale: 1.25, duration: 450, yoyo: true, repeat: 3 });
      this.time.delayedCall(2500, () => seguir.setVisible(true));
    };

    crearBoton(this, ANCHO / 2 - 150, 650, '🔊', invitar, 70);
    invitar();
  }
}
```

- [ ] **Paso 4: Captura**

`juego-ingles/src/escenas/Captura.js`:

```js
import Phaser from 'phaser';
import { sesion } from '../sesion.js';
import { FRASES } from '../logica/contenido.js';
import { UMBRAL_FALLO } from '../logica/frase.js';
import { claveDia } from '../logica/calendario.js';
import { registrarExito, registrarFallo } from '../logica/progreso.js';
import { crearBailarina, crearCriatura } from './dibujo.js';

export class Captura extends Phaser.Scene {
  constructor() {
    super('Captura');
  }

  init(tarea) {
    this.tarea = tarea;
  }

  create() {
    const def = FRASES.find((f) => f.id === this.tarea.id);
    const hoy = claveDia(sesion.ahora());
    // La captura nunca falla. Un repaso con muchos errores vuelve mañana, sin castigo visible.
    const logrado = this.tarea.tipo === 'captura' || this.tarea.errores < UMBRAL_FALLO;
    sesion.guardarEstado(
      logrado ? registrarExito(sesion.estado, def.id, hoy) : registrarFallo(sesion.estado, def.id, hoy),
    );

    const bailarina = crearBailarina(this, 300, 420, 1.3);
    const criatura = crearCriatura(this, 660, 380, def.criatura, { escala: 0.1 });
    this.tweens.add({ targets: criatura, scale: 1.6, duration: 600, ease: 'Back.easeOut' });

    if (logrado) {
      bailarina.pose('celebracion');
      sesion.musica.melodia([64, 67, 71, 76]);
      const estrellas = '⭐'.repeat(sesion.estado.criaturas[def.id].nivel);
      this.add.text(660, 560, estrellas, { fontSize: '56px' }).setOrigin(0.5);
    } else {
      bailarina.pose('paso');
      this.add.text(660, 560, '💤', { fontSize: '56px' }).setOrigin(0.5);
    }

    const volver = () => this.scene.start('Mapa');
    this.time.delayedCall(1200, () => this.input.once('pointerup', volver));
    this.time.delayedCall(5000, volver);
  }
}
```

- [ ] **Paso 5: registrar las escenas**

En `juego-ingles/src/main.js`, reemplazar las importaciones de escenas y la lista `scene`:

```js
import Phaser from 'phaser';
import { ANCHO, ALTO } from './constantes.js';
import { sesion } from './sesion.js';
import { Inicio } from './escenas/Inicio.js';
import { Mapa } from './escenas/Mapa.js';
import { Coleccion } from './escenas/Coleccion.js';
import { Escucha } from './escenas/Escucha.js';
import { Piano } from './escenas/Piano.js';
import { Voz } from './escenas/Voz.js';
import { Captura } from './escenas/Captura.js';

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  backgroundColor: '#fdf0d5',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: ANCHO, height: ALTO },
  scene: [Inicio, Mapa, Coleccion, Escucha, Piano, Voz, Captura],
});

if (import.meta.env.DEV) window.__tablao = { juego, sesion };
```

- [ ] **Paso 6: verificar el recorrido completo en el navegador**

Ejecutar `npm run dev`, abrir `http://localhost:5173/` en 1024 × 768 y borrar antes los datos del sitio (`localStorage.clear()` en la consola).

Captura (nivel 1):
1. Inicio → Mapa → tocar la primera criatura. En Escucha se oye "I see a cat" y hay tres tarjetas.
2. Tocar una tarjeta incorrecta: tiembla y la frase se repite lento. Tras el segundo error, la correcta late.
3. Tocar 🐱: pasa al Piano. Suenan palmas. Cae el bloque "I see"; al tocarlo suena una nota, se oye "I see", vuela a la primera ranura y la bailarina se mueve. Luego caen "a" y "cat".
4. Al completar: melodía de 3 notas, frase completa, y pasa a Voz. La frase se dice lento, la boca late, y a los 2,5 segundos aparece ✅.
5. ✅ lleva a Captura: la criatura aparece con una estrella. Un toque vuelve al mapa, donde la primera criatura está en color con ⭐ y 💤, y la segunda late.
6. 📖 muestra la primera criatura; al tocarla se oye su frase.

Repaso (niveles 2 y 3), usando la fecha simulada:
7. Abrir `http://localhost:5173/?fecha=AAAA-MM-DD` con la fecha de mañana. La primera criatura late. En el Piano los tres bloques aparecen abajo y desordenados. Tocar uno fuera de orden: tiembla, no suena nota y la frase se repite lento; al segundo error seguido, el correcto late.
8. Completar con menos de 3 errores: Captura muestra ⭐⭐.
9. Abrir con una fecha 3 días posterior a la del punto 7: el Piano muestra 4 bloques, incluido "cats". Cometer 3 errores y completar: Captura muestra 💤 y el mapa mantiene ⭐⭐.
10. Abrir con el día siguiente al del punto 9: la criatura vuelve a estar disponible en nivel 3.

Frases de día:
11. En la consola, ejecutar lo siguiente y recargar la página. Las paradas 7 y 8 quedan disponibles una tras otra:

```js
localStorage.setItem('tablao-progreso-v1', JSON.stringify({
  version: 1,
  criaturas: Object.fromEntries(
    ['gato', 'perro', 'dosgatos', 'trespajaros', 'megustanperros', 'gatosyperros']
      .map((id) => [id, { nivel: 3, proximoRepaso: null }]),
  ),
}));
```

12. Capturar la 7: la frase es "Today is" más el día real (o el de `?fecha=`), y las tarjetas muestran la semana con un día marcado. Capturar la 8: "Tomorrow is" más el día siguiente.
13. En la frase 6 (`gatosyperros`), comprobar que las 5 teclas caben en pantalla; en nivel 3, las 6.

Robustez:
14. Tocar muy rápido y varias veces la misma tecla: se coloca una sola vez.
15. Durante el Piano, 🏠 vuelve al mapa y las palmas se detienen.
16. La consola no muestra errores en ningún punto.

Ejecutar también: `npm test`. Esperado: todas las pruebas aprobadas.

- [ ] **Paso 7: commit**

```bash
git -C /c/Users/Gfigueroa/Juegos add juego-ingles
git -C /c/Users/Gfigueroa/Juegos commit -m "Recorrido completo de una criatura: escucha, piano, voz y captura"
```

---

## Tarea 7: instalación sin conexión, publicación y prueba en el iPad

**Archivos:**
- Crear: `juego-ingles/scripts/generar-iconos.mjs`, `juego-ingles/public/icono-180.png`, `icono-192.png`, `icono-512.png` (generados), `.github/workflows/pages.yml`
- Modificar: `juego-ingles/vite.config.js`

**Interfaces:**
- Consume: el juego completo.
- Produce: una dirección pública `https://<usuario>.github.io/<repositorio>/` instalable en la pantalla de inicio del iPad.
- Sin GitHub CLI: la sesión se inicia con Git Credential Manager y el repositorio se crea en github.com.

- [ ] **Paso 1: generar los íconos**

`juego-ingles/scripts/generar-iconos.mjs`:

```js
// Genera íconos PNG rojos con lunares blancos, sin dependencias externas.
import { deflateSync, crc32 } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

function png(lado) {
  const fila = 1 + lado * 3;
  const datos = Buffer.alloc(fila * lado);
  const celda = lado / 4;
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const cx = (Math.floor(x / celda) + 0.5) * celda;
      const cy = (Math.floor(y / celda) + 0.5) * celda;
      const lunar = Math.hypot(x - cx, y - cy) < celda * 0.28;
      const i = y * fila + 1 + x * 3;
      datos[i] = lunar ? 255 : 214;
      datos[i + 1] = lunar ? 255 : 40;
      datos[i + 2] = lunar ? 255 : 40;
    }
  }
  const trozo = (tipo, cuerpo) => {
    const cabecera = Buffer.from(tipo);
    const largo = Buffer.alloc(4);
    largo.writeUInt32BE(cuerpo.length);
    const suma = Buffer.alloc(4);
    suma.writeUInt32BE(crc32(Buffer.concat([cabecera, cuerpo])));
    return Buffer.concat([largo, cabecera, cuerpo, suma]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(lado, 0);
  ihdr.writeUInt32BE(lado, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 2; // color RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(datos)),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(new URL('../public/', import.meta.url), { recursive: true });
for (const lado of [180, 192, 512]) {
  writeFileSync(new URL(`../public/icono-${lado}.png`, import.meta.url), png(lado));
}
console.log('Íconos generados en public/');
```

Ejecutar: `npm run iconos`
Esperado: "Íconos generados en public/" y tres archivos PNG en `juego-ingles/public/`. Abrir `icono-512.png` y comprobar que es un cuadrado rojo con 16 lunares blancos.

- [ ] **Paso 2: configurar la instalación sin conexión**

Reemplazar `juego-ingles/vite.config.js`:

```js
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono-180.png'],
      manifest: {
        name: 'Tablao de Palabras',
        short_name: 'Tablao',
        lang: 'es',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#fdf0d5',
        theme_color: '#d62828',
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png}'],
        // Phaser supera el límite por defecto de 2 MB.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  test: { environment: 'node' },
});
```

- [ ] **Paso 3: verificar la versión construida y el uso sin conexión**

Ejecutar: `npm run build`
Esperado: termina sin errores; `dist/` contiene `index.html`, `sw.js`, `manifest.webmanifest` y los íconos. La salida indica que el archivo de Phaser quedó en la lista de precarga.

Ejecutar: `npm run preview` y abrir la dirección local que indique.
1. Jugar una captura completa: funciona igual que en desarrollo.
2. En las herramientas del navegador, pestaña Application: el service worker aparece activo.
3. Marcar "Offline" en la pestaña Network y recargar: el juego carga y se puede jugar.

Ejecutar también: `npm test`. Esperado: todas las pruebas aprobadas.

- [ ] **Paso 4: flujo de publicación**

`.github/workflows/pages.yml`:

```yaml
name: Publicar Tablao de Palabras

on:
  push:
    branches: [main]
    paths: ['juego-ingles/**', '.github/workflows/pages.yml']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  publicar:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.despliegue.outputs.page_url }}
    defaults:
      run:
        working-directory: juego-ingles
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: juego-ingles/package-lock.json
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: juego-ingles/dist
      - id: despliegue
        uses: actions/deploy-pages@v4
```

- [ ] **Paso 5: commit**

```bash
git -C /c/Users/Gfigueroa/Juegos add .github juego-ingles
git -C /c/Users/Gfigueroa/Juegos commit -m "Instalación sin conexión e integración con GitHub Pages"
```

- [ ] **Paso 6: publicar (requiere confirmación de Gonzalo)**

Antes de ejecutar, confirmar con Gonzalo: nombre del repositorio, que será **público** (GitHub Pages gratuito lo exige) y que el correo configurado en git quedará visible en los commits.

No se usa GitHub CLI: el computador no tiene permisos de administrador. Git trae Git Credential Manager, que inicia sesión por el navegador en el primer `push`.

Ya hecho el 03-10-2026: repositorio público y vacío `https://github.com/chalofster/tablao-de-palabras`, con **Settings → Pages → Source: GitHub Actions**.

```bash
git -C /c/Users/Gfigueroa/Juegos remote add origin https://github.com/chalofster/tablao-de-palabras.git
git -C /c/Users/Gfigueroa/Juegos push -u origin main
```

Esperado: en el primer `push` se abre una ventana para autorizar con el navegador; Gonzalo la aprueba. El `push` dispara el flujo "Publicar Tablao de Palabras" (pestaña **Actions**), que debe terminar en verde. Abrir `https://chalofster.github.io/tablao-de-palabras/` en el computador: el juego carga y se puede jugar.

- [ ] **Paso 7: prueba en el iPad con la jugadora**

Gonzalo, en el iPad:
1. Abrir la dirección en Safari. Menú Compartir → "Agregar a pantalla de inicio". Abrir el juego desde el ícono rojo con lunares.
2. Con el interruptor de silencio activado, tocar para jugar: debe sonar la melodía y oírse "Hello!".
3. Activar el modo avión, cerrar y reabrir el juego: debe cargar.
4. Dejar que la jugadora juegue sin explicarle nada y observar:

| Qué observar | Si falla |
|---|---|
| ¿Entiende qué tocar en cada pantalla sin ayuda? | Ajustar íconos o agregar una mano animada que indique |
| ¿Se entiende la voz en inglés? | Pasar a audios grabados (decisión pendiente del diseño) |
| ¿Los bloques del nivel 1 caen a una velocidad cómoda? | Ajustar `duration` en `soltarSiguiente` |
| ¿Repite la frase en voz alta en la pantalla de la boca? | Revisar la pantalla Voz |
| ¿Quiere seguir después de la primera criatura? | Revisar ritmo y recompensa antes de agregar contenido |
| Al otro día, ¿aparece el repaso con los bloques desordenados? | Revisar que el juego se abrió desde el ícono instalado |

Registrar lo observado: de ello dependen las decisiones pendientes del diseño (voz e ilustraciones).
