const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
    const { usuario, clave } = req.body;

    if (usuario === process.env.ADMIN_USUARIO && clave === process.env.ADMIN_CLAVE) {
        return res.json({
            mensaje: "Bienvenido",
            clave: process.env.CLAVE_ADMIN
        });
    }

    res.status(401).json({ error: "Usuario o clave incorrectos" });
});

module.exports = router;
