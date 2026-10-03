import { MEDIDAS, BRAZOS, espejo } from './poses.js';

const C = {
  vestido: 0xd62828, volante: 0xa4161a, lunar: 0xffffff, piel: 0xe0ac69,
  pelo: 0x3d2b1f, flor: 0xff4d6d, centroFlor: 0xffd166, peineta: 0x8b4a2b,
  manton: 0xfff1d0, fleco: 0xe9c46a, zapato: 0x7b2d26, mejilla: 0xf08080,
  boca: 0x8d1b1b, aro: 0xffd166,
};

// Medidas sin escalar: la cintura está en y = -8 y los zapatos cerca de y = 90.
const CINTURA = -8;

// Tres volantes, del más bajo al más alto, para que cada uno tape el borde del siguiente.
// [y superior, y inferior, medio ancho arriba, medio ancho abajo, lunares]
const VOLANTES = [
  [48, 76, 38, 52, 4],
  [20, 48, 25, 38, 3],
  [CINTURA, 20, 11, 25, 2],
];

function dibujarFalda(g) {
  for (const [y1, y2, a1, a2, lunares] of VOLANTES) {
    g.fillStyle(C.vestido);
    g.fillPoints([{ x: -a1, y: y1 }, { x: a1, y: y1 }, { x: a2, y: y2 }, { x: -a2, y: y2 }], true);
    const ondas = Math.round(a2 / 6);
    const radio = a2 / ondas;
    g.fillStyle(C.volante);
    for (let k = 0; k < ondas; k++) g.fillCircle(-a2 + radio * (2 * k + 1), y2, radio + 1);
    g.fillStyle(C.lunar);
    const yLunar = (y1 + y2) / 2;
    const ancho = (a1 + a2) / 2;
    for (let k = 0; k < lunares; k++) {
      g.fillCircle(-ancho + ((k + 0.5) * 2 * ancho) / lunares, yLunar, 3.5);
    }
  }
}

function dibujarTorso(g) {
  g.fillStyle(C.piel);
  g.fillRect(-5, -54, 10, 12);
  g.fillStyle(C.vestido);
  g.fillPoints([{ x: -15, y: -44 }, { x: 15, y: -44 }, { x: 11, y: CINTURA }, { x: -11, y: CINTURA }], true);
  // Mantón con flecos sobre los hombros.
  g.fillStyle(C.manton);
  g.fillTriangle(-19, -45, 19, -45, 0, -20);
  g.lineStyle(1.5, C.fleco);
  for (let t = 0.1; t < 1; t += 0.15) {
    for (const lado of [-1, 1]) {
      const x = lado * 19 * (1 - t);
      const y = -45 + 25 * t;
      g.lineBetween(x, y, x + lado * 1.5, y + 6);
    }
  }
  g.fillStyle(C.flor);
  g.fillCircle(-6, -37, 3);
  g.fillCircle(6, -37, 3);
}

function crearCabeza(escena) {
  const cabeza = escena.add.container(0, -70);
  const g = escena.add.graphics();
  // Peineta: abanico calado detrás del moño.
  g.fillStyle(C.peineta);
  g.slice(0, -24, 17, Math.PI * 1.05, Math.PI * 1.95, false);
  g.fillPath();
  for (let k = 0; k <= 6; k++) {
    const a = Math.PI * (1.08 + (k / 6) * 0.84);
    g.fillCircle(Math.cos(a) * 17, -24 + Math.sin(a) * 17, 3);
  }
  g.fillStyle(C.pelo);
  g.fillCircle(0, -23, 12);
  g.fillCircle(0, -3, 22);
  g.fillStyle(C.piel);
  g.fillCircle(0, 3, 19);
  g.fillStyle(C.pelo);
  g.fillEllipse(-8, -12, 20, 9);
  g.fillEllipse(8, -12, 20, 9);
  g.fillStyle(C.mejilla, 0.6);
  g.fillCircle(-12, 10, 4);
  g.fillCircle(12, 10, 4);
  g.fillStyle(C.aro);
  g.fillCircle(-19, 12, 3);
  g.fillCircle(19, 12, 3);
  // Flor en el pelo.
  g.fillStyle(C.flor);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    g.fillCircle(16 + Math.cos(a) * 5, -16 + Math.sin(a) * 5, 4.5);
  }
  g.fillStyle(C.centroFlor);
  g.fillCircle(16, -16, 3);

  const ojos = escena.add.graphics({ x: 0, y: 3 });
  ojos.fillStyle(C.pelo);
  ojos.fillEllipse(-7, 0, 5, 7);
  ojos.fillEllipse(7, 0, 5, 7);
  ojos.fillStyle(0xffffff);
  ojos.fillCircle(-6, -1.5, 1.2);
  ojos.fillCircle(8, -1.5, 1.2);

  const boca = escena.add.graphics();
  cabeza.add([g, ojos, boca]);
  cabeza.ojos = ojos;
  cabeza.boca = boca;
  return cabeza;
}

