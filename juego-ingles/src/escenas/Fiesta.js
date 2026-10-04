import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { armarRonda, tareaPractica } from '../logica/practica.js';
import { crearBailarina, crearBoton } from './dibujo.js';

// Fin de una ronda de práctica: celebrar y ofrecer otra ronda o volver al mapa.
export class Fiesta extends Phaser.Scene {
  constructor() {
    super('Fiesta');
  }

  create() {
    crearBailarina(this, ANCHO / 2, 330, 1.7).pose('celebracion');
    sesion.musica.melodia([64, 67, 71, 76]);
    this.add.text(ANCHO / 2, 80, '⭐⭐⭐', { fontSize: '72px' }).setOrigin(0.5);
    crearBoton(this, ANCHO / 2 - 150, 650, '🏠', () => this.scene.start('Mapa'), 70);
    crearBoton(this, ANCHO / 2 + 150, 650, '🔁', () => this.scene.start('Escucha', tareaPractica(armarRonda(sesion.zona), 0)), 70);
  }
}
