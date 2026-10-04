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
