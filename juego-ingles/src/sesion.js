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
