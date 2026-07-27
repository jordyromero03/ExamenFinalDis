const http = require('http');

const APP_NAME = 'app-ejemplo-evaluacion';
const APP_VERSION = '1.0.0';

function requestHandler(req, res) {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        message: 'Hola desde la aplicación de ejemplo de la evaluación práctica',
        app: APP_NAME,
        version: APP_VERSION,
      })
    );
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
}

const server = http.createServer(requestHandler);

// Solo levanta el servidor si se ejecuta directamente (node server.js),
// no cuando el archivo se importa desde las pruebas.
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`${APP_NAME} escuchando en el puerto ${PORT}`);
  });
}

module.exports = { server, requestHandler, APP_NAME, APP_VERSION };
