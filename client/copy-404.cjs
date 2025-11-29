const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
const errorPath = path.join(distPath, '404.html');

// Contenido mejorado para 404.html - Compatible con HashRouter
const custom404Content = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Business Wars - Simulador Estratégico Web</title>
    <script>
      // Redirigir a la aplicación SPA con HashRouter
      var path = window.location.pathname + window.location.search;
      if (path.startsWith('/business-wars-simulator')) {
        path = path.replace('/business-wars-simulator', '');
      }
      window.location.href = window.location.origin + '/business-wars-simulator/#' + path;
    </script>
  </head>
  <body>
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center;">
        <h1>Redireccionando...</h1>
        <p>Si no eres redirigido automáticamente, <a href="/business-wars-simulator/">haz clic aquí</a>.</p>
      </div>
    </div>
  </body>
</html>`;

try {
    if (fs.existsSync(indexPath)) {
        fs.writeFileSync(errorPath, custom404Content);
        console.log('✅ 404.html creado exitosamente con redirección SPA.');
        console.log('📁 Ubicación:', errorPath);
    } else {
        console.error('❌ Error: index.html no se encontró en la carpeta dist.');
        console.log('📁 Buscando en:', indexPath);
    }
} catch (err) {
    console.error('❌ Error al crear 404.html:', err);
}