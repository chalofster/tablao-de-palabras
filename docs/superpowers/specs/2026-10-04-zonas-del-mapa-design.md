---
titulo: Tablao de Palabras, etapa 1 - zonas del mapa
fecha: 04-10-2026
estado: en revisión
---

## Objetivo

Ampliar el juego de una a tres zonas, para sumar estructuras nuevas de inglés sin cambiar la mecánica que la jugadora ya conoce (escuchar, armar la frase en el piano, decirla en voz alta, capturar y repasar).

## Zonas

| Zona | Fondo | Estructura | Criaturas |
|---|---|---|---|
| Patio | El patio andaluz actual | *I see / I like / Today is* | Las 8 actuales, sin cambios |
| Parque | Cielo, pasto y árboles | *I can / I can't* | 9 |
| Juguetería | Estantes con juguetes | *I have a/an + color + juguete* | 8 |

Las tres zonas están abiertas desde el inicio. Dentro de cada zona, las criaturas se capturan en orden: solo está disponible la primera sin capturar de esa zona, más los repasos que correspondan.

## Contenido nuevo

### Parque

Las 9 acciones de la guía del colegio, con polaridad fija por criatura:

| Frase | Frase |
|---|---|
| I can swim | I can't ride a bike |
| I can run | I can't fly a kite |
| I can dance | I can't play soccer |
| I can sing | I can't skate |
| I can jump | |

Bloques: `I` / `can` o `can't` / acción. El distractor del nivel 3 es la palabra contraria (*can* frente a *can't*). Las imágenes alternativas de la escucha son la misma acción con la carita contraria y otra acción con la misma carita.

### Juguetería

| Frase | Frase |
|---|---|
| I have a red ball | I have a pink doll |
| I have a blue car | I have a brown teddy bear |
| I have a yellow duck | I have an orange robot |
| I have a green kite | I have a purple bike |

Bloques: `I have` / `a` o `an` / color / juguete. El distractor es otro color. Las imágenes alternativas son el mismo juguete con otro color y otro juguete con el mismo color.

Los colores se dibujan como círculos pintados por el juego y no como emoji, porque no existe un emoji de círculo rosado y los emoji se ven distintos en cada equipo. Esto agrega un tipo de imagen `color` y permite que un bloque muestre un círculo de color en vez de un ícono. En la imagen, la silueta del juguete se pinta entera del color de la frase, con una sombra oscura, porque el emoji trae sus propios colores (en el iPad el auto es rojo) y contradiría la palabra que se aprende. Sin WebGL, que no permite pintar siluetas, se muestra un disco de color detrás del emoji.

## Navegación

- El mapa muestra una zona a la vez. Dos flechas, ◀ y ▶, en la franja del suelo, cambian de zona. En la primera zona no hay flecha ◀ y en la última no hay ▶.
- Una flecha lleva un punto rojo cuando alguna zona en esa dirección tiene repasos pendientes hoy.
- El juego recuerda la última zona visitada en el dispositivo (clave `tablao-zona-v1`). Si el valor guardado no es válido, abre el Patio.
- Las paradas del camino se calculan según la cantidad de criaturas de la zona (8 o 9), sin salirse de la pantalla ni quedar bajo los botones.
- La colección muestra las criaturas de la zona actual.

## Práctica libre

El botón de práctica está en todas las zonas y arma una ronda de 6 frases al azar, en nivel 3, sin esperas y sin guardar progreso:

- En el Parque usa las 18 combinaciones (*can* y *can't* de las 9 acciones), como hoy.
- En el Patio y la Juguetería usa las frases de la zona.

## Progreso

- Se conserva el formato y la clave actuales (`tablao-progreso-v1`). Las criaturas nuevas usan identificadores nuevos, así que lo ya capturado no cambia.
- Los repasos espaciados no cambian: 1 día, luego 3 días, luego dominada.

## Arquitectura

| Archivo | Cambio |
|---|---|
| `src/logica/contenido.js` | Exporta `ZONAS` (id, frases). `FRASES` pasa a ser la lista plana de todas las zonas |
| `src/logica/zonas.js` (nuevo) | Lógica pura: tareas disponibles de una zona, zonas con repasos pendientes, posición de las paradas, zona guardada válida |
| `src/logica/practica.js` | `armarRonda` recibe la zona |
| `src/logica/frase.js` | Resuelve imágenes y bloques de tipo color |
| `src/escenas/Mapa.js` | Dibuja la zona actual, su fondo, las flechas y los puntos rojos |
| `src/escenas/Coleccion.js` | Muestra la zona actual |
| `src/escenas/dibujo.js`, `Piano.js` | Dibujan el círculo de color en tarjetas y teclas |
| `src/sesion.js` | Guarda y lee la zona actual |

## Errores y casos límite

- Zona guardada inexistente o almacenamiento no disponible: se abre el Patio.
- Criaturas guardadas que ya no existen en el contenido: se ignoran, como hoy.
- Una zona con todo capturado y sin repasos: la bailarina celebra, como hoy.

## Pruebas

- Automáticas (Vitest): contenido de las tres zonas (identificadores únicos en todo el juego, alternativas distintas, bloques sin repetir), tareas por zona, aviso de repasos en otras zonas, paradas dentro de la pantalla para 8 y 9 criaturas, zona guardada inválida, rondas de práctica por zona.
- Manual con el motor de Safari simulando un iPad: recorrer las tres zonas, capturar una criatura nueva en cada una y jugar una ronda de práctica en cada una.

## Fuera de alcance

Preguntas y respuestas, grabación de voz, e ilustraciones y sonido definitivos. Son las etapas 2, 3 y 4.
