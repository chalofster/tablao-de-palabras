import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { claveDia } from '../logica/calendario.js';
import { buscarZona, tareasDeZona, avisos, vecina, paradas } from '../logica/zonas.js';
import { armarRonda, tareaPractica } from '../logica/practica.js';
import { COLORES, crearBailarina, crearBoton, crearCriatura } from './dibujo.js';
import { dibujarFondo } from './fondos.js';

const Y_SUELO = 640;
const Y_FLECHAS = 705;

export class Mapa extends Phaser.Scene {
  constructor() {
    super('Mapa');
  }

  create() {
    this.ocupada = false;
    const zona = buscarZona(sesion.zona);
    const hoy = claveDia(sesion.ahora());
    dibujarFondo(this, zona.id);

    const puntos = paradas(zona.frases.length);
    const camino = this.add.graphics().lineStyle(14, COLORES.oro, 1);
    puntos.forEach((parada, i) => {
      if (i > 0) camino.lineBetween(puntos[i - 1].x, puntos[i - 1].y, parada.x, parada.y);
    });

    const tareas = tareasDeZona(sesion.estado, hoy, zona.id);
    const capturadas = zona.frases.filter((f) => sesion.estado.criaturas[f.id]).length;
    const partida = puntos[Math.max(0, capturadas - 1)];

    zona.frases.forEach((frase, i) => {
      const parada = puntos[i];
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
    crearBoton(this, ANCHO - 80, 210, '🤸', () => this.scene.start('Escucha', tareaPractica(armarRonda(zona.id), 0)));
    this.crearFlechas(zona.id, hoy);
    if (tareas.length === 0) this.bailarina.pose('celebracion');
  }

  // Una flecha por lado, solo si hay zona hacia ese lado; el punto rojo avisa repasos pendientes allá.
  crearFlechas(zonaId, hoy) {
    this.aviso = avisos(sesion.estado, hoy, zonaId);
    const lados = [
      { paso: -1, x: 60, icono: '◀️', conAviso: this.aviso.izquierda },
      { paso: 1, x: ANCHO - 60, icono: '▶️', conAviso: this.aviso.derecha },
    ];
    for (const { paso, x, icono, conAviso } of lados) {
      const destino = vecina(zonaId, paso);
      if (!destino) continue;
      crearBoton(this, x, Y_FLECHAS, icono, () => this.irAZona(destino));
      if (conAviso) this.add.circle(x + 40, Y_FLECHAS - 40, 14, COLORES.rojo).setStrokeStyle(3, COLORES.crema);
    }
  }

  irAZona(id) {
    if (this.ocupada) return;
    this.ocupada = true;
    sesion.cambiarZona(id);
    this.scene.start('Mapa');
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
}
