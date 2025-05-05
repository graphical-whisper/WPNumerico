const express = require("express")
const path = require("path")
const app = express()
const PORT = 3000

// Servir archivos estáticos desde el directorio actual
app.use(express.static(path.join(__dirname)))

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
  console.log(`¡Secante Birds está listo para jugar!`)
})
