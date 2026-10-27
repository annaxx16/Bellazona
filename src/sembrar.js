const fs = require("fs");
const path = require("path");
const { coleccion } = require("./basededatos");

async function sembrar() {
    const productos = coleccion("productos");
    const cuantos = await productos.countDocuments();

    if (cuantos > 0) {
        return;
    }

    const ruta = path.join(__dirname, "..", "datos", "productos.json");
    const iniciales = JSON.parse(fs.readFileSync(ruta, "utf-8"));

    await productos.insertMany(iniciales);
    console.log("Se cargaron", iniciales.length, "productos de ejemplo");
}

module.exports = sembrar;
