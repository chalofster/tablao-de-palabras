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
