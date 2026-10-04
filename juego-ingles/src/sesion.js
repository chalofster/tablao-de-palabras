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
