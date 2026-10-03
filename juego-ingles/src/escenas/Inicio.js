import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { crearMusica } from '../servicios/musica.js';
import { crearVoz } from '../servicios/voz.js';
import { crearBailarina, crearBoton } from './dibujo.js';

export class Inicio extends Phaser.Scene {
  constructor() {
    super('Inicio');
  }

  create() {
    const bailarina = crearBailarina(this, ANCHO / 2, 235, 1.7);
    // Mientras espera el primer toque, la bailarina baila sola.
    let compas = 0;
    this.time.addEvent({
      delay: 1400, loop: true,
      callback: () => bailarina.pose(['paso', 'paso', 'giro', 'paso', 'paso', 'celebracion'][compas++ % 6]),
    });
    this.add.text(ANCHO / 2, 450, '🔊', { fontSize: '48px' }).setOrigin(0.5);
    const boton = crearBoton(this, ANCHO / 2, 600, '▶️', () => {}, 90);
    this.tweens.add({ targets: boton, scale: 1.08, duration: 600, yoyo: true, repeat: -1 });

    // iOS solo habilita audio y voz dentro de un toque real del usuario,
    // por eso se usa el evento del navegador y no el de Phaser.
    const activar = () => {
      sesion.musica = crearMusica();
      sesion.voz = crearVoz();
      sesion.musica.reanudar();
      sesion.musica.melodia([64, 65, 67, 69]);
      sesion.voz.hablar('Hello!');
      this.scene.start('Mapa');
    };
    this.game.canvas.addEventListener('click', activar, { once: true });
  }
}
