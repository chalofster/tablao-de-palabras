import Phaser from 'phaser';
import { ANCHO, ALTO } from './constantes.js';
import { sesion } from './sesion.js';
import { Inicio } from './escenas/Inicio.js';
import { Mapa } from './escenas/Mapa.js';
import { Coleccion } from './escenas/Coleccion.js';
import { Escucha } from './escenas/Escucha.js';
import { Piano } from './escenas/Piano.js';
import { Voz } from './escenas/Voz.js';
import { Captura } from './escenas/Captura.js';
import { Fiesta } from './escenas/Fiesta.js';

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  backgroundColor: '#fdf0d5',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: ANCHO, height: ALTO },
  scene: [Inicio, Mapa, Coleccion, Escucha, Piano, Voz, Captura, Fiesta],
});

if (import.meta.env.DEV) window.__tablao = { juego, sesion };
