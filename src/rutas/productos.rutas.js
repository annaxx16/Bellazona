const express = require("express");
const multer = require("multer");
const path = require("path");

const revisarAdmin = require("../revisarAdmin");

const {
    listarProductos,
    verProducto,
    crearProducto,
    editarProducto,
    borrarProducto
} = require("../controladores/productos.controlador");

const router = express.Router();

// las imagenes que sube el admin se guardan en public/img
const guardarImagen = multer.diskStorage({
    destination: path.join(__dirname, "..", "..", "public", "img"),
    filename: function (req, archivo, listo) {
        const nombre = Date.now() + path.extname(archivo.originalname);
        listo(null, nombre);
    }
});

// solo dejo pasar imagenes, si suben otra cosa lo rechazo
function soloImagenes(req, archivo, listo) {
    if (archivo.mimetype.startsWith("image/")) {
        listo(null, true);
    } else {
        listo(new Error("El archivo tiene que ser una imagen (jpg, png o webp)"));
    }
}

const subir = multer({
    storage: guardarImagen,
    fileFilter: soloImagenes,
    limits: { fileSize: 2 * 1024 * 1024 }
});

router.get("/", listarProductos);
router.get("/:id", verProducto);

router.post("/", revisarAdmin, subir.single("imagenArchivo"), crearProducto);
router.put("/:id", revisarAdmin, subir.single("imagenArchivo"), editarProducto);
router.delete("/:id", revisarAdmin, borrarProducto);

module.exports = router;
