import { describe, it, expect } from 'vitest';
import { FRASES, ZONAS, ESCALA, PINTURAS } from '../src/logica/contenido.js';

const textoDe = (def) => def.bloques.map((bloque) => bloque.texto).join(' ');

describe('contenido', () => {
  it('tiene tres zonas: Patio con 8 criaturas, Parque con 9 y Juguetería con 8', () => {
    expect(ZONAS.map((z) => [z.id, z.frases.length])).toEqual([
      ['patio', 8], ['parque', 9], ['jugueteria', 8],
    ]);
    expect(FRASES).toHaveLength(25);
  });

  it('los identificadores son únicos en todo el juego', () => {
    expect(new Set(FRASES.map((f) => f.id)).size).toBe(FRASES.length);
  });

  it('el Patio conserva sus criaturas y su orden', () => {
    expect(ZONAS[0].frases.map((f) => f.id)).toEqual([
      'gato', 'perro', 'dosgatos', 'trespajaros', 'megustanperros', 'gatosyperros', 'hoy', 'manana',
    ]);
  });

  it('cada frase tiene criatura, entre 3 y 5 bloques y cabe en la escala', () => {
    for (const f of FRASES) {
      expect(f.criatura.nombre.length).toBeGreaterThan(0);
      expect(Number.isInteger(f.criatura.color)).toBe(true);
      expect(f.bloques.length).toBeGreaterThanOrEqual(3);
      expect(f.bloques.length).toBeLessThanOrEqual(5);
      expect(f.bloques.length).toBeLessThanOrEqual(ESCALA.length);
    }
  });

  it('cada frase tiene dos imágenes alternativas distintas de la correcta', () => {
    for (const f of FRASES) {
      const todas = [f.imagen, ...f.otras].map((i) => JSON.stringify(i));
      expect(f.otras).toHaveLength(2);
      expect(new Set(todas).size).toBe(3);
    }
  });

  it('ningún bloque ni distractor se repite dentro de una frase', () => {
    for (const f of FRASES) {
      const textos = [...f.bloques, f.distractor].map((b) => JSON.stringify(b));
      expect(new Set(textos).size).toBe(textos.length);
    }
  });

  it("el Parque alterna I can y I can't con las 9 acciones de la guía", () => {
    expect(ZONAS[1].frases.map(textoDe)).toEqual([
      'I can swim', "I can't ride a bike", 'I can run', "I can't fly a kite", 'I can dance',
      "I can't play soccer", 'I can sing', "I can't skate", 'I can jump',
    ]);
  });

  it('la Juguetería usa I have, el artículo correcto, un color pintado y un juguete', () => {
    expect(ZONAS[2].frases.map(textoDe)).toEqual([
      'I have a red ball', 'I have a blue car', 'I have a yellow duck', 'I have a green kite',
      'I have a pink doll', 'I have a brown teddy bear', 'I have an orange robot', 'I have a purple bike',
    ]);
    for (const f of ZONAS[2].frases) {
      const [, , pintura, juguete] = f.bloques;
      expect(pintura.color).toBe(PINTURAS[pintura.texto]);
      expect(f.distractor.color).toBe(PINTURAS[f.distractor.texto]);
      expect(f.distractor.texto).not.toBe(pintura.texto);
      expect(f.imagen).toEqual({ tipo: 'color', color: pintura.color, juguete: juguete.icono });
      expect(f.criatura.color).toBe(pintura.color);
    }
  });
});
