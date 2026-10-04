import { describe, it, expect } from 'vitest';
import { ACCIONES, ZONAS } from '../src/logica/contenido.js';
import { resolverFrase } from '../src/logica/frase.js';
import { buscarZona } from '../src/logica/zonas.js';
import {
  PRACTICA_PARQUE, buscarFrase, armarRonda, tareaPractica, siguienteTarea,
} from '../src/logica/practica.js';

const textoDe = (def) => def.bloques.map((bloque) => bloque.texto).join(' ');

describe('contenido de la práctica', () => {
  it("el Parque practica las 9 acciones de la guía, cada una con can y can't", () => {
    expect(ACCIONES.map((a) => a.texto)).toEqual([
      'swim', 'ride a bike', 'run', 'dance', 'sing', 'jump', 'fly a kite', 'play soccer', 'skate',
    ]);
    expect(PRACTICA_PARQUE).toHaveLength(18);
    expect(new Set(PRACTICA_PARQUE.map((f) => f.id)).size).toBe(18);
  });

  it("arma las frases I can… y I can't…", () => {
    const textos = PRACTICA_PARQUE.map((f) => resolverFrase(f, new Date(2026, 9, 4)).texto);
    expect(textos).toContain('I can swim');
    expect(textos).toContain("I can't ride a bike");
  });

  it("el distractor es la palabra contraria: can frente a can't", () => {
    for (const f of PRACTICA_PARQUE) {
      const modal = f.bloques[1].texto;
      expect(f.distractor.texto).toBe(modal === 'can' ? "can't" : 'can');
    }
  });

  it('las imágenes alternativas son la misma acción al revés y otra acción', () => {
    for (const f of PRACTICA_PARQUE) {
      const todas = [f.imagen, ...f.otras].map((i) => i.valor);
      expect(new Set(todas).size).toBe(3);
      const accion = f.bloques[2].icono;
      expect(f.imagen.valor).toContain(accion);
      expect(f.otras[0].valor).toContain(accion);
      expect(f.otras[1].valor).not.toContain(accion);
    }
  });

  it('las criaturas del Parque son frases de su práctica', () => {
    for (const criatura of ZONAS[1].frases) {
      const practica = PRACTICA_PARQUE.find((f) => f.id === criatura.id);
      expect(practica).toBeDefined();
      expect(textoDe(practica)).toBe(textoDe(criatura));
    }
  });
});

describe('buscarFrase', () => {
  it('encuentra criaturas de todas las zonas y frases de práctica', () => {
    expect(buscarFrase('gato').id).toBe('gato');
    expect(buscarFrase('can-swim').criatura.nombre).toBe('Burbuja');
    expect(buscarFrase('cant-swim').bloques[1].texto).toBe("can't");
    expect(buscarFrase('tengo-ball').bloques[2].texto).toBe('red');
    expect(buscarFrase('nada')).toBeUndefined();
  });
});

describe('armarRonda', () => {
  it("entrega 6 frases de acciones distintas, mitad can y mitad can't", () => {
    for (let vuelta = 0; vuelta < 50; vuelta++) {
      const ronda = armarRonda('parque');
      expect(ronda).toHaveLength(6);
      expect(new Set(ronda.map((id) => id.split('-')[1])).size).toBe(6);
      expect(ronda.filter((id) => id.startsWith('can-'))).toHaveLength(3);
      expect(ronda.filter((id) => id.startsWith('cant-'))).toHaveLength(3);
      for (const id of ronda) expect(buscarFrase(id)).toBeDefined();
    }
  });

  it('con el tiempo usa las 9 acciones', () => {
    const vistas = new Set();
    for (let vuelta = 0; vuelta < 200; vuelta++) armarRonda('parque').forEach((id) => vistas.add(id.split('-')[1]));
    expect(vistas.size).toBe(9);
  });
});

describe('armarRonda en el Patio y la Juguetería', () => {
  const domingo = new Date(2026, 9, 4, 12);

  for (const zona of ['patio', 'jugueteria']) {
    it(`en ${zona} entrega 6 frases distintas de esa zona, todas resolubles`, () => {
      const ids = new Set(buscarZona(zona).frases.map((f) => f.id));
      for (let vuelta = 0; vuelta < 30; vuelta++) {
        const ronda = armarRonda(zona);
        expect(ronda).toHaveLength(6);
        expect(new Set(ronda).size).toBe(6);
        for (const id of ronda) {
          expect(ids.has(id)).toBe(true);
          expect(resolverFrase(buscarFrase(id), domingo).texto.length).toBeGreaterThan(0);
        }
      }
    });
  }

  it('las frases de día de la práctica del Patio usan la fecha real', () => {
    expect(resolverFrase(buscarFrase('hoy'), domingo).texto).toBe('Today is Sunday');
  });

  it('con una zona desconocida practica el Patio', () => {
    const ids = new Set(ZONAS[0].frases.map((f) => f.id));
    expect(armarRonda('castillo').every((id) => ids.has(id))).toBe(true);
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
