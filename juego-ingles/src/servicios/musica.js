export function distanciaAlPulso(t, inicio, intervalo) {
  const fase = (((t - inicio) % intervalo) + intervalo) % intervalo;
  return Math.min(fase, intervalo - fase);
}

const frecuencia = (midi) => 440 * 2 ** ((midi - 69) / 12);

const MUSICA_VACIA = {
  reanudar() {}, nota() {}, palma() {}, melodia() {},
  iniciarCompas() {}, detenerCompas() {}, enTiempo: () => false,
};

export function crearMusica(Contexto = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
  if (!Contexto) return MUSICA_VACIA;
  const ctx = new Contexto();
  let reloj = null;
  let inicio = 0;
  let intervalo = 60 / 90;

  function reanudar() {
    // Con sesión de tipo "playback" el iPad suena aunque el interruptor esté en silencio.
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* sin soporte */ }
    if (ctx.state !== 'running') ctx.resume();
  }

  // Al volver de segundo plano iOS deja el audio detenido.
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reanudar(); });
    document.addEventListener('pointerup', reanudar);
  }

  function nota(midi, duracion = 0.6, cuando = ctx.currentTime) {
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();
    oscilador.type = 'triangle';
    oscilador.frequency.value = frecuencia(midi);
    ganancia.gain.setValueAtTime(0.0001, cuando);
    ganancia.gain.exponentialRampToValueAtTime(0.4, cuando + 0.01);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, cuando + duracion);
    oscilador.connect(ganancia).connect(ctx.destination);
    oscilador.start(cuando);
    oscilador.stop(cuando + duracion + 0.05);
  }

  function palma(cuando = ctx.currentTime, fuerte = false) {
    const muestras = Math.floor(ctx.sampleRate * 0.05);
    const bufer = ctx.createBuffer(1, muestras, ctx.sampleRate);
    const datos = bufer.getChannelData(0);
    for (let i = 0; i < muestras; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / muestras);
    const fuente = ctx.createBufferSource();
    fuente.buffer = bufer;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.frequency.value = 1800;
    const ganancia = ctx.createGain();
    ganancia.gain.value = fuerte ? 0.5 : 0.25;
    fuente.connect(filtro).connect(ganancia).connect(ctx.destination);
    fuente.start(cuando);
  }

  function detenerCompas() {
    if (reloj) clearInterval(reloj);
    reloj = null;
  }

  function iniciarCompas(bpm = 90) {
    detenerCompas();
    intervalo = 60 / bpm;
    inicio = ctx.currentTime + 0.1;
    let siguiente = 0;
    reloj = setInterval(() => {
      // Si el audio estuvo detenido, saltar los pulsos atrasados en vez de dispararlos juntos.
      const minimo = Math.ceil((ctx.currentTime - inicio) / intervalo);
      if (siguiente < minimo) siguiente = minimo;
      while (inicio + siguiente * intervalo < ctx.currentTime + 0.2) {
        palma(inicio + siguiente * intervalo, siguiente % 4 === 0);
        siguiente++;
      }
    }, 50);
  }

  return {
    reanudar,
    nota,
    palma,
    melodia(notas) { notas.forEach((midi, i) => nota(midi, 0.5, ctx.currentTime + i * 0.3)); },
    iniciarCompas,
    detenerCompas,
    enTiempo: () => reloj !== null && distanciaAlPulso(ctx.currentTime, inicio, intervalo) < 0.15,
  };
}
