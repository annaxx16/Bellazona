const express = require("express");
const { responder } = require("../controladores/asesor.controlador");

const router = express.Router();

router.post("/", responder);

module.exports = router;
