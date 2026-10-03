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
