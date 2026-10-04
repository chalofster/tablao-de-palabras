---
titulo: "Plan de implementación: zonas del mapa (etapa 1)"
tipo: plan de implementación
fecha: 04-10-2026
estado: pendiente de revisión
---

# Zonas del mapa: plan de implementación

> **Para agentes ejecutores:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** pasar de una a tres zonas (Patio, Parque y Juguetería), cada una con sus criaturas, repasos y práctica libre, sin perder el progreso guardado.

**Arquitectura:** el contenido se agrupa en `ZONAS` dentro de `src/logica/contenido.js`; un módulo puro nuevo, `src/logica/zonas.js`, decide qué zona se muestra, qué ofrece hoy, qué flechas llevan aviso y dónde van las paradas. Las escenas solo dibujan: el mapa lee la zona de `sesion.zona` y cambia de zona reiniciándose.

**Tecnologías:** Phaser 3.90.x, Vite, Vitest, Playwright con WebKit (solo para la verificación manual).

**Diseño:** `docs/superpowers/specs/2026-10-04-zonas-del-mapa-design.md`. Leerlo antes de ejecutar.

## Restricciones globales

- Raíz del repositorio: `C:\Users\Gfigueroa\Juegos`. Código del juego en `juego-ingles/`. Todos los comandos se ejecutan desde `juego-ingles/` salvo los de git.
- En PowerShell, `npm` está bloqueado por la política de ejecución: usar la herramienta Bash.
- Lienzo lógico de 1024 × 768, escalado con `Phaser.Scale.FIT`. Botones de al menos 110 px lógicos de diámetro.
- Navegación solo con íconos. Sin archivos de imagen ni de audio: figuras por código y emoji.
- Voz en inglés de Estados Unidos (`en-US`). Nombres de módulos, funciones y variables en español.
- La clave del progreso sigue siendo `tablao-progreso-v1`, con el mismo formato. La zona se guarda aparte en `tablao-zona-v1`.
- Las 8 criaturas del Patio conservan sus identificadores y su orden.
- Cada `commit` termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Publicar (push a `main`) está aprobado por Gonzalo para el cierre de esta etapa, después de la revisión final.

## Foco de revisión

1. **Progreso guardado de antes de las zonas** (criaturas del Patio capturadas o dominadas) → se conserva, y el Parque y la Juguetería parten con su primera captura disponible. Prueba en la tarea 2.
2. **Zona guardada inválida o almacenamiento bloqueado** → se abre el Patio sin fallar. Prueba en la tarea 2 (`zonaValida`).
3. **Zona con 9 criaturas** → las paradas caben en pantalla, no chocan entre sí ni con los botones y flechas. Prueba en la tarea 2 (`paradas`).
4. **Práctica del Patio con frases de día** (*Today is…*) → se resuelven con la fecha real. Prueba en la tarea 2 (`armarRonda` por zona).
5. **Repasos solo en la zona actual** → no encienden el punto rojo de ninguna flecha; una captura nueva disponible tampoco. Prueba en la tarea 2 (`avisos`).

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/logica/contenido.js` | Frases del Patio, Parque y Juguetería; `ACCIONES`, `fraseAccion`, `PINTURAS`, `ZONAS`, `FRASES` |
| `src/logica/zonas.js` (nuevo) | `buscarZona`, `zonaValida`, `vecina`, `tareasDeZona`, `avisos`, `paradas` |
| `src/logica/practica.js` | Práctica libre: frases del Parque con can y can't, `buscarFrase`, `armarRonda(zonaId)` |
| `src/sesion.js` | Zona actual y su guardado |
| `src/escenas/fondos.js` (nuevo) | Fondo de cada zona |
| `src/escenas/Mapa.js` | Zona actual, paradas, flechas con aviso, botón de práctica |
| `src/escenas/Coleccion.js` | Criaturas de la zona actual |
| `src/escenas/Fiesta.js` | Otra ronda de práctica de la zona actual |
| `src/escenas/dibujo.js`, `Piano.js` | Tarjetas y teclas con color pintado |
| `tests/contenido.test.js`, `tests/practica.test.js`, `tests/frase.test.js`, `tests/zonas.test.js` | Pruebas |

---

## Tarea 1: contenido por zonas

**Archivos:**
- Modificar: `src/logica/contenido.js` (reemplazo completo)
- Modificar: `src/logica/practica.js` (reemplazo completo)
- Modificar: `tests/contenido.test.js` (reemplazo completo), `tests/practica.test.js` (reemplazo completo), `tests/frase.test.js` (agregar al final)

**Interfaces:**
- Consume: `mezclar(lista, azar)` y `resolverFrase(def, fecha)` de `src/logica/frase.js`, sin cambios.
- Produce:
  - `ZONAS: Array<{ id: 'patio' | 'parque' | 'jugueteria', frases: Def[] }>` en ese orden.
  - `FRASES: Def[]`, todas las frases de todas las zonas.
  - `ACCIONES: Array<{ id, texto, icono }>` (9, en el orden de la guía).
  - `fraseAccion(accion, modal: 'can' | 'cant') → Def` sin `criatura`, con `id` `${modal}-${accion.id}`.
  - `PINTURAS: Record<string, number>`, color de cada nombre en inglés.
  - Bloque de color: `{ texto, color }` (sin `icono`). Imagen de color: `{ tipo: 'color', color, juguete }`.
  - En `practica.js`: `PRACTICA_PARQUE: Def[]` (18), `buscarFrase(id) → Def | undefined`, `armarRonda(azar?, cantidad?)` (sin cambio de firma en esta tarea), `tareaPractica`, `siguienteTarea` (sin cambios).

- [ ] **Paso 1: escribir las pruebas de contenido**

Reemplazar `tests/contenido.test.js` completo:

```js
import { describe, it, expect } from 'vitest';
import { FRASES, ZONAS, ESCALA, PINTURAS } from '../src/logica/contenido.js';

const textoDe = (def) => def.bloques.map((bloque) => bloque.texto).join(' ');

