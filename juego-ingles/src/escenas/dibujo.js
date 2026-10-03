export const COLORES = {
  fondo: 0xfdf0d5, rojo: 0xd62828, crema: 0xfff8e7, tinta: 0x3d2b1f,
  oro: 0xf4a261, gris: 0xb8b0a2, piel: 0xe0ac69,
};

// Achica un texto (o grupo de emojis) hasta que quepa en el ancho dado.
export function ajustarAncho(texto, maximo) {
  if (texto.width > maximo) texto.setScale(maximo / texto.width);
  return texto;
}

export function crearBoton(escena, x, y, icono, alTocar, radio = 55) {
  const boton = escena.add.container(x, y);
  boton.add([
    escena.add.circle(0, 0, radio, COLORES.crema).setStrokeStyle(5, COLORES.tinta),
    escena.add.text(0, 0, icono, { fontSize: `${radio}px` }).setOrigin(0.5),
  ]);
  boton.setSize(radio * 2, radio * 2).setInteractive({ useHandCursor: true });
  boton.on('pointerup', () => alTocar());
  return boton;
}

// Ángulos de los brazos en radianes: [izquierdo, derecho].
const POSES = {
  quieta: [2.4, 0.75],
  paso: [3.6, 0.4],
  giro: [4.2, 5.2],
  celebracion: [4.2, 5.2],
};

export function crearBailarina(escena, x, y, escala = 1) {
  const bailarina = escena.add.container(x, y).setScale(escala);
  const g = escena.add.graphics();
  bailarina.add(g);

  function dibujar(brazoIzquierdo, brazoDerecho) {
    g.clear();
    g.fillStyle(COLORES.rojo);
    g.fillTriangle(-70, 90, 70, 90, 0, -30);
    g.fillStyle(0xffffff);
    [[-30, 60], [0, 40], [30, 60], [-10, 75], [12, 12]].forEach(([px, py]) => g.fillCircle(px, py, 7));
    g.fillStyle(COLORES.piel);
    g.fillCircle(0, -55, 24);
    g.fillStyle(COLORES.tinta);
    g.fillCircle(0, -78, 13);
    g.fillStyle(COLORES.rojo);
    g.fillCircle(16, -72, 7);
    g.lineStyle(9, COLORES.piel);
    g.lineBetween(-12, -25, -12 + Math.cos(brazoIzquierdo) * 55, -25 + Math.sin(brazoIzquierdo) * 55);
    g.lineBetween(12, -25, 12 + Math.cos(brazoDerecho) * 55, -25 + Math.sin(brazoDerecho) * 55);
  }

  bailarina.pose = (nombre) => {
    dibujar(...POSES[nombre]);
    if (nombre === 'paso') {
      escena.tweens.add({
        targets: bailarina, angle: { from: -6, to: 6 }, duration: 150, yoyo: true, repeat: 1,
        onComplete: () => bailarina.setAngle(0),
      });
    }
    if (nombre === 'giro') {
      escena.tweens.add({ targets: g, scaleX: { from: 1, to: -1 }, duration: 200, yoyo: true });
    }
    if (nombre === 'celebracion') {
      escena.tweens.add({ targets: g, y: { from: 0, to: -40 }, duration: 220, yoyo: true, repeat: 2 });
    }
    return bailarina;
  };

  return bailarina.pose('quieta');
}

export function crearCriatura(escena, x, y, criatura, { silueta = false, escala = 1 } = {}) {
  const contenedor = escena.add.container(x, y).setScale(escala);
  const g = escena.add.graphics();
  g.fillStyle(silueta ? COLORES.gris : criatura.color);
  g.fillEllipse(0, 0, 120, 110);
  g.fillTriangle(-50, -30, -30, -70, -15, -40);
  g.fillTriangle(50, -30, 30, -70, 15, -40);
  contenedor.add(g);
  if (silueta) {
    contenedor.add(
      escena.add.text(0, 0, '?', { fontSize: '64px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5),
    );
    return contenedor;
  }
  g.fillStyle(0xffffff);
  g.fillCircle(-22, -15, 13);
  g.fillCircle(22, -15, 13);
  g.fillStyle(COLORES.tinta);
  g.fillCircle(-22, -13, 6);
  g.fillCircle(22, -13, 6);
  contenedor.add(escena.add.text(0, 28, criatura.emoji, { fontSize: '34px' }).setOrigin(0.5));
  return contenedor;
}

// Semana con lunes primero; el índice de día usa 0 = domingo.
const LETRAS_SEMANA = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function crearTarjeta(escena, x, y, imagen, ancho = 240, alto = 240) {
  const tarjeta = escena.add.container(x, y);
  tarjeta.add(escena.add.rectangle(0, 0, ancho, alto, COLORES.crema).setStrokeStyle(6, COLORES.tinta));
  if (imagen.tipo === 'emoji') {
    const dibujo = escena.add.text(0, 0, imagen.valor, { fontSize: '110px' }).setOrigin(0.5);
    tarjeta.add(ajustarAncho(dibujo, ancho - 40));
  } else {
    const posicion = (imagen.indice + 6) % 7;
    tarjeta.add(escena.add.text(0, -45, '📅', { fontSize: '72px' }).setOrigin(0.5));
    LETRAS_SEMANA.forEach((letra, i) => {
      const cx = -ancho / 2 + 24 + i * ((ancho - 48) / 6);
      const activo = i === posicion;
      tarjeta.add(escena.add.circle(cx, 55, activo ? 18 : 12, activo ? COLORES.rojo : COLORES.gris));
      tarjeta.add(
        escena.add
          .text(cx, 55, letra, { fontSize: activo ? '20px' : '13px', color: '#ffffff', fontStyle: 'bold' })
          .setOrigin(0.5),
      );
    });
  }
  tarjeta.setSize(ancho, alto);
  return tarjeta;
}
