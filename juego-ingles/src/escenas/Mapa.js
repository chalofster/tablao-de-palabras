import Phaser from 'phaser';
import { ANCHO, ALTO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { FRASES } from '../logica/contenido.js';
import { claveDia } from '../logica/calendario.js';
import { disponibles } from '../logica/repaso.js';
import { armarRonda, tareaPractica } from '../logica/practica.js';
import { COLORES, crearBailarina, crearBoton, crearCriatura } from './dibujo.js';

const PARADAS = FRASES.map((_, i) => ({ x: 130 + i * 110, y: i % 2 === 0 ? 470 : 330 }));
const Y_SUELO = 640;

export class Mapa extends Phaser.Scene {
  constructor() {
    super('Mapa');
  }

  create() {
    this.ocupada = false;
    this.dibujarPatio();

    const camino = this.add.graphics().lineStyle(14, COLORES.oro, 1);
    PARADAS.forEach((parada, i) => {
      if (i > 0) camino.lineBetween(PARADAS[i - 1].x, PARADAS[i - 1].y, parada.x, parada.y);
    });

    const tareas = disponibles(sesion.estado, claveDia(sesion.ahora()));
    const capturadas = FRASES.filter((f) => sesion.estado.criaturas[f.id]).length;
    const partida = PARADAS[Math.max(0, capturadas - 1)];

    FRASES.forEach((frase, i) => {
      const parada = PARADAS[i];
      const guardada = sesion.estado.criaturas[frase.id];
      const tarea = tareas.find((t) => t.id === frase.id);
      const criatura = crearCriatura(this, parada.x, parada.y, frase.criatura, {
        silueta: !guardada, escala: 0.75,
      });
      if (guardada) {
        this.add.text(parada.x, parada.y + 62, '⭐'.repeat(guardada.nivel), { fontSize: '22px' }).setOrigin(0.5);
      }
      if (guardada && !tarea && guardada.nivel < 3) {
        this.add.text(parada.x + 42, parada.y - 50, '💤', { fontSize: '28px' }).setOrigin(0.5);
      }
      if (tarea) {
        this.tweens.add({ targets: criatura, scale: 0.9, duration: 500, yoyo: true, repeat: -1 });
        criatura.setSize(150, 150).setInteractive({ useHandCursor: true });
        criatura.on('pointerup', () => this.irA(parada, tarea));
      }
    });

    // La bailarina camina por el suelo, bajo las paradas, para no tapar a las criaturas.
    this.bailarina = crearBailarina(this, partida.x, Y_SUELO, 0.8);
    crearBoton(this, ANCHO - 80, 80, '📖', () => this.scene.start('Coleccion'));
    crearBoton(this, ANCHO - 80, 210, '🤸', () => this.scene.start('Escucha', tareaPractica(armarRonda(), 0)));
    if (tareas.length === 0) this.bailarina.pose('celebracion');
  }

  irA(parada, tarea) {
    if (this.ocupada) return;
    this.ocupada = true;
    this.bailarina.pose('caminar');
    this.tweens.add({
      targets: this.bailarina, x: parada.x, duration: 600,
      onComplete: () => this.scene.start('Escucha', tarea),
    });
  }

  dibujarPatio() {
    const g = this.add.graphics();
    g.fillStyle(COLORES.crema);
    g.fillRect(0, 0, ANCHO, 560);
    g.fillStyle(0xe9c46a);
    g.fillRect(0, 560, ANCHO, ALTO - 560);
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
}
