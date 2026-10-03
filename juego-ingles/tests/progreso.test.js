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
