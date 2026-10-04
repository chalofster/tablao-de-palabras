import { describe, it, expect } from 'vitest';
import { FRASES, ZONAS, PINTURAS } from '../src/logica/contenido.js';
import {
  resolverFrase, opcionesEscucha, teclasParaNivel, crearIntento, mezclar,
} from '../src/logica/frase.js';

const sabado = new Date(2026, 9, 3, 12);
const domingo = new Date(2026, 9, 4, 12);
const def = (id) => FRASES.find((f) => f.id === id);
const sinAzar = () => 0.999;

describe('resolverFrase', () => {
  it('arma el texto y asigna una nota a cada bloque', () => {
    const frase = resolverFrase(def('dosgatos'), sabado);
    expect(frase.texto).toBe('I see two cats');
    expect(frase.bloques.map((b) => b.texto)).toEqual(['I see', 'two', 'cats']);
    expect(frase.bloques.every((b) => Number.isInteger(b.nota))).toBe(true);
  });

  it('usa el día real en las frases de hoy y de mañana', () => {
    expect(resolverFrase(def('hoy'), sabado).texto).toBe('Today is Saturday');
    expect(resolverFrase(def('manana'), sabado).texto).toBe('Tomorrow is Sunday');
    expect(resolverFrase(def('manana'), domingo).texto).toBe('Tomorrow is Monday');
  });

  it('entrega imágenes de día con índice de la semana', () => {
    const frase = resolverFrase(def('manana'), domingo);
    expect(frase.imagen).toEqual({ tipo: 'dia', indice: 1 });
    expect(frase.otras).toEqual([{ tipo: 'dia', indice: 3 }, { tipo: 'dia', indice: 5 }]);
  });
});

describe('opcionesEscucha', () => {
  it('entrega tres opciones con exactamente una correcta', () => {
    const opciones = opcionesEscucha(resolverFrase(def('gato'), sabado));
    expect(opciones).toHaveLength(3);
    expect(opciones.filter((o) => o.correcta)).toHaveLength(1);
  });
});

describe('teclasParaNivel', () => {
  const frase = resolverFrase(def('gato'), sabado);

  it('en nivel 1 entrega los bloques en orden', () => {
    expect(teclasParaNivel(frase, 1)).toEqual(frase.bloques);
  });

  it('en nivel 2 entrega los mismos bloques, nunca en el orden correcto', () => {
    for (const azar of [sinAzar, () => 0, Math.random]) {
      const teclas = teclasParaNivel(frase, 2, azar);
      expect(teclas).toHaveLength(3);
      expect(new Set(teclas)).toEqual(new Set(frase.bloques));
      expect(teclas).not.toEqual(frase.bloques);
    }
  });

  it('en nivel 3 agrega el distractor', () => {
    const teclas = teclasParaNivel(frase, 3, sinAzar);
    expect(teclas).toHaveLength(4);
    expect(teclas.map((t) => t.texto)).toContain('cats');
    expect(teclas.slice(0, 3)).not.toEqual(frase.bloques);
  });
});

describe('mezclar', () => {
  it('no modifica la lista original', () => {
    const lista = [1, 2, 3];
    mezclar(lista, () => 0);
    expect(lista).toEqual([1, 2, 3]);
  });
});

describe('crearIntento', () => {
  const frase = resolverFrase(def('gato'), sabado);
  const [veo, un, gato] = frase.bloques;

  it('acepta los bloques en orden y avisa al completar', () => {
    const intento = crearIntento(frase);
    expect(intento.tocar(veo)).toEqual({ ok: true, completa: false });
    expect(intento.tocar(un)).toEqual({ ok: true, completa: false });
    expect(intento.tocar(gato)).toEqual({ ok: true, completa: true });
    expect(intento.erroresTotales).toBe(0);
  });

  it('rechaza un bloque fuera de orden y da la pista al segundo error seguido', () => {
    const intento = crearIntento(frase);
    expect(intento.tocar(gato)).toEqual({ ok: false, pista: null });
    expect(intento.tocar(un)).toEqual({ ok: false, pista: veo });
    expect(intento.erroresTotales).toBe(2);
  });

  it('reinicia la cuenta de errores seguidos tras un acierto', () => {
    const intento = crearIntento(frase);
    intento.tocar(gato);
    intento.tocar(veo);
    expect(intento.tocar(gato)).toEqual({ ok: false, pista: null });
  });

  it('rechaza el distractor', () => {
    const intento = crearIntento(frase);
    intento.tocar(veo);
    intento.tocar(un);
    expect(intento.tocar(frase.distractor).ok).toBe(false);
  });

  it('no falla ni avanza si se toca un bloque ya colocado o tras completar', () => {
    const intento = crearIntento(frase);
    intento.tocar(veo);
    expect(intento.tocar(veo).ok).toBe(false);
    intento.tocar(un);
    intento.tocar(gato);
    expect(intento.tocar(gato)).toEqual({ ok: false, pista: null });
  });
});

describe('frases con colores', () => {
  it('resolverFrase conserva el color de bloques, distractor e imagen', () => {
    const frase = resolverFrase(ZONAS[2].frases[0], domingo);
    expect(frase.texto).toBe('I have a red ball');
    expect(frase.bloques[2]).toMatchObject({ texto: 'red', color: PINTURAS.red });
    expect(frase.distractor).toMatchObject({ texto: 'blue', color: PINTURAS.blue, nota: null });
    expect(frase.imagen).toEqual({ tipo: 'color', color: PINTURAS.red, juguete: '🏐' });
  });
});
