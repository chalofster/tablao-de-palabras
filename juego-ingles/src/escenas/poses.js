// Geometría de los brazos de la bailarina. Sin Phaser, para poder probarla.
// Los ángulos están en grados, en el sentido de Phaser (positivo = horario),
// y se definen para el brazo izquierdo; el derecho usa su espejo.
// Con ángulo 0 el brazo cuelga hacia abajo.

export const MEDIDAS = { hombroX: 18, hombroY: -44, brazo: 28, antebrazo: 26 };

export const BRAZOS = {
  jarras: { hombro: 40, codo: -90 }, // mano en la cadera
  arriba: { hombro: 165, codo: 30 }, // braceo sobre la cabeza
  v: { hombro: 150, codo: 0 },
  palmasJuntas: { hombro: 10, codo: -132 },
  palmasAbiertas: { hombro: 35, codo: -60 },
  balanceo: { hombro: 15, codo: -20 },
};

export function espejo({ hombro, codo }) {
  return { hombro: -hombro, codo: -codo };
}

const direccion = (grados) => {
  const r = (grados * Math.PI) / 180;
  return { x: -Math.sin(r), y: Math.cos(r) };
};

// lado: -1 izquierda, 1 derecha.
export function puntaDelBrazo(lado, postura) {
  const { hombro, codo } = lado < 0 ? postura : espejo(postura);
  const d1 = direccion(hombro);
  const d2 = direccion(hombro + codo);
  const pCodo = {
    x: lado * MEDIDAS.hombroX + d1.x * MEDIDAS.brazo,
    y: MEDIDAS.hombroY + d1.y * MEDIDAS.brazo,
  };
  return {
    codo: pCodo,
    mano: { x: pCodo.x + d2.x * MEDIDAS.antebrazo, y: pCodo.y + d2.y * MEDIDAS.antebrazo },
  };
}
