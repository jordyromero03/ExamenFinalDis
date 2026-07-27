# Aplicación de ejemplo — Evaluación práctica (Docker, Kubernetes y CI/CD)

Aplicación mínima y neutral, provista únicamente para esta evaluación. No pertenece a ningún proyecto previo del curso: todos los estudiantes parten exactamente del mismo punto.

## Qué hace

Un servidor HTTP simple, sin dependencias externas, que expone:

- `GET /` — responde `200` con un mensaje, el nombre y la versión de la aplicación, en JSON.
- `GET /health` — responde igual que `/`, útil como endpoint de verificación de salud.
- Cualquier otra ruta — responde `404`.

Escucha por defecto en el puerto **8080** (configurable con la variable de entorno `PORT`).

## Cómo ejecutarla localmente

```
node server.js
curl http://localhost:8080/
```

## Cómo correr las pruebas

```
npm test
```

Usa el ejecutor de pruebas integrado de Node.js (`node --test`), por lo que no requiere instalar dependencias adicionales.

## Uso en la evaluación

Esta aplicación es el punto de partida para los tres retos de la evaluación práctica. Los archivos de Docker, Kubernetes y del pipeline de CI/CD **no se incluyen aquí a propósito**: se describen en el enunciado de la evaluación, con el defecto correspondiente, para que usted los recree y los corrija.
