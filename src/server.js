const express = require('express');
const path = require('path');
const app = express();

// Indicamos que los archivos estáticos se encuentran en la carpeta raíz (o en una carpeta específica)
app.use(express.static(path.join(__dirname)));

// Iniciamos el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
