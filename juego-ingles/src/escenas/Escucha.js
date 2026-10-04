import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { buscarFrase } from '../logica/practica.js';
import { resolverFrase, opcionesEscucha } from '../logica/frase.js';
import { crearBoton, crearTarjeta } from './dibujo.js';

export class Escucha extends Phaser.Scene {
  constructor() {
    super('Escucha');
  }

  init(tarea) {
    this.tarea = tarea;
  }

  create() {
    const frase = resolverFrase(buscarFrase(this.tarea.id), sesion.ahora());
    const opciones = opcionesEscucha(frase);
    let errores = 0;
    let resuelta = false;

    crearBoton(this, 80, 80, '🏠', () => this.scene.start('Mapa'));
    crearBoton(this, ANCHO / 2, 130, '🔊', () => sesion.voz.hablar(frase.texto, { lento: errores > 0 }), 70);

    if (this.tarea.tipo === 'practica') {
      const avance = `${this.tarea.indice + 1} / ${this.tarea.ronda.length}`;
      this.add.text(ANCHO - 80, 80, avance, { fontSize: '40px', color: '#3d2b1f', fontStyle: 'bold' }).setOrigin(0.5);
    }

    const tarjetas = opciones.map((opcion, i) => {
      const tarjeta = crearTarjeta(this, 212 + i * 300, 450, opcion.imagen);
      tarjeta.setInteractive({ useHandCursor: true });
      tarjeta.on('pointerup', () => {
        if (resuelta) return;
        if (opcion.correcta) {
          resuelta = true;
          sesion.musica.melodia([64, 67, 71]);
          this.tweens.add({
            targets: tarjeta, scale: 1.2, duration: 250, yoyo: true,
            onComplete: () => this.scene.start('Piano', this.tarea),
          });
          return;
        }
        errores++;
        this.tweens.add({ targets: tarjeta, x: tarjeta.x + 12, duration: 60, yoyo: true, repeat: 3 });
        sesion.voz.hablar(frase.texto, { lento: true });
        if (errores === 2) {
          const correcta = tarjetas[opciones.findIndex((o) => o.correcta)];
          this.tweens.add({ targets: correcta, scale: 1.1, duration: 400, yoyo: true, repeat: -1 });
        }
      });
      return tarjeta;
    });

    this.time.delayedCall(400, () => sesion.voz.hablar(frase.texto));
  }
}
