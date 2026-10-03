import { describe, it, expect } from 'vitest';
import { FRASES, ESCALA } from '../src/logica/contenido.js';

describe('contenido', () => {
  it('tiene 8 frases con identificador único', () => {
    expect(FRASES).toHaveLength(8);
    expect(new Set(FRASES.map((f) => f.id)).size).toBe(8);
  });

  it('cada frase tiene entre 3 y 5 bloques y cabe en la escala', () => {
    for (const f of FRASES) {
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
});