function dibujarBoca(boca, grande) {
  boca.clear();
  if (grande) {
    boca.fillStyle(C.boca);
    boca.slice(0, 10, 6, 0, Math.PI, false);
    boca.fillPath();
  } else {
    boca.lineStyle(2.5, C.boca);
    boca.beginPath();
    boca.arc(0, 9, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    boca.strokePath();
  }
}

function crearBrazo(escena, lado) {
  const hombro = escena.add.container(lado * MEDIDAS.hombroX, MEDIDAS.hombroY);
  const brazo = escena.add.graphics();
  brazo.lineStyle(7, C.piel);
  brazo.lineBetween(0, 0, 0, MEDIDAS.brazo);
  brazo.fillStyle(C.vestido);
  brazo.fillCircle(0, 3, 7);
  brazo.fillStyle(C.volante);
  brazo.fillCircle(0, 9, 4);

  const codo = escena.add.container(0, MEDIDAS.brazo);
  const antebrazo = escena.add.graphics();
  antebrazo.lineStyle(6, C.piel);
  antebrazo.lineBetween(0, 0, 0, MEDIDAS.antebrazo);

  const mano = escena.add.container(0, MEDIDAS.antebrazo);
  const g = escena.add.graphics();
  g.fillStyle(C.piel);
  g.fillEllipse(0, 3, 9, 10);
  g.lineStyle(2.5, C.piel);
  g.lineBetween(-3, 5, -5, 11);
  g.lineBetween(0, 6, 0, 12);
  g.lineBetween(3, 5, 5, 11);
  mano.add(g);

  codo.add([antebrazo, mano]);
  hombro.add([brazo, codo]);
  return { hombro, codo, mano };
}

function crearPierna(escena, lado) {
  const pierna = escena.add.container(lado * 9, 78);
  const g = escena.add.graphics();
  g.lineStyle(6, C.piel);
  g.lineBetween(0, 0, 0, 8);
  g.fillStyle(C.zapato);
  g.fillEllipse(lado * 2, 11, 15, 7);
  g.fillRect(lado * 2 - lado * 6 - 1.5, 11, 3, 5);
  pierna.add(g);
  return pierna;
}

export function crearBailarina(escena, x, y, escala = 1) {
  const raiz = escena.add.container(x, y).setScale(escala);
  raiz.add(escena.add.ellipse(0, 92, 90, 12, 0x000000, 0.12));

  const cuerpo = escena.add.container(0, 0);
  const piernas = [crearPierna(escena, -1), crearPierna(escena, 1)];
  const falda = escena.add.container(0, CINTURA);
  const gFalda = escena.add.graphics({ x: 0, y: -CINTURA });
  dibujarFalda(gFalda);
  falda.add(gFalda);
  const torso = escena.add.graphics();
  dibujarTorso(torso);
  const brazos = [crearBrazo(escena, -1), crearBrazo(escena, 1)];
  const cabeza = crearCabeza(escena);
  cuerpo.add([...piernas, falda, torso, ...brazos.map((b) => b.hombro), cabeza]);
  raiz.add(cuerpo);
  dibujarBoca(cabeza.boca, false);

  // Animación continua: respira, la falda se mece, las manos hacen floreo y parpadea.
  escena.tweens.add({
    targets: [cabeza, ...brazos.map((b) => b.hombro)], y: '-=1.5',
    duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });
  escena.tweens.add({
    targets: falda, angle: { from: -3, to: 3 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });
  brazos.forEach((b, i) => {
    escena.tweens.add({
      targets: b.mano, angle: { from: -35, to: 35 }, duration: 450, delay: i * 200,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  });
  escena.time.addEvent({
    delay: 2800, loop: true,
    callback: () => escena.tweens.add({ targets: cabeza.ojos, scaleY: 0.1, duration: 80, yoyo: true }),
  });

  function moverBrazos(izquierdo, derecho, duracion = 250) {
    const objetivos = [izquierdo, espejo(derecho)];
    brazos.forEach((b, i) => {
      const { hombro, codo } = objetivos[i];
      escena.tweens.killTweensOf([b.hombro, b.codo]);
      if (duracion === 0) {
        b.hombro.angle = hombro;
        b.codo.angle = codo;
        return;
      }
      escena.tweens.add({ targets: b.hombro, angle: hombro, duration: duracion, ease: 'Sine.easeInOut' });
      escena.tweens.add({ targets: b.codo, angle: codo, duration: duracion, ease: 'Sine.easeInOut' });
    });
  }

  function zapatear(pierna, veces) {
    escena.tweens.add({ targets: pierna, y: 72, duration: 90, yoyo: true, repeat: veces - 1 });
  }

  let regreso = null;
  let pasos = 0;
  const pendientes = [];
  const despues = (ms, accion) => pendientes.push(escena.time.delayedCall(ms, accion));

  function reiniciar() {
    if (regreso) regreso.remove(false);
    pendientes.splice(0).forEach((evento) => evento.remove(false));
    escena.tweens.killTweensOf([cuerpo, ...piernas]);
    cuerpo.setAngle(0).setScale(1).setY(0);
    piernas.forEach((p) => p.setY(78));
    escena.tweens.add({ targets: falda, scaleX: 1, duration: 150 });
  }

  function volverAReposo(ms) {
    regreso = escena.time.delayedCall(ms, () => {
      dibujarBoca(cabeza.boca, false);
      moverBrazos(BRAZOS.jarras, BRAZOS.jarras, 350);
    });
  }

  const POSES = {
    quieta() {
      dibujarBoca(cabeza.boca, false);
      moverBrazos(BRAZOS.jarras, BRAZOS.jarras, 300);
    },
    paso() {
      const derecha = pasos++ % 2 === 1;
      moverBrazos(
        derecha ? BRAZOS.jarras : BRAZOS.arriba,
        derecha ? BRAZOS.arriba : BRAZOS.jarras,
      );
      escena.tweens.add({ targets: cuerpo, angle: derecha ? -6 : 6, duration: 160, yoyo: true });
      zapatear(piernas[derecha ? 0 : 1], 2);
      volverAReposo(800);
    },
    giro() {
      moverBrazos(BRAZOS.arriba, BRAZOS.arriba, 200);
      escena.tweens.add({ targets: falda, scaleX: 1.35, duration: 300, yoyo: true, hold: 200 });
      escena.tweens.add({ targets: cuerpo, scaleX: -1, duration: 160, yoyo: true, repeat: 1 });
      volverAReposo(1000);
    },
    celebracion() {
      dibujarBoca(cabeza.boca, true);
      moverBrazos(BRAZOS.v, BRAZOS.v, 200);
      escena.tweens.add({ targets: cuerpo, y: -30, duration: 220, yoyo: true, ease: 'Quad.easeOut' });
      for (let k = 0; k < 3; k++) {
        despues(550 + k * 320, () => moverBrazos(BRAZOS.palmasJuntas, BRAZOS.palmasJuntas, 140));
        despues(710 + k * 320, () => moverBrazos(BRAZOS.palmasAbiertas, BRAZOS.palmasAbiertas, 140));
      }
      despues(1600, () => {
        moverBrazos(BRAZOS.v, BRAZOS.v, 200);
        escena.tweens.add({ targets: cuerpo, y: -20, duration: 200, yoyo: true });
        zapatear(piernas[0], 2);
        zapatear(piernas[1], 2);
      });
      volverAReposo(2600);
    },
    caminar() {
      moverBrazos(BRAZOS.balanceo, BRAZOS.balanceo, 150);
      escena.tweens.add({ targets: cuerpo, y: -6, duration: 100, yoyo: true, repeat: 2 });
      zapatear(piernas[0], 2);
      despues(100, () => zapatear(piernas[1], 2));
      volverAReposo(700);
    },
  };

  raiz.pose = (nombre) => {
    reiniciar();
    POSES[nombre]();
    return raiz;
  };

  moverBrazos(BRAZOS.jarras, BRAZOS.jarras, 0);
  return raiz;
}
