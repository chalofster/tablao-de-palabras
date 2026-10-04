import Phaser from 'phaser';
import { sesion } from '../sesion.js';
import { buscarZona } from '../logica/zonas.js';
import { resolverFrase } from '../logica/frase.js';
import { crearBoton, crearCriatura } from './dibujo.js';

export class Coleccion extends Phaser.Scene {
  constructor() {
    super('Coleccion');
  }

  create() {
    const fecha = sesion.ahora();
    crearBoton(this, 80, 80, '🏠', () => this.scene.start('Mapa'));
    // Cinco columnas: las 9 criaturas del Parque caben en dos filas.
    buscarZona(sesion.zona).frases.forEach((def, i) => {
      const x = 140 + (i % 5) * 186;
      const y = 270 + Math.floor(i / 5) * 260;
      const guardada = sesion.estado.criaturas[def.id];
      const criatura = crearCriatura(this, x, y, def.criatura, { silueta: !guardada });
      if (!guardada) return;
      this.add.text(x, y + 82, '⭐'.repeat(guardada.nivel), { fontSize: '28px' }).setOrigin(0.5);
      criatura.setSize(150, 150).setInteractive({ useHandCursor: true });
      criatura.on('pointerup', () => {
        sesion.voz.hablar(resolverFrase(def, fecha).texto);
        this.tweens.add({ targets: criatura, y: y - 25, duration: 180, yoyo: true });
      });
    });
  }
}
