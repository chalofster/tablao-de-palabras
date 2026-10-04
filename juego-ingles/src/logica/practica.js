import { FRASES } from './contenido.js';
import { mezclar } from './frase.js';

// Práctica libre de "I can / I can't": sin criaturas, sin esperas y sin guardar progreso.
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

const MODALES = {
  can: { texto: 'can', icono: '🙂' },
  cant: { texto: "can't", icono: '🙁' },
};

const emoji = (modal, accion) => ({ tipo: 'emoji', valor: MODALES[modal].icono + accion.icono });

export const PRACTICA = ACCIONES.flatMap((accion, i) => {
  const otra = ACCIONES[(i + 1) % ACCIONES.length];
  return ['can', 'cant'].map((modal) => {
    const contrario = modal === 'can' ? 'cant' : 'can';
    return {
      id: `${modal}-${accion.id}`,
      bloques: [{ texto: 'I', icono: '🙋' }, MODALES[modal], { texto: accion.texto, icono: accion.icono }],
      imagen: emoji(modal, accion),
      otras: [emoji(contrario, accion), emoji(modal, otra)],
      distractor: MODALES[contrario],
    };
  });
});

export function buscarFrase(id) {
  return FRASES.find((f) => f.id === id) ?? PRACTICA.find((f) => f.id === id);
}

export function armarRonda(azar = Math.random, cantidad = 6) {
  const acciones = mezclar(ACCIONES, azar).slice(0, cantidad);
  const modales = mezclar(acciones.map((_, i) => (i % 2 === 0 ? 'can' : 'cant')), azar);
  return acciones.map((accion, i) => `${modales[i]}-${accion.id}`);
}

// Nivel 3: todas las teclas a la vista más el distractor, para elegir entre can y can't.
export function tareaPractica(ronda, indice) {
  return { id: ronda[indice], nivel: 3, tipo: 'practica', ronda, indice };
}

export function siguienteTarea(tarea) {
  const indice = tarea.indice + 1;
  return indice < tarea.ronda.length ? tareaPractica(tarea.ronda, indice) : null;
}
