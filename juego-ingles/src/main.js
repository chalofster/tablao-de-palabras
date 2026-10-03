import Phaser from 'phaser';
import { ANCHO, ALTO } from './constantes.js';
import { sesion } from './sesion.js';
import { Inicio } from './escenas/Inicio.js';
import { Mapa } from './escenas/Mapa.js';
import { Coleccion } from './escenas/Coleccion.js';

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  backgroundColor: '#fdf0d5',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: ANCHO, height: ALTO },
  scene: [Inicio, Mapa, Coleccion],
});

if (import.meta.env.DEV) window.__tablao = { juego, sesion };
