require("dotenv").config({ quiet: true });

const express = require("express");
const path = require("path");

const { conectar } = require("./src/basededatos");
const sembrar = require("./src/sembrar");

const productosRutas = require("./src/rutas/productos.rutas");
const ventasRutas = require("./src/rutas/ventas.rutas");
const asesorRutas = require("./src/rutas/asesor.rutas");
const sesionRutas = require("./src/rutas/sesion.rutas");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/productos", productosRutas);
app.use("/api/ventas", ventasRutas);
app.use("/api/asesor", asesorRutas);
app.use("/api/login", sesionRutas);

app.use((error, req, res, next) => {
    let mensaje = error.message || "Algo salio mal";

    if (error.code === "LIMIT_FILE_SIZE") {
        mensaje = "La imagen no puede pesar mas de 2 MB";
    }

    console.error("Error en el servidor:", mensaje);

    const responder = () => res.status(400).json({ error: mensaje });

    if (req.readableEnded) {
        responder();
    } else {
        req.resume();
        req.on("end", responder);
    }
});

conectar()
    .then(sembrar)
    .then(() => {
        app.listen(PORT, () => {
            console.log("BellaZona corriendo en http://localhost:" + PORT);
        });
    })
    .catch(error => {
        console.error("No pude conectar con MongoDB. Revisa que el servicio este corriendo.");
        console.error(error.message);
        process.exit(1);
    });
