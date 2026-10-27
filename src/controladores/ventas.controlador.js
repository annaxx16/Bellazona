const { coleccion } = require("../basededatos");

// guarda la compra que hace el cliente y le baja el stock a los productos
async function crearVenta(req, res) {
    const { cliente, correo, direccion, items } = req.body;

    if (!cliente || !correo || !direccion) {
        return res.status(400).json({ error: "Faltan los datos del cliente" });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "El carrito esta vacio" });
    }

    const productos = coleccion("productos");
    const comprados = [];
    let total = 0;

    // primero reviso que todos los productos existan y tengan stock
    for (const item of items) {
        const producto = await productos.findOne({ id: Number(item.id) });

        if (!producto) {
            return res.status(404).json({ error: "Hay un producto que ya no esta disponible" });
        }

        const cantidad = Number(item.cantidad);

        if (cantidad > producto.stock) {
            return res.status(400).json({
                error: "Solo quedan " + producto.stock + " unidades de " + producto.nombre
            });
        }

        total = total + (producto.precio * cantidad);

        comprados.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad
        });
    }

    // si todo salio bien, ahora si descuento el stock de cada uno
    for (const compra of comprados) {
        await productos.updateOne({ id: compra.id }, { $inc: { stock: -compra.cantidad } });
    }

    const ventas = coleccion("ventas");
    const numero = (await ventas.countDocuments()) + 1;

    const venta = {
        numero: numero,
        fecha: new Date().toLocaleString("es-CO"),
        cliente: cliente,
        correo: correo,
        direccion: direccion,
        items: comprados,
        total: total
    };

    await ventas.insertOne(venta);
    delete venta._id;

    console.log("Compra numero", venta.numero, "por", total);
    res.status(201).json(venta);
}

// esta la usa el administrador para ver las compras, de la mas nueva a la mas vieja
async function listarVentas(req, res) {
    const ventas = await coleccion("ventas")
        .find({}, { projection: { _id: 0 } })
        .sort({ numero: -1 })
        .toArray();

    res.json(ventas);
}

module.exports = { crearVenta, listarVentas };
