import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { FRASES } from '../logica/contenido.js';
import { resolverFrase } from '../logica/frase.js';
import { crearBoton, crearTarjeta } from './dibujo.js';

// El juego invita a repetir la frase en voz alta. No escucha ni califica.
export class Voz extends Phaser.Scene {
  constructor() {
    super('Voz');
  }

  init(tarea) {
    this.tarea = tarea;
  }

  create() {
    const frase = resolverFrase(FRASES.find((f) => f.id === this.tarea.id), sesion.ahora());
    crearTarjeta(this, ANCHO / 2, 230, frase.imagen, 280, 280);
    const boca = this.add.text(ANCHO / 2, 470, '🗣️', { fontSize: '96px' }).setOrigin(0.5).setAlpha(0.3);
    const seguir = crearBoton(this, ANCHO / 2 + 150, 650, '✅', () => this.scene.start('Captura', this.tarea), 70);
    seguir.setVisible(false);

    // Marca de esta vuelta de la escena, para ignorar avisos atrasados de una anterior.
    const corrida = {};
    this.corrida = corrida;
    const invitar = async () => {
      await sesion.voz.hablar(frase.texto, { lento: true });
      if (this.corrida !== corrida || !this.scene.isActive()) return;
      boca.setAlpha(1);
      this.tweens.add({ targets: boca, scale: 1.25, duration: 450, yoyo: true, repeat: 3 });
      this.time.delayedCall(2500, () => seguir.setVisible(true));
    };

    crearBoton(this, ANCHO / 2 - 150, 650, '🔊', invitar, 70);
    invitar();
  }
}
