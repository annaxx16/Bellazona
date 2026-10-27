const fs = require("fs");
const path = require("path");
const { coleccion } = require("../basededatos");

const CARPETA_IMG = path.join(__dirname, "..", "..", "public", "img");

// dejo escondido el _id de mongo, al front le sirve con el id normal
const SIN_ID = { projection: { _id: 0 } };

function productos() {
    return coleccion("productos");
}

// devuelve el catalogo, se puede filtrar por categoria o por nombre
async function listarProductos(req, res) {
    const filtro = {};

    const categoria = req.query.categoria;
    const buscar = req.query.buscar;

    if (categoria && categoria !== "todas") {
        filtro.categoria = categoria;
    }

    if (buscar) {
        filtro.nombre = { $regex: buscar, $options: "i" };
    }

    const lista = await productos().find(filtro, SIN_ID).sort({ id: 1 }).toArray();
    res.json(lista);
}

async function verProducto(req, res) {
    const id = Number(req.params.id);

    const producto = await productos().findOne({ id: id }, SIN_ID);

    if (!producto) {
        return res.status(404).json({ error: "Ese producto no existe" });
    }

    res.json(producto);
}

async function crearProducto(req, res) {
    const datos = req.body;

    const error = revisarDatos(datos);
    if (error) {
        return res.status(400).json({ error: error });
    }

    const nuevo = {
        id: await siguienteId(),
        nombre: datos.nombre.trim(),
        categoria: datos.categoria,
        precio: Number(datos.precio),
        stock: Number(datos.stock),
        descripcion: datos.descripcion ? datos.descripcion.trim() : "",
        imagen: imagenDelFormulario(req)
    };

    await productos().insertOne(nuevo);
    delete nuevo._id;

    console.log("Producto nuevo:", nuevo.nombre);
    res.status(201).json(nuevo);
}

async function editarProducto(req, res) {
    const id = Number(req.params.id);
    const datos = req.body;

    const anterior = await productos().findOne({ id: id });

    if (!anterior) {
        return res.status(404).json({ error: "Ese producto no existe" });
    }

    const error = revisarDatos(datos);
    if (error) {
        return res.status(400).json({ error: error });
    }

    const imagen = imagenDelFormulario(req);

    const cambios = {
        nombre: datos.nombre.trim(),
        categoria: datos.categoria,
        precio: Number(datos.precio),
        stock: Number(datos.stock),
        descripcion: datos.descripcion ? datos.descripcion.trim() : "",
        // si no mandaron imagen nueva se queda con la que ya tenia
        imagen: imagen ? imagen : anterior.imagen
    };

    await productos().updateOne({ id: id }, { $set: cambios });

    // si cambiaron la imagen borro la vieja para no llenar la carpeta
    if (imagen && imagen !== anterior.imagen) {
        await borrarImagen(anterior.imagen);
    }

    res.json(Object.assign({ id: id }, cambios));
}

async function borrarProducto(req, res) {
    const id = Number(req.params.id);

    const producto = await productos().findOne({ id: id });

    if (!producto) {
        return res.status(404).json({ error: "Ese producto no existe" });
    }

    await productos().deleteOne({ id: id });
    await borrarImagen(producto.imagen);

    res.json({ mensaje: "Producto eliminado", producto: { id: producto.id, nombre: producto.nombre } });
}

// ---- funciones de apoyo ----

// busco el id mas alto que haya y le sumo uno
async function siguienteId() {
    const ultimo = await productos().find().sort({ id: -1 }).limit(1).toArray();

    if (ultimo.length === 0) {
        return 1;
    }

    return ultimo[0].id + 1;
}

function revisarDatos(datos) {
    if (!datos.nombre || datos.nombre.trim().length < 3) {
        return "El nombre debe tener al menos 3 letras";
    }

    if (!datos.categoria) {
        return "Falta la categoria";
    }

    if (isNaN(datos.precio) || Number(datos.precio) <= 0) {
        return "El precio tiene que ser un numero mayor a 0";
    }

    if (isNaN(datos.stock) || Number(datos.stock) < 0) {
        return "El stock no puede ser negativo";
    }

    return null;
}

// la imagen puede llegar como archivo subido o como un link
function imagenDelFormulario(req) {
    if (req.file) {
        return "img/" + req.file.filename;
    }

    if (req.body.imagen && req.body.imagen.trim() !== "") {
        return req.body.imagen.trim();
    }

    return "";
}

// borra el archivo de la imagen si esta en public/img y ningun otro producto la usa
async function borrarImagen(imagen) {
    if (!imagen || !imagen.startsWith("img/") || imagen === "img/sin-imagen.svg") {
        return;
    }

    const otroLaUsa = await productos().findOne({ imagen: imagen });
    if (otroLaUsa) {
        return;
    }

    const ruta = path.join(CARPETA_IMG, path.basename(imagen));

    if (fs.existsSync(ruta)) {
        fs.unlinkSync(ruta);
    }
}

module.exports = {
    listarProductos,
    verProducto,
    crearProducto,
    editarProducto,
    borrarProducto
};
