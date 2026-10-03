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
