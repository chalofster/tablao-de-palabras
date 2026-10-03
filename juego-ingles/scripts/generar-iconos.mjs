// Genera íconos PNG rojos con lunares blancos, sin dependencias externas.
import { deflateSync, crc32 } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

function png(lado) {
  const fila = 1 + lado * 3;
  const datos = Buffer.alloc(fila * lado);
  const celda = lado / 4;
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const cx = (Math.floor(x / celda) + 0.5) * celda;
      const cy = (Math.floor(y / celda) + 0.5) * celda;
      const lunar = Math.hypot(x - cx, y - cy) < celda * 0.28;
      const i = y * fila + 1 + x * 3;
      datos[i] = lunar ? 255 : 214;
      datos[i + 1] = lunar ? 255 : 40;
      datos[i + 2] = lunar ? 255 : 40;
    }
  }
  const trozo = (tipo, cuerpo) => {
    const cabecera = Buffer.from(tipo);
    const largo = Buffer.alloc(4);
    largo.writeUInt32BE(cuerpo.length);
    const suma = Buffer.alloc(4);
    suma.writeUInt32BE(crc32(Buffer.concat([cabecera, cuerpo])));
    return Buffer.concat([largo, cabecera, cuerpo, suma]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(lado, 0);
  ihdr.writeUInt32BE(lado, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 2; // color RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(datos)),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(new URL('../public/', import.meta.url), { recursive: true });
for (const lado of [180, 192, 512]) {
  writeFileSync(new URL(`../public/icono-${lado}.png`, import.meta.url), png(lado));
}
console.log('Íconos generados en public/');
