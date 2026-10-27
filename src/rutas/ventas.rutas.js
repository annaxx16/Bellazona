const express = require("express");

const revisarAdmin = require("../revisarAdmin");
const { crearVenta, listarVentas } = require("../controladores/ventas.controlador");

const router = express.Router();

router.post("/", crearVenta);
router.get("/", revisarAdmin, listarVentas);

module.exports = router;
