# Aplicación de ejemplo — Evaluación práctica (Docker, Kubernetes y CI/CD)

Aplicación mínima y neutral para la evaluación práctica. Esta guía explica cómo ejecutar la app localmente, cómo correr pruebas y cómo construir/ejecutar el contenedor Docker.

## 1. Requisitos previos

- Node.js 20 o superior
- Docker instalado y corriendo
- Acceso a terminal / shell

## 2. Ejecutar la aplicación localmente

1. Abrir una terminal en la carpeta del proyecto.
2. Instalar dependencias (aunque no hay dependencias externas en este repositorio):

```bash
npm install
```

3. Ejecutar la aplicación:

```bash
node server.js
```

4. En otra terminal, probar el endpoint principal:

```bash
curl http://localhost:8080/
```

5. Probar el endpoint de salud:

```bash
curl http://localhost:8080/health
```

> Nota: la aplicación escucha en el puerto `8080` por defecto. Si define `PORT`, cambiará a ese puerto.

## 3. Correr las pruebas

La prueba integrada usa el ejecutor de pruebas de Node.js.

```bash
npm test
```

Si todo está bien, debería ver resultados del test sin necesidad de dependencias externas.

## 4. Construir la imagen Docker

1. Desde la carpeta del proyecto, construir la imagen:

```bash
docker build -t app-ejemplo-evaluacion .
```

2. Verificar que la imagen se creó:

```bash
docker images app-ejemplo-evaluacion
```

## 5. Ejecutar el contenedor Docker

1. Ejecutar el contenedor exponiendo el puerto 8080:

```bash
docker run --rm -p 8080:8080 app-ejemplo-evaluacion
```

2. Probar la aplicación desde el host:

```bash
curl http://localhost:8080/
```

3. O probar el endpoint de salud:

```bash
curl http://localhost:8080/health
```

## 6. Verificar el estado del contenedor Docker

1. Buscar el ID del contenedor en ejecución:

```bash
docker ps
```

2. Inspeccionar el estado de salud si existe un `HEALTHCHECK`:

```bash
docker inspect --format='{{json .State.Health}}' <container_id>
```

> En la configuración actual la salida puede ser `null` si no se ha definido un `HEALTHCHECK` en el `Dockerfile`.

## 7. Notas importantes

- El servidor Node.js escucha por defecto en `8080`.
- El archivo `Dockerfile` actual expone el puerto `3000`, pero la aplicación usa `8080`. Para evitar confusiones, en el comando `docker run` debe mapearse `8080:8080`.
- Si desea cambiar el puerto al ejecutar Docker, use:

```bash
docker run --rm -p 3000:8080 -e PORT=3000 app-ejemplo-evaluacion
```

> Si el puerto local ya está ocupado, el error será `Bind for 0.0.0.0:<puerto> failed: port is already allocated`.
> En ese caso, elija otro puerto libre con `-p <puerto_libre>:8080`.

## 8. Parte 2 — Kubernetes

Esta parte cubre los pasos básicos para desplegar la aplicación en un clúster Kubernetes.

1. Crear un `Deployment` que use la imagen de Docker `app-ejemplo-evaluacion`.
2. Crear un `Service` para exponer el deployment dentro del clúster o hacia el exterior.
3. Aplicar los recursos con `kubectl apply -f`.

Ejemplo de `Deployment` mínimo (`deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-ejemplo-evaluacion
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app-ejemplo-evaluacion
  template:
    metadata:
      labels:
        app: app-ejemplo-evaluacion
    spec:
      containers:
        - name: app-ejemplo-evaluacion
          image: app-ejemplo-evaluacion:latest
          ports:
            - containerPort: 8080
          env:
            - name: PORT
              value: "8080"
```

Ejemplo de `Service` tipo NodePort (`service.yaml`):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-ejemplo-evaluacion-service
spec:
  type: NodePort
  selector:
    app: app-ejemplo-evaluacion
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
```

4. Desplegar los recursos:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

5. Verificar el estado del deployment:

```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

6. Probar el servicio desde un nodo del clúster o con `kubectl port-forward`:

```bash
kubectl port-forward deployment/app-ejemplo-evaluacion 8080:8080
curl http://localhost:8080/
```

7. Si usa un `Service` de tipo `NodePort`, el acceso externo se puede hacer en el puerto asignado por Kubernetes:

```bash
kubectl get service app-ejemplo-evaluacion-service
```

> Nota: la aplicación debe exponerse en `containerPort: 8080` porque el servidor escucha en ese puerto.

## 9. Parte 3 — CI/CD con GitHub Actions

Esta parte describe cómo automatizar la validación, la construcción de la imagen y el despliegue con GitHub Actions.

1. Crear el workflow en la carpeta de GitHub Actions del repositorio, por ejemplo en [github/workflows/ci-cd.yaml](github/workflows/ci-cd.yaml).
2. Configurar los pasos de compilación y pruebas:

```yaml
name: ci-cd
on:
  push:
    branches: [main]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
```

3. Añadir un job para construir y publicar la imagen Docker. Para ello, necesitarás credenciales de un registro como Docker Hub o GitHub Container Registry.

```yaml
  deploy:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app-ejemplo-evaluacion:${{ github.sha }} .
      - run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
      - run: docker push app-ejemplo-evaluacion:${{ github.sha }}
```

4. Actualizar el despliegue en Kubernetes después de publicar la imagen. El ejemplo asume que el cluster ya está configurado en el runner.

```yaml
      - run: kubectl set image deployment/app-ejemplo-evaluacion app-ejemplo-evaluacion=app-ejemplo-evaluacion:${{ github.sha }}
```

5. Definir los secretos en GitHub para que el pipeline funcione:

- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `KUBECONFIG` o un contexto de Kubernetes configurado previamente

6. Hacer `push` a la rama `main` y revisar la pestaña `Actions` del repositorio para verificar que el workflow pase.

> Nota: el workflow base del proyecto ya existe en [github/workflows/ci-cd.yaml](github/workflows/ci-cd.yaml), pero suele requerir ajustes para que funcione con tu registro de imágenes y tu clúster Kubernetes reales.

## 10. Resumen de comandos útiles

```bash
npm install
node server.js
npm test
docker build -t app-ejemplo-evaluacion .
docker run --rm -p 8080:8080 app-ejemplo-evaluacion
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
curl http://localhost:8080/
```

## 11. Uso en la evaluación

Este repositorio es el punto de partida para la evaluación práctica de Docker, Kubernetes y CI/CD. El objetivo es identificar y corregir los detalles de la configuración, crear los recursos faltantes y validar los flujos de despliegue.
