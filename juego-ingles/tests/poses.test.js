import { describe, it, expect } from 'vitest';
import { BRAZOS, espejo, puntaDelBrazo } from '../src/escenas/poses.js';

const IZQ = -1;
const DER = 1;
const manos = (postura) => [puntaDelBrazo(IZQ, postura).mano, puntaDelBrazo(DER, postura).mano];
const distancia = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

describe('puntaDelBrazo', () => {
  it('con el brazo colgando, la mano queda bajo el hombro', () => {
    const { codo, mano } = puntaDelBrazo(IZQ, { hombro: 0, codo: 0 });
    expect(codo.x).toBeCloseTo(-18);
    expect(mano.x).toBeCloseTo(-18);
    expect(mano.y).toBeGreaterThan(codo.y);
  });

  it('el brazo derecho es el espejo del izquierdo', () => {
    for (const postura of Object.values(BRAZOS)) {
      const [izq, der] = manos(postura);
      expect(der.x).toBeCloseTo(-izq.x);
      expect(der.y).toBeCloseTo(izq.y);
    }
  });
});

describe('posturas de los brazos', () => {
  it('jarras: cada mano en su cadera', () => {
    const [izq, der] = manos(BRAZOS.jarras);
    expect(izq.x).toBeLessThan(-8);
    expect(izq.x).toBeGreaterThan(-22);
    expect(Math.abs(izq.y + 6)).toBeLessThan(10);
    expect(der.x).toBeGreaterThan(8);
  });

  it('arriba: la mano queda sobre la cabeza, cerca del centro', () => {
    const [izq] = manos(BRAZOS.arriba);
    expect(izq.y).toBeLessThan(-88);
    expect(Math.abs(izq.x)).toBeLessThan(30);
  });

  it('v: brazos abiertos hacia arriba', () => {
    const [izq] = manos(BRAZOS.v);
    expect(izq.y).toBeLessThan(-80);
    expect(Math.abs(izq.x)).toBeGreaterThan(30);
  });

  it('palmas juntas: las manos se tocan frente al pecho', () => {
    const [izq, der] = manos(BRAZOS.palmasJuntas);
    expect(distancia(izq, der)).toBeLessThan(6);
    expect(izq.y).toBeGreaterThan(-40);
    expect(izq.y).toBeLessThan(-20);
  });

  it('palmas abiertas: las manos se separan', () => {
    const [izq, der] = manos(BRAZOS.palmasAbiertas);
    expect(distancia(izq, der)).toBeGreaterThan(30);
  });

  it('espejo invierte ambos ángulos', () => {
    expect(espejo({ hombro: 40, codo: -90 })).toEqual({ hombro: -40, codo: 90 });
  });
});
