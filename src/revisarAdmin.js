function revisarAdmin(req, res, next) {
    const clave = req.headers["x-clave"];

    if (clave !== process.env.CLAVE_ADMIN) {
        return res.status(401).json({ error: "Necesitas entrar como administrador" });
    }

    next();
}

module.exports = revisarAdmin;
