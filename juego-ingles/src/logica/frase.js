import { ESCALA } from './contenido.js';
import { nombreDia, indiceDia } from './calendario.js';

// Con esta cantidad de errores en el piano, un repaso cuenta como fallado.
export const UMBRAL_FALLO = 3;

const bloqueReal = (bloque, fecha) =>
  'dia' in bloque ? { texto: nombreDia(fecha, bloque.dia), icono: '📅' } : bloque;

const imagenReal = (imagen, fecha) =>
  'dia' in imagen ? { tipo: 'dia', indice: indiceDia(fecha, imagen.dia) } : imagen;

export function resolverFrase(def, fecha) {
  const bloques = def.bloques.map((bloque, i) => ({
    ...bloqueReal(bloque, fecha),
    nota: ESCALA[i % ESCALA.length],
  }));
  return {
    id: def.id,
    criatura: def.criatura,
    texto: bloques.map((bloque) => bloque.texto).join(' '),
    bloques,
    imagen: imagenReal(def.imagen, fecha),
    otras: def.otras.map((imagen) => imagenReal(imagen, fecha)),
    distractor: { ...bloqueReal(def.distractor, fecha), nota: null },
  };
}

export function mezclar(lista, azar = Math.random) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function opcionesEscucha(frase, azar = Math.random) {
  return mezclar(
    [
      { imagen: frase.imagen, correcta: true },
      ...frase.otras.map((imagen) => ({ imagen, correcta: false })),
    ],
    azar,
  );
}

export function teclasParaNivel(frase, nivel, azar = Math.random) {
  if (nivel <= 1) return [...frase.bloques];
  const base = nivel >= 3 ? [...frase.bloques, frase.distractor] : [...frase.bloques];
  const teclas = mezclar(base, azar);
  const quedoEnOrden = frase.bloques.every((bloque, i) => teclas[i] === bloque);
  return quedoEnOrden ? [...teclas.slice(1), teclas[0]] : teclas;
}

export function crearIntento(frase) {
  let posicion = 0;
  let erroresSeguidos = 0;
  let erroresTotales = 0;
  return {
    tocar(bloque) {
      const esperado = frase.bloques[posicion];
      if (esperado && bloque.texto === esperado.texto) {
        posicion++;
        erroresSeguidos = 0;
        return { ok: true, completa: posicion === frase.bloques.length };
      }
      if (!esperado) return { ok: false, pista: null };
      erroresSeguidos++;
      erroresTotales++;
      return { ok: false, pista: erroresSeguidos >= 2 ? esperado : null };
    },
    get erroresTotales() {
      return erroresTotales;
    },
  };
}
