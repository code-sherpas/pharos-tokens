---
'@code-sherpas/pharos-tokens': minor
---

Añade cuatro familias de color que el sistema de diseño ya usa y los tokens no publicaban: `paper` (el papel cálido sobre el que se apoyan las superficies), `rule` (las líneas), los alias semánticos `surface.{canvas,card,sunken}` y `border.{subtle,strong}`, y la rampa completa `accent.terracotta.50…900` con sus alias `fg` / `bg` / `on`.

Todo es aditivo: ningún token existente cambia de nombre ni de valor, así que un consumidor que actualice no ve moverse un solo píxel hasta que decida nombrar los nuevos.
