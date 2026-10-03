import { FRASES } from './contenido.js';

export function disponibles(estado, hoy, frases = FRASES) {
  const lista = [];
  for (const frase of frases) {
    const guardada = estado.criaturas[frase.id];
    if (guardada && guardada.nivel < 3 && guardada.proximoRepaso && guardada.proximoRepaso <= hoy) {
      lista.push({ id: frase.id, nivel: guardada.nivel + 1, tipo: 'repaso' });
    }
  }
  const nueva = frases.find((frase) => !estado.criaturas[frase.id]);
  if (nueva) lista.push({ id: nueva.id, nivel: 1, tipo: 'captura' });
  return lista;
}
