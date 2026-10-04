import { describe, it, expect } from 'vitest';
import { ZONAS } from '../src/logica/contenido.js';
import { estadoInicial, registrarExito } from '../src/logica/progreso.js';
import {
  buscarZona, zonaValida, vecina, tareasDeZona, avisos, paradas,
} from '../src/logica/zonas.js';

const hoy = '2026-10-10';

describe('buscarZona y zonaValida', () => {
  it('encuentra cada zona por su id', () => {
    expect(buscarZona('parque')).toBe(ZONAS[1]);
    expect(zonaValida('jugueteria')).toBe('jugueteria');
  });

  it('con un valor guardado inválido abre el Patio', () => {
    for (const valor of [null, undefined, '', 'castillo', '{"zona":1}']) {
      expect(buscarZona(valor)).toBe(ZONAS[0]);
      expect(zonaValida(valor)).toBe('patio');
    }
  });
});

describe('vecina', () => {
  it('da la zona de cada lado y null en los extremos', () => {
    expect(vecina('patio', -1)).toBeNull();
    expect(vecina('patio', 1)).toBe('parque');
    expect(vecina('parque', -1)).toBe('patio');
    expect(vecina('parque', 1)).toBe('jugueteria');
    expect(vecina('jugueteria', 1)).toBeNull();
  });
});

describe('tareasDeZona', () => {
  it('cada zona nueva ofrece capturar su primera criatura', () => {
    expect(tareasDeZona(estadoInicial(), hoy, 'parque')).toEqual([{ id: 'can-swim', nivel: 1, tipo: 'captura' }]);
    expect(tareasDeZona(estadoInicial(), hoy, 'jugueteria')).toEqual([{ id: 'tengo-ball', nivel: 1, tipo: 'captura' }]);
  });

  it('el progreso guardado del Patio se conserva y no bloquea las zonas nuevas', () => {
    const dominado = {
      version: 1,
      criaturas: Object.fromEntries(ZONAS[0].frases.map((f) => [f.id, { nivel: 3, proximoRepaso: null }])),
    };
    expect(tareasDeZona(dominado, hoy, 'patio')).toEqual([]);
    expect(tareasDeZona(dominado, hoy, 'parque')).toEqual([{ id: 'can-swim', nivel: 1, tipo: 'captura' }]);
  });

  it('un repaso del Patio no aparece en el Parque', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(tareasDeZona(estado, hoy, 'patio')[0]).toEqual({ id: 'gato', nivel: 2, tipo: 'repaso' });
    expect(tareasDeZona(estado, hoy, 'parque').some((t) => t.id === 'gato')).toBe(false);
  });
});

describe('avisos', () => {
  it('sin repasos pendientes no hay avisos, aunque haya capturas nuevas', () => {
    for (const zona of ['patio', 'parque', 'jugueteria']) {
      expect(avisos(estadoInicial(), hoy, zona)).toEqual({ izquierda: false, derecha: false });
    }
  });

  it('un repaso en la zona actual no enciende ninguna flecha', () => {
    const estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(avisos(estado, hoy, 'patio')).toEqual({ izquierda: false, derecha: false });
  });

  it('avisa hacia el lado donde hay repasos, aunque sea una zona más allá', () => {
    let estado = registrarExito(estadoInicial(), 'gato', '2026-10-03');
    expect(avisos(estado, hoy, 'parque')).toEqual({ izquierda: true, derecha: false });
    expect(avisos(estado, hoy, 'jugueteria')).toEqual({ izquierda: true, derecha: false });
    estado = registrarExito(estado, 'tengo-ball', '2026-10-03');
    expect(avisos(estado, hoy, 'parque')).toEqual({ izquierda: true, derecha: true });
  });

  it('un repaso que todavía no vence no avisa', () => {
    const estado = registrarExito(estadoInicial(), 'tengo-ball', hoy);
    expect(avisos(estado, hoy, 'patio')).toEqual({ izquierda: false, derecha: false });
  });
});

describe('paradas', () => {
  for (const cantidad of [8, 9]) {
    it(`con ${cantidad} criaturas caben en pantalla sin chocar`, () => {
      const lista = paradas(cantidad);
      expect(lista).toHaveLength(cantidad);
      expect(lista[0].x).toBe(150);
      expect(lista[cantidad - 1].x).toBe(874);
      lista.forEach((parada, i) => {
        // Entre las flechas del suelo (x 5–115 y 909–1019) y bajo los botones de la derecha (hasta y 265).
        expect(parada.x).toBeGreaterThanOrEqual(150);
        expect(parada.x).toBeLessThanOrEqual(874);
        expect(parada.y).toBe(i % 2 === 0 ? 470 : 330);
        if (i > 0) expect(parada.x - lista[i - 1].x).toBeGreaterThanOrEqual(90);
      });
    });
  }
});
