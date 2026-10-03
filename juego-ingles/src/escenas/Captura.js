import Phaser from 'phaser';
import { sesion } from '../sesion.js';
import { FRASES } from '../logica/contenido.js';
import { UMBRAL_FALLO } from '../logica/frase.js';
import { claveDia } from '../logica/calendario.js';
import { registrarExito, registrarFallo } from '../logica/progreso.js';
import { crearBailarina, crearCriatura } from './dibujo.js';

export class Captura extends Phaser.Scene {
  constructor() {
    super('Captura');
  }

  init(tarea) {
    this.tarea = tarea;
  }

  create() {
    const def = FRASES.find((f) => f.id === this.tarea.id);
    const hoy = claveDia(sesion.ahora());
    // La captura nunca falla. Un repaso con muchos errores vuelve mañana, sin castigo visible.
    const logrado = this.tarea.tipo === 'captura' || this.tarea.errores < UMBRAL_FALLO;
    sesion.guardarEstado(
      logrado ? registrarExito(sesion.estado, def.id, hoy) : registrarFallo(sesion.estado, def.id, hoy),
    );

    const bailarina = crearBailarina(this, 300, 410, 1.6);
    const criatura = crearCriatura(this, 660, 380, def.criatura, { escala: 0.1 });
    this.tweens.add({ targets: criatura, scale: 1.6, duration: 600, ease: 'Back.easeOut' });

    if (logrado) {
      bailarina.pose('celebracion');
      sesion.musica.melodia([64, 67, 71, 76]);
      const estrellas = '⭐'.repeat(sesion.estado.criaturas[def.id].nivel);
      this.add.text(660, 560, estrellas, { fontSize: '56px' }).setOrigin(0.5);
    } else {
      bailarina.pose('paso');
      this.add.text(660, 560, '💤', { fontSize: '56px' }).setOrigin(0.5);
    }

    const volver = () => this.scene.start('Mapa');
    this.time.delayedCall(1200, () => this.input.once('pointerup', volver));
    this.time.delayedCall(5000, volver);
  }
}
