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
