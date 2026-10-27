const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const nombreBD = process.env.MONGO_BD || "bellazona";

const cliente = new MongoClient(url);
let baseDatos = null;

async function conectar() {
    await cliente.connect();
    baseDatos = cliente.db(nombreBD);
    console.log("Base de datos conectada:", nombreBD);
}

function coleccion(nombre) {
    return baseDatos.collection(nombre);
}

module.exports = { conectar, coleccion };
