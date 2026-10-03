---
titulo: "Juego 1: inglés con piano, flamenco y criaturas"
nombre_de_trabajo: "Tablao de Palabras"
tipo: documento de diseño
fecha: 03-10-2026
estado: aprobado
---

## Propósito

Juego para iPad que refuerza el inglés de la jugadora (6 años y 10 meses, primero básico). Su punto más débil es armar y articular **frases**; ya maneja vocabulario suelto (números, días de la semana, algunos animales). Recién está aprendiendo a leer en español.

**Éxito significa:** la jugadora juega por iniciativa propia en sesiones cortas y, tras algunas semanas, arma sin ayuda las frases de la primera zona.

## Fuera de alcance

- Evaluación automática de la pronunciación. El reconocimiento de voz no es confiable con niños de esta edad; el juego invita a repetir en voz alta sin calificar.
- Cuentas de usuario, puntajes en línea, más de una jugadora.
- Más de una zona del mapa. Se agregan después de probar la primera con la jugadora.
- Personajes, nombres o imágenes de Pokémon. Las criaturas son originales.
- El juego de carreras (Juego 2), que tendrá su propio documento de diseño.

## Principios de diseño

| Principio | Consecuencia |
|---|---|
| Audio primero | Toda palabra lleva imagen y audio. El texto escrito es apoyo, nunca requisito |
| La frase es la mecánica | No se avanza tocando al ritmo solamente; se avanza armando la frase |
| Sin castigo | No hay vidas ni "game over". Ante un error, la frase se repite más lento |
| Sesiones cortas | Cada criatura toma 2 a 3 minutos |
| Un cambio a la vez | Cada frase cambia una sola cosa respecto de la anterior |

## Recorrido de una partida

| Paso | Pantalla | Qué hace la jugadora |
|---|---|---|
| 1 | Mapa | Mueve a la bailarina por el camino y toca la criatura disponible |
| 2 | Escucha | Oye la frase y elige la imagen correcta entre tres |
| 3 | Piano | Toca los bloques de la frase en orden y al compás |
| 4 | Voz | El juego repite la frase y la invita a decirla; no califica |
| 5 | Captura | La bailarina celebra y la criatura entra a la colección |

Pantalla adicional: **Colección**, donde ve sus criaturas y al tocarlas escucha su frase.

## Contenido de la primera zona

| # | Frase | Bloques en el piano | Qué hay de nuevo |
|---|---|---|---|
| 1 | I see a cat | I see · a · cat | Estructura base |
| 2 | I see a dog | I see · a · dog | Cambia el animal |
| 3 | I see two cats | I see · two · cats | Número y plural |
| 4 | I see three birds | I see · three · birds | Consolida número y plural |
| 5 | I like dogs | I · like · dogs | Cambia el verbo |
| 6 | I like cats and dogs | I · like · cats · and · dogs | Frase más larga |
| 7 | Today is [día real] | Today · is · [día] | Estructura nueva |
| 8 | Tomorrow is [día siguiente] | Tomorrow · is · [día] | Cambia el sujeto |

- Las frases 7 y 8 usan la fecha real del dispositivo, para que siempre sean verdaderas.
- Los bloques siguen unidades de sentido, no palabras sueltas.
- Las frases viven en un archivo de datos separado del código. Agregar una frase no requiere programar.

## Progresión de dificultad

Cada criatura tiene tres niveles. El nivel 1 se juega al capturarla; los niveles 2 y 3 se juegan cuando la criatura reaparece en el mapa.

| Nivel | Mecánica del piano |
|---|---|
| 1 | Los bloques caen ya ordenados; solo se tocan al compás |
| 2 | Los bloques aparecen desordenados; la jugadora elige el orden |
| 3 | Se agrega un bloque distractor (por ejemplo, *dog* frente a *dogs*) |

**Repaso espaciado:** una criatura capturada reaparece al día siguiente para el nivel 2 y tres días después para el nivel 3. Si la jugadora falla el repaso, la criatura reaparece al día siguiente en el mismo nivel.

