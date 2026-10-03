import { describe, it, expect } from 'vitest';
import { claveDia, sumarDias, nombreDia, indiceDia } from '../src/logica/calendario.js';

describe('calendario', () => {
  it('formatea la clave del día en hora local', () => {
    expect(claveDia(new Date(2026, 9, 3, 23, 59))).toBe('2026-10-03');
    expect(claveDia(new Date(2026, 0, 5, 0, 1))).toBe('2026-01-05');
  });

  it('suma días cruzando fin de mes y de año', () => {
    expect(sumarDias('2026-10-03', 1)).toBe('2026-10-04');
    expect(sumarDias('2026-10-31', 1)).toBe('2026-11-01');
    expect(sumarDias('2026-12-30', 3)).toBe('2027-01-02');
  });

  it('nombra el día de hoy y el de mañana', () => {
    const sabado = new Date(2026, 9, 3, 12);
    expect(nombreDia(sabado)).toBe('Saturday');
    expect(nombreDia(sabado, 1)).toBe('Sunday');
  });

  it('da la vuelta de domingo a lunes', () => {
    const domingo = new Date(2026, 9, 4, 12);
    expect(nombreDia(domingo, 1)).toBe('Monday');
    expect(indiceDia(domingo, 1)).toBe(1);
    expect(indiceDia(domingo, 5)).toBe(5);
  });
});
