import { describe, it, expect } from 'vitest';
import { FRASES } from '../src/logica/contenido.js';
import { resolverFrase } from '../src/logica/frase.js';
import {
  ACCIONES, PRACTICA, buscarFrase, armarRonda, tareaPractica, siguienteTarea,
} from '../src/logica/practica.js';

describe('contenido de la práctica', () => {
  it('tiene las 9 acciones de la guía, cada una con can y can\'t', () => {
    expect(ACCIONES.map((a) => a.texto)).toEqual([
      'swim', 'ride a bike', 'run', 'dance', 'sing', 'jump', 'fly a kite', 'play soccer', 'skate',
    ]);
    expect(PRACTICA).toHaveLength(18);
    expect(new Set(PRACTICA.map((f) => f.id)).size).toBe(18);
  });

  it('arma las frases I can… y I can\'t…', () => {
    const textos = PRACTICA.map((f) => resolverFrase(f, new Date(2026, 9, 4)).texto);
    expect(textos).toContain('I can swim');
    expect(textos).toContain("I can't ride a bike");
  });

  it('el distractor es la palabra contraria: can frente a can\'t', () => {
    for (const f of PRACTICA) {
      const modal = f.bloques[1].texto;
      expect(f.distractor.texto).toBe(modal === 'can' ? "can't" : 'can');
    }
  });

  it('las imágenes alternativas son la misma acción al revés y otra acción', () => {
    for (const f of PRACTICA) {
      const todas = [f.imagen, ...f.otras].map((i) => i.valor);
      expect(new Set(todas).size).toBe(3);
      const accion = f.bloques[2].icono;
      expect(f.imagen.valor).toContain(accion);
      expect(f.otras[0].valor).toContain(accion);
      expect(f.otras[1].valor).not.toContain(accion);
    }
  });

  it('no repite identificadores de las criaturas del mapa', () => {
    const ids = new Set(FRASES.map((f) => f.id));
    expect(PRACTICA.some((f) => ids.has(f.id))).toBe(false);
  });
});

describe('buscarFrase', () => {
  it('encuentra frases del mapa y de la práctica', () => {
    expect(buscarFrase('gato').id).toBe('gato');
    expect(buscarFrase('can-swim').bloques[1].texto).toBe('can');
    expect(buscarFrase('cant-swim').bloques[1].texto).toBe("can't");
    expect(buscarFrase('nada')).toBeUndefined();
  });
});

describe('armarRonda', () => {
  it('entrega 6 frases de acciones distintas, mitad can y mitad can\'t', () => {
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
