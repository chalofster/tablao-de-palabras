import { describe, it, expect } from 'vitest';
import { distanciaAlPulso, crearMusica } from '../src/servicios/musica.js';

describe('distanciaAlPulso', () => {
  it('es cero justo en el pulso', () => {
    expect(distanciaAlPulso(2, 0, 0.5)).toBeCloseTo(0);
  });

  it('mide hacia el pulso más cercano, antes o después', () => {
    expect(distanciaAlPulso(1.1, 0, 0.5)).toBeCloseTo(0.1);
    expect(distanciaAlPulso(1.4, 0, 0.5)).toBeCloseTo(0.1);
  });

  it('funciona antes del primer pulso', () => {
    expect(distanciaAlPulso(0.9, 1, 0.5)).toBeCloseTo(0.1);
  });
});

describe('crearMusica sin Web Audio', () => {
  it('entrega un objeto inofensivo', () => {
    const musica = crearMusica(null);
    musica.reanudar();
    musica.nota(64);
    musica.melodia([64, 65]);
    musica.iniciarCompas();
    musica.detenerCompas();
    expect(musica.enTiempo()).toBe(false);
  });
});