describe('contenido', () => {
  it('tiene tres zonas: Patio con 8 criaturas, Parque con 9 y Juguetería con 8', () => {
    expect(ZONAS.map((z) => [z.id, z.frases.length])).toEqual([
      ['patio', 8], ['parque', 9], ['jugueteria', 8],
    ]);
    expect(FRASES).toHaveLength(25);
  });

  it('los identificadores son únicos en todo el juego', () => {
    expect(new Set(FRASES.map((f) => f.id)).size).toBe(FRASES.length);
  });

  it('el Patio conserva sus criaturas y su orden', () => {
    expect(ZONAS[0].frases.map((f) => f.id)).toEqual([
      'gato', 'perro', 'dosgatos', 'trespajaros', 'megustanperros', 'gatosyperros', 'hoy', 'manana',
    ]);
  });

  it('cada frase tiene criatura, entre 3 y 5 bloques y cabe en la escala', () => {
    for (const f of FRASES) {
      expect(f.criatura.nombre.length).toBeGreaterThan(0);
      expect(Number.isInteger(f.criatura.color)).toBe(true);
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

  it("el Parque alterna I can y I can't con las 9 acciones de la guía", () => {
    expect(ZONAS[1].frases.map(textoDe)).toEqual([
      'I can swim', "I can't ride a bike", 'I can run', "I can't fly a kite", 'I can dance',
      "I can't play soccer", 'I can sing', "I can't skate", 'I can jump',
    ]);
  });

  it('la Juguetería usa I have, el artículo correcto, un color pintado y un juguete', () => {
    expect(ZONAS[2].frases.map(textoDe)).toEqual([
      'I have a red ball', 'I have a blue car', 'I have a yellow duck', 'I have a green kite',
      'I have a pink doll', 'I have a brown teddy bear', 'I have an orange robot', 'I have a purple bike',
    ]);
    for (const f of ZONAS[2].frases) {
      const [, , pintura, juguete] = f.bloques;
      expect(pintura.color).toBe(PINTURAS[pintura.texto]);
      expect(f.distractor.color).toBe(PINTURAS[f.distractor.texto]);
      expect(f.distractor.texto).not.toBe(pintura.texto);
      expect(f.imagen).toEqual({ tipo: 'color', color: pintura.color, juguete: juguete.icono });
      expect(f.criatura.color).toBe(pintura.color);
    }
  });
});
```

- [ ] **Paso 2: escribir las pruebas de práctica**

Reemplazar `tests/practica.test.js` completo:

```js
import { describe, it, expect } from 'vitest';
import { ACCIONES, ZONAS } from '../src/logica/contenido.js';
import { resolverFrase } from '../src/logica/frase.js';
import {
  PRACTICA_PARQUE, buscarFrase, armarRonda, tareaPractica, siguienteTarea,
} from '../src/logica/practica.js';

const textoDe = (def) => def.bloques.map((bloque) => bloque.texto).join(' ');

describe('contenido de la práctica', () => {
  it("el Parque practica las 9 acciones de la guía, cada una con can y can't", () => {
    expect(ACCIONES.map((a) => a.texto)).toEqual([
      'swim', 'ride a bike', 'run', 'dance', 'sing', 'jump', 'fly a kite', 'play soccer', 'skate',
    ]);
    expect(PRACTICA_PARQUE).toHaveLength(18);
    expect(new Set(PRACTICA_PARQUE.map((f) => f.id)).size).toBe(18);
  });

  it("arma las frases I can… y I can't…", () => {
    const textos = PRACTICA_PARQUE.map((f) => resolverFrase(f, new Date(2026, 9, 4)).texto);
    expect(textos).toContain('I can swim');
    expect(textos).toContain("I can't ride a bike");
  });

  it("el distractor es la palabra contraria: can frente a can't", () => {
    for (const f of PRACTICA_PARQUE) {
      const modal = f.bloques[1].texto;
      expect(f.distractor.texto).toBe(modal === 'can' ? "can't" : 'can');
    }
  });

  it('las imágenes alternativas son la misma acción al revés y otra acción', () => {
    for (const f of PRACTICA_PARQUE) {
      const todas = [f.imagen, ...f.otras].map((i) => i.valor);
      expect(new Set(todas).size).toBe(3);
      const accion = f.bloques[2].icono;
      expect(f.imagen.valor).toContain(accion);
      expect(f.otras[0].valor).toContain(accion);
      expect(f.otras[1].valor).not.toContain(accion);
    }
  });

  it('las criaturas del Parque son frases de su práctica', () => {
    for (const criatura of ZONAS[1].frases) {
      const practica = PRACTICA_PARQUE.find((f) => f.id === criatura.id);
      expect(practica).toBeDefined();
      expect(textoDe(practica)).toBe(textoDe(criatura));
    }
  });
});

describe('buscarFrase', () => {
  it('encuentra criaturas de todas las zonas y frases de práctica', () => {
    expect(buscarFrase('gato').id).toBe('gato');
    expect(buscarFrase('can-swim').criatura.nombre).toBe('Burbuja');
    expect(buscarFrase('cant-swim').bloques[1].texto).toBe("can't");
    expect(buscarFrase('tengo-ball').bloques[2].texto).toBe('red');
    expect(buscarFrase('nada')).toBeUndefined();
  });
});

describe('armarRonda', () => {
  it("entrega 6 frases de acciones distintas, mitad can y mitad can't", () => {
    for (let vuelta = 0; vuelta < 50; vuelta++) {
      const ronda = armarRonda();
      expect(ronda).toHaveLength(6);
      expect(new Set(ronda.map((id) => id.split('-')[1])).size).toBe(6);
      expect(ronda.filter((id) => id.startsWith('can-'))).toHaveLength(3);
      expect(ronda.filter((id) => id.startsWith('cant-'))).toHaveLength(3);
      for (const id of ronda) expect(buscarFrase(id)).toBeDefined();
    }
  });

  it('con el tiempo usa las 9 acciones', () => {
    const vistas = new Set();
    for (let vuelta = 0; vuelta < 200; vuelta++) armarRonda().forEach((id) => vistas.add(id.split('-')[1]));
    expect(vistas.size).toBe(9);
  });
});

describe('recorrido de la ronda', () => {
  const ronda = ['can-swim', 'cant-run'];

  it('la tarea de práctica lleva la ronda y su posición', () => {
    expect(tareaPractica(ronda, 0)).toEqual({ id: 'can-swim', nivel: 3, tipo: 'practica', ronda, indice: 0 });
  });

  it('avanza a la siguiente frase y termina con null', () => {
    const primera = tareaPractica(ronda, 0);
    const segunda = siguienteTarea({ ...primera, errores: 2 });
    expect(segunda).toEqual({ id: 'cant-run', nivel: 3, tipo: 'practica', ronda, indice: 1 });
    expect(siguienteTarea(segunda)).toBeNull();
  });
});
```

- [ ] **Paso 3: agregar la prueba de frases con color**

En `tests/frase.test.js`, cambiar la línea 2 por:

```js
import { FRASES, ZONAS, PINTURAS } from '../src/logica/contenido.js';
```

y agregar al final del archivo:

```js
describe('frases con colores', () => {
  it('resolverFrase conserva el color de bloques, distractor e imagen', () => {
    const frase = resolverFrase(ZONAS[2].frases[0], domingo);
    expect(frase.texto).toBe('I have a red ball');
    expect(frase.bloques[2]).toMatchObject({ texto: 'red', color: PINTURAS.red });
    expect(frase.distractor).toMatchObject({ texto: 'blue', color: PINTURAS.blue, nota: null });
    expect(frase.imagen).toEqual({ tipo: 'color', color: PINTURAS.red, juguete: '🏐' });
  });
});
```

`frase.js` no cambia: `resolverFrase` ya copia cualquier bloque o imagen sin `dia`. Esta prueba lo deja fijado.

- [ ] **Paso 4: verificar que fallan**

Run: `npx vitest run tests/contenido.test.js tests/practica.test.js tests/frase.test.js`
Expected: FAIL. `ZONAS` y `PINTURAS` no existen en `contenido.js`, y `PRACTICA_PARQUE` no existe en `practica.js`.

- [ ] **Paso 5: escribir el contenido**

Reemplazar `src/logica/contenido.js` completo:

```js
// Mi frigio: la escala que da el color flamenco.
export const ESCALA = [64, 65, 67, 69, 71, 72, 74, 76];

const b = (texto, icono) => ({ texto, icono });
const dia = (desplazamiento) => ({ dia: desplazamiento });
const emoji = (valor) => ({ tipo: 'emoji', valor });

// Patio. { dia: n } se reemplaza por el día real: 0 es hoy, 1 es mañana.
const PATIO = [
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

// Parque: las 9 acciones de la guía del colegio, en su orden.
export const ACCIONES = [
  { id: 'swim', texto: 'swim', icono: '🏊' },
  { id: 'bike', texto: 'ride a bike', icono: '🚴' },
  { id: 'run', texto: 'run', icono: '🏃' },
  { id: 'dance', texto: 'dance', icono: '💃' },
  { id: 'sing', texto: 'sing', icono: '🎤' },
  { id: 'jump', texto: 'jump', icono: '🤸' },
  { id: 'kite', texto: 'fly a kite', icono: '🪁' },
  { id: 'soccer', texto: 'play soccer', icono: '⚽' },
  { id: 'skate', texto: 'skate', icono: '🛹' },
];

const MODALES = { can: b('can', '🙂'), cant: b("can't", '🙁') };
const caraYAccion = (modal, accion) => emoji(MODALES[modal].icono + accion.icono);

// Frase "I can / I can't" sin criatura: la usan el Parque y su práctica libre.
// Alternativas: la misma acción con la carita contraria y otra acción con la misma carita.
export function fraseAccion(accion, modal) {
  const otra = ACCIONES[(ACCIONES.indexOf(accion) + 1) % ACCIONES.length];
  const contrario = modal === 'can' ? 'cant' : 'can';
  return {
    id: `${modal}-${accion.id}`,
    bloques: [b('I', '🙋'), MODALES[modal], b(accion.texto, accion.icono)],
    imagen: caraYAccion(modal, accion),
    otras: [caraYAccion(contrario, accion), caraYAccion(modal, otra)],
    distractor: MODALES[contrario],
  };
}

const accion = (id) => ACCIONES.find((a) => a.id === id);

// Cada criatura tiene su frase fija; el orden de captura alterna can y can't.
const PARQUE = [
  ['can', 'swim', 'Burbuja', 0x48cae4],
  ['cant', 'bike', 'Pedalín', 0xf77f00],
  ['can', 'run', 'Veloz', 0xe63946],
  ['cant', 'kite', 'Ventolera', 0x8ecae6],
  ['can', 'dance', 'Taconeo', 0xd62828],
  ['cant', 'soccer', 'Golazo', 0x2a9d8f],
  ['can', 'sing', 'Coplita', 0x9d4edd],
  ['cant', 'skate', 'Rueditas', 0x6c757d],
  ['can', 'jump', 'Saltarín', 0xf4a261],
].map(([modal, id, nombre, color]) => ({
  ...fraseAccion(accion(id), modal),
  criatura: { nombre, color, emoji: accion(id).icono },
}));

// Juguetería. Los colores se pintan como círculos: no hay emoji de todos los colores
// y los emoji se ven distintos en cada equipo.
export const PINTURAS = {
  red: 0xe63946, blue: 0x3a86ff, yellow: 0xffd60a, green: 0x38b000,
  pink: 0xff70a6, brown: 0x8b5a2b, orange: 0xff8c1a, purple: 0x8338ec,
};
const pintura = (nombre) => ({ texto: nombre, color: PINTURAS[nombre] });
const juguete = (color, icono) => ({ tipo: 'color', color: PINTURAS[color], juguete: icono });

const JUGUETES = [
  { id: 'ball', color: 'red', articulo: 'a', texto: 'ball', icono: '🏐', nombre: 'Botecito' },
  { id: 'car', color: 'blue', articulo: 'a', texto: 'car', icono: '🚗', nombre: 'Bocinazo' },
  { id: 'duck', color: 'yellow', articulo: 'a', texto: 'duck', icono: '🦆', nombre: 'Cuac' },
  { id: 'kite', color: 'green', articulo: 'a', texto: 'kite', icono: '🪁', nombre: 'Cometín' },
  { id: 'doll', color: 'pink', articulo: 'a', texto: 'doll', icono: '🪆', nombre: 'Muñequita' },
  { id: 'teddy', color: 'brown', articulo: 'a', texto: 'teddy bear', icono: '🧸', nombre: 'Peluchín' },
  { id: 'robot', color: 'orange', articulo: 'an', texto: 'robot', icono: '🤖', nombre: 'Robotín' },
  { id: 'bike', color: 'purple', articulo: 'a', texto: 'bike', icono: '🚲', nombre: 'Rueda' },
];

// Alternativas: el mismo juguete con otro color y otro juguete con el mismo color.
const JUGUETERIA = JUGUETES.map((j, i) => {
  const otro = JUGUETES[(i + 1) % JUGUETES.length];
  return {
    id: `tengo-${j.id}`,
    criatura: { nombre: j.nombre, color: PINTURAS[j.color], emoji: j.icono },
    bloques: [b('I have', '🤲'), b(j.articulo, '☝️'), pintura(j.color), b(j.texto, j.icono)],
    imagen: juguete(j.color, j.icono),
    otras: [juguete(otro.color, j.icono), juguete(j.color, otro.icono)],
    distractor: pintura(otro.color),
  };
});

// Para agregar una zona basta con sumar un elemento a esta lista.
export const ZONAS = [
  { id: 'patio', frases: PATIO },
  { id: 'parque', frases: PARQUE },
  { id: 'jugueteria', frases: JUGUETERIA },
];

export const FRASES = ZONAS.flatMap((zona) => zona.frases);
```

- [ ] **Paso 6: adaptar la práctica**

Reemplazar `src/logica/practica.js` completo:

```js
import { ACCIONES, FRASES, fraseAccion } from './contenido.js';
import { mezclar } from './frase.js';

// Práctica libre: sin criaturas, sin esperas y sin guardar progreso.
// En el Parque se practican las 18 combinaciones de can y can't, no solo las de sus criaturas.
export const PRACTICA_PARQUE = ACCIONES.flatMap((accion) =>
  ['can', 'cant'].map((modal) => fraseAccion(accion, modal)),
);

export function buscarFrase(id) {
  return FRASES.find((f) => f.id === id) ?? PRACTICA_PARQUE.find((f) => f.id === id);
}

export function armarRonda(azar = Math.random, cantidad = 6) {
  const acciones = mezclar(ACCIONES, azar).slice(0, cantidad);
  const modales = mezclar(acciones.map((_, i) => (i % 2 === 0 ? 'can' : 'cant')), azar);
  return acciones.map((accion, i) => `${modales[i]}-${accion.id}`);
}

// Nivel 3: todas las teclas a la vista más el distractor.
export function tareaPractica(ronda, indice) {
  return { id: ronda[indice], nivel: 3, tipo: 'practica', ronda, indice };
}

export function siguienteTarea(tarea) {
  const indice = tarea.indice + 1;
  return indice < tarea.ronda.length ? tareaPractica(tarea.ronda, indice) : null;
}
```

- [ ] **Paso 7: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos. Las pruebas de `repaso.test.js` siguen pasando sin cambios porque el Patio va primero en `FRASES`.

- [ ] **Paso 8: commit**

```bash
git add juego-ingles/src/logica/contenido.js juego-ingles/src/logica/practica.js juego-ingles/tests
git commit -m "Contenido por zonas: Parque y Juguetería

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 2: lógica de zonas y práctica por zona

**Archivos:**
- Crear: `src/logica/zonas.js`, `tests/zonas.test.js`
- Modificar: `src/logica/practica.js` (`armarRonda`), `tests/practica.test.js`

**Interfaces:**
- Consume: `ZONAS` de la tarea 1; `disponibles(estado, hoy, frases)` de `src/logica/repaso.js`; `estadoInicial`, `registrarExito` de `src/logica/progreso.js` (solo en pruebas).
- Produce:
  - `buscarZona(id) → zona` (si `id` no existe, el Patio).
  - `zonaValida(id) → string` (id existente; si no, `'patio'`).
  - `vecina(id, paso: -1 | 1) → string | null`.
  - `tareasDeZona(estado, hoy, id) → Tarea[]` (mismo formato que `disponibles`).
  - `avisos(estado, hoy, id) → { izquierda: boolean, derecha: boolean }`: repasos pendientes en zonas hacia cada lado.
  - `paradas(cantidad) → Array<{ x, y }>`.
  - `armarRonda(zonaId, azar?, cantidad?) → string[]` (nueva firma).

- [ ] **Paso 1: escribir las pruebas de zonas**

Crear `tests/zonas.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { ZONAS } from '../src/logica/contenido.js';
import { estadoInicial, registrarExito } from '../src/logica/progreso.js';
import {
  buscarZona, zonaValida, vecina, tareasDeZona, avisos, paradas,
} from '../src/logica/zonas.js';

const hoy = '2026-10-10';

describe('buscarZona y zonaValida', () => {
  it('encuentra cada zona por su id', () => {
    expect(buscarZona('parque')).toBe(ZONAS[1]);
    expect(zonaValida('jugueteria')).toBe('jugueteria');
  });

  it('con un valor guardado inválido abre el Patio', () => {
    for (const valor of [null, undefined, '', 'castillo', '{"zona":1}']) {
      expect(buscarZona(valor)).toBe(ZONAS[0]);
      expect(zonaValida(valor)).toBe('patio');
    }
  });
});

describe('vecina', () => {
  it('da la zona de cada lado y null en los extremos', () => {
    expect(vecina('patio', -1)).toBeNull();
    expect(vecina('patio', 1)).toBe('parque');
    expect(vecina('parque', -1)).toBe('patio');
    expect(vecina('parque', 1)).toBe('jugueteria');
    expect(vecina('jugueteria', 1)).toBeNull();
  });
});

describe('tareasDeZona', () => {
  it('cada zona nueva ofrece capturar su primera criatura', () => {
    expect(tareasDeZona(estadoInicial(), hoy, 'parque')).toEqual([{ id: 'can-swim', nivel: 1, tipo: 'captura' }]);
    expect(tareasDeZona(estadoInicial(), hoy, 'jugueteria')).toEqual([{ id: 'tengo-ball', nivel: 1, tipo: 'captura' }]);
  });

  it('el progreso guardado del Patio se conserva y no bloquea las zonas nuevas', () => {
    const dominado = {
      version: 1,
      criaturas: Object.fromEntries(ZONAS[0].frases.map((f) => [f.id, { nivel: 3, proximoRepaso: null }])),
    };
    expect(tareasDeZona(dominado, hoy, 'patio')).toEqual([]);
    expect(tareasDeZona(dominado, hoy, 'parque')).toEqual([{ id: 'can-swim', nivel: 1, tipo: 'captura' }]);
  });

  it('un repaso del Patio no aparece en el Parque', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(tareasDeZona(estado, hoy, 'patio')[0]).toEqual({ id: 'gato', nivel: 2, tipo: 'repaso' });
    expect(tareasDeZona(estado, hoy, 'parque').some((t) => t.id === 'gato')).toBe(false);
  });
});

describe('avisos', () => {
  it('sin repasos pendientes no hay avisos, aunque haya capturas nuevas', () => {
    for (const zona of ['patio', 'parque', 'jugueteria']) {
      expect(avisos(estadoInicial(), hoy, zona)).toEqual({ izquierda: false, derecha: false });
    }
  });

  it('un repaso en la zona actual no enciende ninguna flecha', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(avisos(estado, hoy, 'patio')).toEqual({ izquierda: false, derecha: false });
  });

  it('avisa hacia el lado donde hay repasos, aunque sea una zona más allá', () => {
    let estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(avisos(estado, hoy, 'parque')).toEqual({ izquierda: true, derecha: false });
    expect(avisos(estado, hoy, 'jugueteria')).toEqual({ izquierda: true, derecha: false });
    estado = registrarExito(estado, 'tengo-ball', '2026-10-03');
    expect(avisos(estado, hoy, 'parque')).toEqual({ izquierda: true, derecha: true });
  });

  it('un repaso que todavía no vence no avisa', () => {
    const estado = registrarExito(estadoInicial(), 'tengo-ball', hoy);
    expect(avisos(estado, hoy, 'patio')).toEqual({ izquierda: false, derecha: false });
  });
});

describe('paradas', () => {
  for (const cantidad of [8, 9]) {
    it(`con ${cantidad} criaturas caben en pantalla sin chocar`, () => {
      const lista = paradas(cantidad);
      expect(lista).toHaveLength(cantidad);
      expect(lista[0].x).toBe(150);
      expect(lista[cantidad - 1].x).toBe(874);
      lista.forEach((parada, i) => {
        // Entre las flechas del suelo (x 5–115 y 909–1019) y bajo los botones de la derecha (hasta y 265).
        expect(parada.x).toBeGreaterThanOrEqual(150);
        expect(parada.x).toBeLessThanOrEqual(874);
        expect(parada.y).toBe(i % 2 === 0 ? 470 : 330);
        if (i > 0) expect(parada.x - lista[i - 1].x).toBeGreaterThanOrEqual(90);
      });
    });
  }
});
```

- [ ] **Paso 2: agregar las pruebas de práctica por zona**

En `tests/practica.test.js`:

1. Cambiar las importaciones del inicio por:

```js
import { describe, it, expect } from 'vitest';
import { ACCIONES, ZONAS } from '../src/logica/contenido.js';
import { resolverFrase } from '../src/logica/frase.js';
import { buscarZona } from '../src/logica/zonas.js';
import {
  PRACTICA_PARQUE, buscarFrase, armarRonda, tareaPractica, siguienteTarea,
} from '../src/logica/practica.js';
```

2. Dentro de `describe('armarRonda', …)`, cambiar las dos llamadas `armarRonda()` por `armarRonda('parque')`.

3. Agregar antes de `describe('recorrido de la ronda', …)`:

```js
describe('armarRonda en el Patio y la Juguetería', () => {
  const domingo = new Date(2026, 9, 4, 12);

  for (const zona of ['patio', 'jugueteria']) {
    it(`en ${zona} entrega 6 frases distintas de esa zona, todas resolubles`, () => {
      const ids = new Set(buscarZona(zona).frases.map((f) => f.id));
      for (let vuelta = 0; vuelta < 30; vuelta++) {
        const ronda = armarRonda(zona);
        expect(ronda).toHaveLength(6);
        expect(new Set(ronda).size).toBe(6);
        for (const id of ronda) {
          expect(ids.has(id)).toBe(true);
          expect(resolverFrase(buscarFrase(id), domingo).texto.length).toBeGreaterThan(0);
        }
      }
    });
  }

  it('las frases de día de la práctica del Patio usan la fecha real', () => {
    expect(resolverFrase(buscarFrase('hoy'), domingo).texto).toBe('Today is Sunday');
  });

  it('con una zona desconocida practica el Patio', () => {
    const ids = new Set(ZONAS[0].frases.map((f) => f.id));
    expect(armarRonda('castillo').every((id) => ids.has(id))).toBe(true);
  });
});
```

- [ ] **Paso 3: verificar que fallan**

Run: `npx vitest run tests/zonas.test.js tests/practica.test.js`
Expected: FAIL. `zonas.js` no existe, y `armarRonda('patio')` todavía entrega frases del Parque.

- [ ] **Paso 4: escribir la lógica de zonas**

Crear `src/logica/zonas.js`:

```js
import { ZONAS } from './contenido.js';
import { disponibles } from './repaso.js';

// Si el id no existe (por ejemplo, un valor guardado dañado), se usa el Patio.
export function buscarZona(id) {
  return ZONAS.find((zona) => zona.id === id) ?? ZONAS[0];
}

export function zonaValida(id) {
  return buscarZona(id).id;
}

export function vecina(id, paso) {
  return ZONAS[ZONAS.indexOf(buscarZona(id)) + paso]?.id ?? null;
}

export function tareasDeZona(estado, hoy, id) {
  return disponibles(estado, hoy, buscarZona(id).frases);
}

const tieneRepasos = (estado, hoy, zona) =>
  disponibles(estado, hoy, zona.frases).some((tarea) => tarea.tipo === 'repaso');

// Punto rojo de cada flecha: repasos pendientes en alguna zona hacia ese lado.
export function avisos(estado, hoy, id) {
  const i = ZONAS.indexOf(buscarZona(id));
  return {
    izquierda: ZONAS.slice(0, i).some((zona) => tieneRepasos(estado, hoy, zona)),
    derecha: ZONAS.slice(i + 1).some((zona) => tieneRepasos(estado, hoy, zona)),
  };
}

// Camino en zigzag: entre las flechas del suelo y bajo los botones de la derecha.
const X_PRIMERA = 150;
const X_ULTIMA = 874;

export function paradas(cantidad) {
  const paso = cantidad > 1 ? (X_ULTIMA - X_PRIMERA) / (cantidad - 1) : 0;
  return Array.from({ length: cantidad }, (_, i) => ({
    x: Math.round(X_PRIMERA + i * paso),
    y: i % 2 === 0 ? 470 : 330,
  }));
}
```

- [ ] **Paso 5: práctica por zona**

En `src/logica/practica.js`, agregar después de la importación de `mezclar`:

```js
import { buscarZona } from './zonas.js';
```

y reemplazar la función `armarRonda` completa por:

```js
// En el Parque: 6 acciones distintas, mitad can y mitad can't.
// En las demás zonas: 6 frases distintas de la zona.
export function armarRonda(zonaId, azar = Math.random, cantidad = 6) {
  const zona = buscarZona(zonaId);
  if (zona.id !== 'parque') {
    return mezclar(zona.frases, azar).slice(0, cantidad).map((frase) => frase.id);
  }
  const acciones = mezclar(ACCIONES, azar).slice(0, cantidad);
  const modales = mezclar(acciones.map((_, i) => (i % 2 === 0 ? 'can' : 'cant')), azar);
  return acciones.map((accion, i) => `${modales[i]}-${accion.id}`);
}
```

- [ ] **Paso 6: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 7: commit**

```bash
git add juego-ingles/src/logica juego-ingles/tests
git commit -m "Lógica de zonas: tareas, avisos, paradas y práctica por zona

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 3: pantallas por zona

**Archivos:**
- Crear: `src/escenas/fondos.js`
- Modificar: `src/sesion.js`, `src/escenas/Mapa.js` (reemplazo completo), `src/escenas/Coleccion.js`, `src/escenas/Fiesta.js`, `src/escenas/dibujo.js` (`crearTarjeta`), `src/escenas/Piano.js` (`crearTecla`)

**Interfaces:**
- Consume: `buscarZona`, `zonaValida`, `vecina`, `tareasDeZona`, `avisos`, `paradas` (tarea 2); `armarRonda(zonaId)`, `tareaPractica` (tarea 2); bloques e imágenes de color (tarea 1).
- Produce:
  - `sesion.zona: string` y `sesion.cambiarZona(id)`.
  - `dibujarFondo(escena, zonaId)`.
  - En la escena `Mapa`, `this.aviso` con el resultado de `avisos` (lo lee la verificación con WebKit).

Esta tarea es visual. Se verifica con la construcción, la suite completa y un recorrido con WebKit simulando un iPad (paso 9).

- [ ] **Paso 1: zona en la sesión**

Reemplazar `src/sesion.js` completo:

```js
import { cargar, guardar } from './logica/progreso.js';
import { zonaValida } from './logica/zonas.js';

const CLAVE_ZONA = 'tablao-zona-v1';

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

// Recordar la zona es solo una comodidad: si no se puede leer, se abre el Patio.
function zonaGuardada() {
  try { return zonaValida(almacen().getItem(CLAVE_ZONA)); } catch { return zonaValida(null); }
}

export const sesion = {
  voz: null,
  musica: null,
  estado: cargar(almacen()),
  zona: zonaGuardada(),
  ahora() {
    return fechaDeUrl() ?? new Date();
  },
  guardarEstado(nuevo) {
    this.estado = nuevo;
    guardar(almacen(), nuevo);
  },
  cambiarZona(id) {
    this.zona = zonaValida(id);
    try { almacen().setItem(CLAVE_ZONA, this.zona); } catch { /* sin almacenamiento: dura esta sesión */ }
  },
};
```

- [ ] **Paso 2: fondos de las zonas**

Crear `src/escenas/fondos.js`:

```js
import { ANCHO, ALTO } from '../constantes.js';
import { COLORES } from './dibujo.js';

const Y_PISO = 560;

function patio(escena) {
  const g = escena.add.graphics();
  g.fillStyle(COLORES.crema);
  g.fillRect(0, 0, ANCHO, Y_PISO);
  g.fillStyle(0xe9c46a);
  g.fillRect(0, Y_PISO, ANCHO, ALTO - Y_PISO);
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

// Colores suaves: las criaturas grises por capturar tienen que distinguirse.
function parque(escena) {
  const g = escena.add.graphics();
  g.fillStyle(0xcaf0f8);
  g.fillRect(0, 0, ANCHO, Y_PISO);
  g.fillStyle(0x95d5b2);
  g.fillRect(0, Y_PISO, ANCHO, ALTO - Y_PISO);
  g.fillStyle(0xffd166);
  g.fillCircle(110, 100, 55);
  for (let i = 0; i < 4; i++) {
    const x = 128 + i * 256;
    g.fillStyle(0xc9a27e);
    g.fillRect(x - 16, 400, 32, 160);
    g.fillStyle(0xb7e4c7);
    g.fillCircle(x, 360, 85);
    g.fillCircle(x - 60, 410, 55);
    g.fillCircle(x + 60, 410, 55);
  }
}

// Estantes con juguetes sencillos; terminan antes de los botones de la derecha.
function jugueteria(escena) {
  const g = escena.add.graphics();
  g.fillStyle(0xffe5ec);
  g.fillRect(0, 0, ANCHO, Y_PISO);
  g.fillStyle(0xdda15e);
  g.fillRect(0, Y_PISO, ANCHO, ALTO - Y_PISO);
  const colores = [0xe63946, 0x3a86ff, 0xffd60a, 0x38b000, 0xff70a6, 0x8338ec];
  for (const y of [170, 290]) {
    g.fillStyle(0xbc6c25);
    g.fillRect(40, y, ANCHO - 200, 16);
    for (let i = 0; i < 12; i++) {
      g.fillStyle(colores[i % colores.length], 0.45);
      if (i % 2 === 0) g.fillCircle(80 + i * 62, y - 24, 22);
      else g.fillRect(58 + i * 62, y - 46, 44, 46);
    }
  }
}

const FONDOS = { patio, parque, jugueteria };

export function dibujarFondo(escena, zonaId) {
  FONDOS[zonaId](escena);
}
```

- [ ] **Paso 3: el mapa por zonas**

Reemplazar `src/escenas/Mapa.js` completo:

```js
import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { claveDia } from '../logica/calendario.js';
import { buscarZona, tareasDeZona, avisos, vecina, paradas } from '../logica/zonas.js';
import { armarRonda, tareaPractica } from '../logica/practica.js';
import { COLORES, crearBailarina, crearBoton, crearCriatura } from './dibujo.js';
import { dibujarFondo } from './fondos.js';

const Y_SUELO = 640;
const Y_FLECHAS = 705;

export class Mapa extends Phaser.Scene {
  constructor() {
    super('Mapa');
  }

  create() {
    this.ocupada = false;
    const zona = buscarZona(sesion.zona);
    const hoy = claveDia(sesion.ahora());
    dibujarFondo(this, zona.id);

    const puntos = paradas(zona.frases.length);
    const camino = this.add.graphics().lineStyle(14, COLORES.oro, 1);
    puntos.forEach((parada, i) => {
      if (i > 0) camino.lineBetween(puntos[i - 1].x, puntos[i - 1].y, parada.x, parada.y);
    });

    const tareas = tareasDeZona(sesion.estado, hoy, zona.id);
    const capturadas = zona.frases.filter((f) => sesion.estado.criaturas[f.id]).length;
    const partida = puntos[Math.max(0, capturadas - 1)];

    zona.frases.forEach((frase, i) => {
      const parada = puntos[i];
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

    // La bailarina camina por el suelo, bajo las paradas, para no tapar a las criaturas.
    this.bailarina = crearBailarina(this, partida.x, Y_SUELO, 0.8);
    crearBoton(this, ANCHO - 80, 80, '📖', () => this.scene.start('Coleccion'));
    crearBoton(this, ANCHO - 80, 210, '🤸', () => this.scene.start('Escucha', tareaPractica(armarRonda(zona.id), 0)));
    this.crearFlechas(zona.id, hoy);
    if (tareas.length === 0) this.bailarina.pose('celebracion');
  }

  // Una flecha por lado, solo si hay zona hacia ese lado; el punto rojo avisa repasos pendientes allá.
  crearFlechas(zonaId, hoy) {
    this.aviso = avisos(sesion.estado, hoy, zonaId);
    const lados = [
      { paso: -1, x: 60, icono: '◀️', conAviso: this.aviso.izquierda },
      { paso: 1, x: ANCHO - 60, icono: '▶️', conAviso: this.aviso.derecha },
    ];
    for (const { paso, x, icono, conAviso } of lados) {
      const destino = vecina(zonaId, paso);
      if (!destino) continue;
      crearBoton(this, x, Y_FLECHAS, icono, () => this.irAZona(destino));
      if (conAviso) this.add.circle(x + 40, Y_FLECHAS - 40, 14, COLORES.rojo).setStrokeStyle(3, COLORES.crema);
    }
  }

  irAZona(id) {
    if (this.ocupada) return;
    this.ocupada = true;
    sesion.cambiarZona(id);
    this.scene.start('Mapa');
  }

  irA(parada, tarea) {
    if (this.ocupada) return;
    this.ocupada = true;
    this.bailarina.pose('caminar');
    this.tweens.add({
      targets: this.bailarina, x: parada.x, duration: 600,
      onComplete: () => this.scene.start('Escucha', tarea),
    });
  }
}
```

- [ ] **Paso 4: colección de la zona actual**

En `src/escenas/Coleccion.js`, reemplazar la importación de `FRASES`:

```js
import { FRASES } from '../logica/contenido.js';
```

por:

```js
import { buscarZona } from '../logica/zonas.js';
```

y reemplazar estas líneas:

```js
    FRASES.forEach((def, i) => {
      const x = 200 + (i % 4) * 210;
      const y = 290 + Math.floor(i / 4) * 260;
```

por:

```js
    // Cinco columnas: las 9 criaturas del Parque caben en dos filas.
    buscarZona(sesion.zona).frases.forEach((def, i) => {
      const x = 140 + (i % 5) * 186;
      const y = 270 + Math.floor(i / 5) * 260;
```

- [ ] **Paso 5: otra ronda de la misma zona**

En `src/escenas/Fiesta.js`, reemplazar `tareaPractica(armarRonda(), 0)` por `tareaPractica(armarRonda(sesion.zona), 0)`.

- [ ] **Paso 6: tarjetas con color pintado**

En `src/escenas/dibujo.js`, dentro de `crearTarjeta`, reemplazar:

```js
  if (imagen.tipo === 'emoji') {
    const dibujo = escena.add.text(0, 0, imagen.valor, { fontSize: '110px' }).setOrigin(0.5);
    tarjeta.add(ajustarAncho(dibujo, ancho - 40));
  } else {
```

por:

```js
  if (imagen.tipo === 'emoji') {
    const dibujo = escena.add.text(0, 0, imagen.valor, { fontSize: '110px' }).setOrigin(0.5);
    tarjeta.add(ajustarAncho(dibujo, ancho - 40));
  } else if (imagen.tipo === 'color') {
    // El color manda: un círculo grande pintado y el juguete encima.
    const lado = Math.min(ancho, alto);
    tarjeta.add(escena.add.circle(0, 0, lado * 0.36, imagen.color).setStrokeStyle(4, COLORES.tinta));
    tarjeta.add(escena.add.text(0, 0, imagen.juguete, { fontSize: `${Math.round(lado * 0.34)}px` }).setOrigin(0.5));
  } else {
```

- [ ] **Paso 7: teclas con color pintado**

En `src/escenas/Piano.js`, dentro de `crearTecla`, reemplazar:

```js
    const icono = this.add.text(0, -18, bloque.icono, { fontSize: '50px' }).setOrigin(0.5);
```

por:

```js
    // Un bloque de color muestra el color pintado en vez de un emoji.
    const icono = bloque.color === undefined
      ? ajustarAncho(this.add.text(0, -18, bloque.icono, { fontSize: '50px' }).setOrigin(0.5), LADO - 20)
      : this.add.circle(0, -18, 32, bloque.color).setStrokeStyle(4, COLORES.tinta);
```

y en el mismo método reemplazar:

```js
      ajustarAncho(icono, LADO - 20),
```

por:

```js
      icono,
```

- [ ] **Paso 8: suite y construcción**

Run: `npx vitest run && npx vite build`
Expected: PASS en todos los archivos y `files generated` sin errores.

- [ ] **Paso 9: recorrido con WebKit simulando un iPad**

Levantar el servidor de desarrollo en segundo plano: `npx vite --port 5199 --strictPort`.

En la carpeta donde están instalados Playwright y WebKit (en esta sesión, `<scratchpad>/webkit`), crear `probar-zonas.mjs`:

```js
// Recorre las tres zonas como un iPad horizontal, con el motor de Safari.
import { webkit, devices } from 'playwright';

const BASE = 'http://localhost:5199/';
const errores = [];
const navegador = await webkit.launch();
const ctx = await navegador.newContext({ ...devices['iPad Pro 11 landscape'] });

async function abrir(url) {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  return p;
}
const tocar = async (p, gx, gy) => {
  const c = await p.locator('canvas').boundingBox();
  await p.touchscreen.tap(c.x + (gx / 1024) * c.width, c.y + (gy / 768) * c.height);
};
const escena = (p) => p.evaluate(() => window.__tablao.juego.scene.getScenes(true)[0]?.scene.key);
async function esperar(p, clave, ms = 30000) {
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    if ((await escena(p)) === clave) return;
    await p.waitForTimeout(200);
  }
  throw new Error(`no llegó a ${clave}; está en ${await escena(p)}`);
}
const mapa = (p) => p.evaluate(() => ({
  zona: window.__tablao.sesion.zona,
  aviso: window.__tablao.juego.scene.getScene('Mapa').aviso,
}));
const capturas = (p) => p.evaluate(() => Object.keys(window.__tablao.sesion.estado.criaturas));

async function escuchar(p, foto) {
  await esperar(p, 'Escucha');
  await p.waitForTimeout(600);
  if (foto) await p.screenshot({ path: `${foto}-escucha.png` });
  for (let k = 0; k < 3 && (await escena(p)) === 'Escucha'; k++) {
    await tocar(p, 212 + k * 300, 450);
    await p.waitForTimeout(900);
  }
}

async function armar(p, foto) {
  await esperar(p, 'Piano');
  for (let vuelta = 0; vuelta < 12 && (await escena(p)) === 'Piano'; vuelta++) {
    const nivel = await p.evaluate(() => window.__tablao.juego.scene.getScene('Piano').tarea.nivel);
    await p.waitForTimeout(nivel <= 1 ? 2700 : 600);
    if (foto && vuelta === 0) await p.screenshot({ path: `${foto}-piano.png` });
    const destino = await p.evaluate(() => {
      const e = window.__tablao.juego.scene.getScene('Piano');
      const bloque = e.frase.bloques[e.colocados];
      const tecla = bloque && e.teclas.find((t) => !t.colocada && t.bloque.texto === bloque.texto);
      return tecla ? { x: tecla.x, y: tecla.y } : null;
    });
    if (!destino) break;
    await tocar(p, destino.x, destino.y);
  }
}

async function decir(p) {
  await esperar(p, 'Voz');
  await p.waitForTimeout(10000);
  await tocar(p, 662, 650);
}

async function capturarPrimera(p, foto) {
  await tocar(p, 150, 470);
  await escuchar(p, foto);
  await armar(p, foto);
  await decir(p);
  await esperar(p, 'Captura');
  await esperar(p, 'Mapa', 10000);
  await p.waitForTimeout(600);
}

const p = await abrir(BASE);
await tocar(p, 512, 600);
await esperar(p, 'Mapa');
await p.waitForTimeout(600);
console.log('1 inicio', JSON.stringify(await mapa(p)));
await p.screenshot({ path: 'z-patio.png' });

await tocar(p, 964, 705);
await esperar(p, 'Mapa');
await p.waitForTimeout(600);
console.log('2 tras ▶', JSON.stringify(await mapa(p)));
await p.screenshot({ path: 'z-parque.png' });
await capturarPrimera(p, 'z-parque');
console.log('3 capturas', JSON.stringify(await capturas(p)));

await tocar(p, 964, 705);
await esperar(p, 'Mapa');
await p.waitForTimeout(600);
console.log('4 tras ▶', JSON.stringify(await mapa(p)));
await p.screenshot({ path: 'z-jugueteria.png' });
await capturarPrimera(p, 'z-jugueteria');
console.log('5 capturas', JSON.stringify(await capturas(p)));

await tocar(p, 944, 210);
const ronda = [];
for (let i = 0; i < 6; i++) {
  await escuchar(p, i === 0 ? 'z-practica' : null);
  await esperar(p, 'Piano');
  ronda.push(await p.evaluate(() => window.__tablao.juego.scene.getScene('Piano').frase.texto));
  await armar(p, null);
  await decir(p);
}
await esperar(p, 'Fiesta');
console.log('6 práctica', JSON.stringify(ronda));
await tocar(p, 362, 650);
await esperar(p, 'Mapa');

await tocar(p, 944, 80);
await esperar(p, 'Coleccion');
await p.waitForTimeout(600);
await p.screenshot({ path: 'z-coleccion.png' });
await tocar(p, 80, 80);
await esperar(p, 'Mapa');

const d = new Date();
d.setDate(d.getDate() + 1);
const manana = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const q = await abrir(`${BASE}?fecha=${manana}`);
await tocar(q, 512, 600);
await esperar(q, 'Mapa');
await q.waitForTimeout(600);
console.log('7 mañana', JSON.stringify(await mapa(q)));
await tocar(q, 60, 705);
await esperar(q, 'Mapa');
await q.waitForTimeout(600);
await tocar(q, 60, 705);
await esperar(q, 'Mapa');
await q.waitForTimeout(600);
console.log('8 mañana en el patio', JSON.stringify(await mapa(q)));
await q.screenshot({ path: 'z-aviso.png' });

console.log('errores:', errores.length ? errores : 'ninguno');
await navegador.close();
```

Run: `node probar-zonas.mjs`
Expected:
- `1 inicio {"zona":"patio","aviso":{"izquierda":false,"derecha":false}}`
- `2 tras ▶ {"zona":"parque",…}`
- `3 capturas ["can-swim"]`
- `4 tras ▶ {"zona":"jugueteria",…}`
- `5 capturas ["can-swim","tengo-ball"]`
- `6 práctica` con 6 frases distintas *I have…*
- `7 mañana {"zona":"jugueteria","aviso":{"izquierda":true,"derecha":false}}`: recuerda la zona, y el repaso del Parque enciende la flecha izquierda.
- `8 mañana en el patio {"zona":"patio","aviso":{"izquierda":false,"derecha":true}}`
- `errores: ninguno`

Revisar las capturas de pantalla: `z-patio.png`, `z-parque.png` y `z-jugueteria.png` muestran su fondo, el camino y las flechas sin taparse con nada; `z-jugueteria-escucha.png` y `z-jugueteria-piano.png` muestran los círculos de color en tarjetas y teclas; `z-coleccion.png` muestra la Juguetería; `z-aviso.png` muestra el punto rojo en ▶. Detener el servidor de desarrollo al terminar.

- [ ] **Paso 10: commit**

```bash
git add juego-ingles/src
git commit -m "Mapa por zonas: fondos, flechas con aviso, colección y práctica de la zona

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Cierre: revisión final y publicación

Después de la revisión final del conjunto y sus correcciones:

1. `npx vitest run` y `npx vite build` sin errores.
2. Integrar la rama en `main` y hacer `git push`. El flujo de GitHub Pages publica solo.
3. Confirmar que la versión publicada incluye la Juguetería: `curl -s https://chalofster.github.io/tablao-de-palabras/` para obtener el nombre del archivo `assets/*.js` y buscar `teddy bear` en él.
