import { describe, it, expect } from 'vitest';
import { estadoInicial, registrarExito } from '../src/logica/progreso.js';
import { disponibles } from '../src/logica/repaso.js';

describe('disponibles', () => {
  it('en el primer uso ofrece capturar la primera criatura', () => {
    expect(disponibles(estadoInicial(), '2026-10-03')).toEqual([
      { id: 'gato', nivel: 1, tipo: 'captura' },
    ]);
  });

  it('el mismo día de la captura ofrece solo la siguiente criatura', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(disponibles(estado, '2026-10-03')).toEqual([
      { id: 'perro', nivel: 1, tipo: 'captura' },
    ]);
  });

  it('al día siguiente ofrece el repaso de nivel 2 además de la captura', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(disponibles(estado, '2026-10-04')).toEqual([
      { id: 'gato', nivel: 2, tipo: 'repaso' },
      { id: 'perro', nivel: 1, tipo: 'captura' },
    ]);
  });

  it('un repaso atrasado sigue disponible', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(disponibles(estado, '2026-11-20')[0]).toEqual({ id: 'gato', nivel: 2, tipo: 'repaso' });
  });

  it('si la fecha del dispositivo retrocede, el repaso espera sin fallar', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(disponibles(estado, '2026-09-01')).toEqual([
      { id: 'perro', nivel: 1, tipo: 'captura' },
    ]);
  });

  it('una criatura dominada no vuelve a repaso', () => {
    let estado = estadoInicial();
    for (const dia of ['2026-10-03', '2026-10-04', '2026-10-07']) {
      estado = registrarExito(estado, 'gato', dia);
    }
    expect(disponibles(estado, '2027-01-01').some((d) => d.id === 'gato')).toBe(false);
  });

  it('ignora criaturas guardadas que ya no existen en el contenido', () => {
    const estado = { version: 1, criaturas: { fantasma: { nivel: 1, proximoRepaso: '2026-10-01' } } };
    expect(disponibles(estado, '2026-10-03')).toEqual([
      { id: 'gato', nivel: 1, tipo: 'captura' },
    ]);
  });

  it('con todo capturado y sin repasos pendientes no ofrece nada', () => {
    const frases = [{ id: 'a' }];
    const estado = registrarExito(estadoInicial(), 'a', '2026-10-03');
    expect(disponibles(estado, '2026-10-03', frases)).toEqual([]);
  });
});
