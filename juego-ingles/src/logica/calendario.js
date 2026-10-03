export const DIAS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function claveDia(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function sumarDias(clave, n) {
  const [anio, mes, dia] = clave.split('-').map(Number);
  return claveDia(new Date(anio, mes - 1, dia + n));
}

export function indiceDia(fecha, desplazamiento = 0) {
  return (fecha.getDay() + desplazamiento) % 7;
}

export function nombreDia(fecha, desplazamiento = 0) {
  return DIAS[indiceDia(fecha, desplazamiento)];
}
