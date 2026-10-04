import { ANCHO, ALTO } from '../constantes.js';
import { COLORES } from './dibujo.js';

const Y_PISO = 560;

function patio(escena) {
  const g = escena.add.graphics();
  g.fillStyle(COLORES.crema);
  g.fillRect(0, 0, ANCHO, Y_PISO);
  g.fillStyle(0xe9c46a);
  g.fillRect(0, Y_PISO, ANCHO, ALTO - Y_PISO);
  g.fillStyle(0xf1dca7);
  for (let i = 0; i < 4; i++) {
    const x = 128 + i * 256;
    g.fillRect(x - 70, 150, 140, 410);
    g.fillCircle(x, 150, 70);
  }
  for (let i = 0; i < 5; i++) {
    g.fillStyle(0xbc6c25);
    g.fillRect(i * 256 - 22, 520, 44, 40);
    g.fillStyle(COLORES.rojo);
    g.fillCircle(i * 256, 505, 20);
  }
}

// Colores suaves: las criaturas grises por capturar tienen que distinguirse.
function parque(escena) {
  const g = escena.add.graphics();
  g.fillStyle(0xcaf0f8);
  g.fillRect(0, 0, ANCHO, Y_PISO);
  g.fillStyle(0x95d5b2);
  g.fillRect(0, Y_PISO, ANCHO, ALTO - Y_PISO);
  g.fillStyle(0xffd166);
  g.fillCircle(110, 100, 55);
  for (let i = 0; i < 4; i++) {
    const x = 128 + i * 256;
    g.fillStyle(0xc9a27e);
    g.fillRect(x - 16, 400, 32, 160);
    g.fillStyle(0xb7e4c7);
    g.fillCircle(x, 360, 85);
    g.fillCircle(x - 60, 410, 55);
    g.fillCircle(x + 60, 410, 55);
  }
}

// Estantes con juguetes sencillos; terminan antes de los botones de la derecha.
function jugueteria(escena) {
  const g = escena.add.graphics();
  g.fillStyle(0xffe5ec);
  g.fillRect(0, 0, ANCHO, Y_PISO);
  g.fillStyle(0xdda15e);
  g.fillRect(0, Y_PISO, ANCHO, ALTO - Y_PISO);
  const colores = [0xe63946, 0x3a86ff, 0xffd60a, 0x38b000, 0xff70a6, 0x8338ec];
  for (const y of [170, 290]) {
    g.fillStyle(0xbc6c25);
    g.fillRect(40, y, ANCHO - 200, 16);
    for (let i = 0; i < 12; i++) {
      g.fillStyle(colores[i % colores.length], 0.45);
      if (i % 2 === 0) g.fillCircle(80 + i * 62, y - 24, 22);
      else g.fillRect(58 + i * 62, y - 46, 44, 46);
    }
  }
}

const FONDOS = { patio, parque, jugueteria };

export function dibujarFondo(escena, zonaId) {
  FONDOS[zonaId](escena);
}
