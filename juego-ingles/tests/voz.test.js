import { describe, it, expect, vi, afterEach } from 'vitest';
import { crearVoz } from '../src/servicios/voz.js';

class EnunciadoFalso {
  constructor(texto) { this.text = texto; }
}

function synthFalso({ voces = [], alHablar = () => {} } = {}) {
  return {
    dichos: [],
    cancelados: 0,
    getVoices: () => voces,
    cancel() { this.cancelados++; },
    speak(enunciado) { this.dichos.push(enunciado); alHablar(enunciado); },
  };
}

afterEach(() => vi.useRealTimers());

describe('crearVoz', () => {
  it('habla en inglés de Estados Unidos y resuelve true al terminar', async () => {
    const synth = synthFalso({ alHablar: (e) => e.onend() });
    const voz = crearVoz(synth, EnunciadoFalso);
    await expect(voz.hablar('I see a cat')).resolves.toBe(true);
    expect(synth.dichos[0].text).toBe('I see a cat');
    expect(synth.dichos[0].lang).toBe('en-US');
    expect(synth.cancelados).toBe(1);
  });

  it('habla más lento cuando se pide', async () => {
    const synth = synthFalso({ alHablar: (e) => e.onend() });
    const voz = crearVoz(synth, EnunciadoFalso);
    await voz.hablar('cat');
    await voz.hablar('cat', { lento: true });
    expect(synth.dichos[1].rate).toBeLessThan(synth.dichos[0].rate);
  });

  it('prefiere una voz en-US y, si no hay, otra en inglés', async () => {
    const britanica = { lang: 'en-GB', name: 'Daniel' };
    const gringa = { lang: 'en-US', name: 'Samantha' };
    const espanola = { lang: 'es-ES', name: 'Mónica' };
    const conUS = synthFalso({ voces: [espanola, britanica, gringa], alHablar: (e) => e.onend() });
    await crearVoz(conUS, EnunciadoFalso).hablar('cat');
    expect(conUS.dichos[0].voice).toBe(gringa);
    const sinUS = synthFalso({ voces: [espanola, britanica], alHablar: (e) => e.onend() });
    await crearVoz(sinUS, EnunciadoFalso).hablar('cat');
    expect(sinUS.dichos[0].voice).toBe(britanica);
  });

  it('resuelve false si la voz falla', async () => {
    const synth = synthFalso({ alHablar: (e) => e.onerror() });
    await expect(crearVoz(synth, EnunciadoFalso).hablar('cat')).resolves.toBe(false);
  });

  it('resuelve false por tiempo límite si la voz nunca avisa que terminó', async () => {
    vi.useFakeTimers();
    const voz = crearVoz(synthFalso(), EnunciadoFalso);
    const promesa = voz.hablar('I see a cat');
    await vi.advanceTimersByTimeAsync(10000);
    await expect(promesa).resolves.toBe(false);
  });

  it('resuelve false sin fallar si el navegador no tiene voz', async () => {
    const voz = crearVoz(undefined, undefined);
    expect(voz.disponible).toBe(false);
    await expect(voz.hablar('cat')).resolves.toBe(false);
  });

  it('resuelve false si speak lanza un error', async () => {
    const synth = synthFalso({ alHablar: () => { throw new Error('no permitido'); } });
    await expect(crearVoz(synth, EnunciadoFalso).hablar('cat')).resolves.toBe(false);
  });
});
