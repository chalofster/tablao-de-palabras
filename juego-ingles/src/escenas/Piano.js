import Phaser from 'phaser';
import { ANCHO } from '../constantes.js';
import { sesion } from '../sesion.js';
import { FRASES } from '../logica/contenido.js';
import { resolverFrase, teclasParaNivel, crearIntento } from '../logica/frase.js';
import { COLORES, ajustarAncho, crearBailarina, crearBoton } from './dibujo.js';

const Y_RANURAS = 210;
const Y_TECLAS = 600;
const LADO = 140;
const PASO = LADO + 16;

export class Piano extends Phaser.Scene {
  constructor() {
    super('Piano');
  }

  init(tarea) {
    this.tarea = tarea;
  }

  create() {
    this.frase = resolverFrase(FRASES.find((f) => f.id === this.tarea.id), sesion.ahora());
    this.intento = crearIntento(this.frase);
    this.colocados = 0;
    this.teclas = [];

    const cantidad = this.frase.bloques.length;
    this.xRanura = (i) => ANCHO / 2 + (i - (cantidad - 1) / 2) * PASO;
    this.frase.bloques.forEach((_, i) => {
      this.add.rectangle(this.xRanura(i), Y_RANURAS, LADO, LADO).setStrokeStyle(4, COLORES.gris);
    });

    this.bailarina = crearBailarina(this, 90, 410, 1.1);
    crearBoton(this, 80, 80, '🏠', () => this.scene.start('Mapa'));
    crearBoton(this, ANCHO - 80, 80, '🔊', () => sesion.voz.hablar(this.frase.texto, { lento: true }));

    sesion.musica.iniciarCompas(90);
    this.events.once('shutdown', () => sesion.musica.detenerCompas());

    if (this.tarea.nivel <= 1) this.soltarSiguiente();
    else this.ponerTeclas();
  }

  crearTecla(bloque, x, y) {
    const tecla = this.add.container(x, y);
    const icono = this.add.text(0, -18, bloque.icono, { fontSize: '50px' }).setOrigin(0.5);
    const palabra = this.add
      .text(0, 46, bloque.texto, { fontSize: '22px', color: '#3d2b1f', fontStyle: 'bold' })
      .setOrigin(0.5);
    tecla.add([
      this.add.rectangle(0, 0, LADO, LADO, COLORES.crema).setStrokeStyle(5, COLORES.tinta),
      ajustarAncho(icono, LADO - 20),
      ajustarAncho(palabra, LADO - 16),
    ]);
    tecla.setSize(LADO, LADO).setInteractive({ useHandCursor: true });
    tecla.bloque = bloque;
    tecla.colocada = false;
    tecla.on('pointerdown', () => this.tocar(tecla));
    this.teclas.push(tecla);
    return tecla;
  }

  // Nivel 1: los bloques caen de a uno y ya en orden.
  soltarSiguiente() {
    const tecla = this.crearTecla(this.frase.bloques[this.colocados], ANCHO / 2, -90);
    this.tweens.add({ targets: tecla, y: Y_TECLAS - 80, duration: 2200, ease: 'Sine.easeIn' });
  }

  // Niveles 2 y 3: todos los bloques abajo, desordenados.
  ponerTeclas() {
    const bloques = teclasParaNivel(this.frase, this.tarea.nivel);
    bloques.forEach((bloque, i) => {
      this.crearTecla(bloque, ANCHO / 2 + (i - (bloques.length - 1) / 2) * PASO, Y_TECLAS);
    });
  }

  tocar(tecla) {
    if (tecla.colocada) return;
    const resultado = this.intento.tocar(tecla.bloque);

    if (!resultado.ok) {
      this.tweens.add({ targets: tecla, x: tecla.x + 10, duration: 50, yoyo: true, repeat: 3 });
      sesion.voz.hablar(this.frase.texto, { lento: true });
      if (resultado.pista) {
        const correcta = this.teclas.find((t) => !t.colocada && t.bloque.texto === resultado.pista.texto);
        if (correcta) this.tweens.add({ targets: correcta, scale: 1.15, duration: 300, yoyo: true, repeat: 2 });
      }
      return;
    }

    tecla.colocada = true;
    tecla.disableInteractive();
    this.tweens.killTweensOf(tecla);
    tecla.setScale(1);
    sesion.musica.nota(tecla.bloque.nota);
    sesion.voz.hablar(tecla.bloque.texto);
    if (sesion.musica.enTiempo()) this.ole(tecla);
    this.bailarina.pose(this.colocados % 2 === 0 ? 'paso' : 'giro');
    this.tweens.add({ targets: tecla, x: this.xRanura(this.colocados), y: Y_RANURAS, duration: 300 });
    this.colocados++;

    if (resultado.completa) this.terminar();
    else if (this.tarea.nivel <= 1) this.time.delayedCall(500, () => this.soltarSiguiente());
  }

  // Tocar al compás no es obligatorio: solo se celebra.
  ole(tecla) {
    const texto = this.add
      .text(tecla.x, tecla.y - 100, '¡Olé!', { fontSize: '36px', color: '#d62828', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.tweens.add({ targets: texto, y: texto.y - 60, alpha: 0, duration: 700, onComplete: () => texto.destroy() });
  }

  terminar() {
    sesion.musica.detenerCompas();
    this.teclas.forEach((tecla) => tecla.disableInteractive());
    // La escena se reutiliza: si mientras habla se volvió al mapa y se abrió otra
    // criatura, this.intento ya es otro y este aviso atrasado debe ignorarse.
    const intento = this.intento;
    const tarea = this.tarea;
    this.time.delayedCall(800, async () => {
      sesion.musica.melodia(this.frase.bloques.map((bloque) => bloque.nota));
      this.bailarina.pose('celebracion');
      await sesion.voz.hablar(this.frase.texto);
      if (this.intento === intento && this.scene.isActive()) {
        this.scene.start('Voz', { ...tarea, errores: intento.erroresTotales });
      }
    });
  }
}