**Cuándo falla un repaso:** con 3 o más errores en el piano. La jugadora igual termina la frase; la criatura simplemente no sube de nivel y vuelve al día siguiente. La captura inicial (nivel 1) nunca falla. Tocar al compás no es obligatorio: solo se celebra con un "¡Olé!".

**Manejo del error en el piano:** el bloque incorrecto vibra y no suena; el correcto se ilumina tras dos errores seguidos. La frase se vuelve a reproducir más lento.

## Aspecto y sonido

- **Orientación** horizontal. Botones de al menos 2 cm. Navegación solo con íconos: casa, colección, repetir audio.
- **Bailarina** con vestido de lunares y cuatro poses: quieta, paso, giro, celebración.
- **Mapa** tipo tablero con ocho paradas, ambientado en un patio andaluz.
- **Arte de la primera versión:** figuras simples dibujadas por código. Las ilustraciones definitivas se incorporan después de validar la mecánica con la jugadora.
- **Música** generada en el navegador, sin archivos de audio: notas de piano en escala frigia y base de palmas en 4 tiempos. Cada bloque toca una nota; la frase completa forma una melodía.
- **Voz en inglés:** la voz sintética del iPad (inglés de Estados Unidos). Si la calidad no convence en la prueba real, se reemplaza por audios grabados; el diseño aísla la voz en un módulo para permitir ese cambio.

## Arquitectura

**Motor:** Phaser 3.90, con Vite como herramienta de construcción. Código en la subcarpeta `juego-ingles/`.

| Módulo | Responsabilidad | Depende de |
|---|---|---|
| `contenido` | Datos de frases, bloques y criaturas | Nada |
| `progreso` | Criaturas capturadas, niveles, fechas de repaso; guarda y lee del dispositivo | `contenido` |
| `repaso` | Decide qué criatura aparece hoy y en qué nivel | `progreso`, fecha |
| `frase` | Valida el orden de bloques tocados y genera distractores | `contenido` |
| `calendario` | Resuelve el día real para las frases 7 y 8 | Fecha |
| `voz` | Pronuncia frases y bloques, a velocidad normal o lenta | Navegador |
| `musica` | Notas de piano, palmas y compás | Navegador |
| Escenas | Mapa, Escucha, Piano, Voz, Captura, Colección | Todos los anteriores |

Los cinco primeros módulos son lógica pura, sin dependencia de Phaser ni del navegador, y se prueban de forma automática. Las escenas solo dibujan y delegan.

## Particularidades del iPad

| Tema | Tratamiento |
|---|---|
| El audio no suena hasta el primer toque | Pantalla inicial con un botón grande de "jugar" que activa audio y voz |
| El interruptor de silencio apaga el sonido del juego | El juego se declara como reproductor de audio, con lo que suena aunque el interruptor esté en silencio. La pantalla inicial muestra un ícono de volumen y toca una melodía de prueba |
| Safari borra datos de sitios sin uso tras algunos días | El juego se instala en la pantalla de inicio, lo que evita ese borrado |
| Uso sin internet | Tras la primera carga, el juego funciona sin conexión |

## Publicación

Sitio gratuito en GitHub Pages. La dirección es pública pero no se difunde, y el juego no contiene ni envía datos personales. Requiere una cuenta de GitHub personal.

## Pruebas

- **Automáticas:** módulos `progreso`, `repaso`, `frase` y `calendario`, incluidos los casos de borde (cambio de día, datos guardados dañados, primer uso).
- **En navegador:** recorrido completo de una criatura a resolución de iPad, con toques simulados.
- **Con la jugadora:** prueba real en el iPad antes de invertir en ilustraciones o más contenido. Se observa si entiende qué hacer sin explicación y si la voz se entiende.

## Decisiones pendientes

| Decisión | Cuándo se resuelve |
|---|---|
| Voz sintética o audios grabados | Tras la primera prueba en el iPad |
| Ilustraciones definitivas | Tras validar la mecánica con la jugadora |
