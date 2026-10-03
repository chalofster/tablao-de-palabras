export function crearVoz(
  synth = globalThis.speechSynthesis,
  Enunciado = globalThis.SpeechSynthesisUtterance,
) {
  const disponible = Boolean(synth && Enunciado);

  function elegirVoz() {
    const voces = synth.getVoices();
    return (
      voces.find((v) => v.lang === 'en-US' && v.name.includes('Samantha')) ??
      voces.find((v) => v.lang === 'en-US') ??
      voces.find((v) => v.lang?.startsWith('en')) ??
      null
    );
  }

  return {
    disponible,
    hablar(texto, { lento = false } = {}) {
      return new Promise((resolver) => {
        if (!disponible) return resolver(false);
        let terminado = false;
        const terminar = (ok) => {
          if (terminado) return;
          terminado = true;
          clearTimeout(limite);
          resolver(ok);
        };
        // En iOS el aviso de término a veces no llega: el juego no puede quedar esperando.
        const limite = setTimeout(() => terminar(false), 2500 + texto.length * (lento ? 220 : 140));
        try {
          synth.cancel();
          const enunciado = new Enunciado(texto);
          enunciado.lang = 'en-US';
          const voz = elegirVoz();
          if (voz) enunciado.voice = voz;
          enunciado.rate = lento ? 0.6 : 0.9;
          enunciado.onend = () => terminar(true);
          enunciado.onerror = () => terminar(false);
          synth.speak(enunciado);
        } catch {
          terminar(false);
        }
      });
    },
  };
}
