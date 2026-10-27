
function precio(valor) {
    return "$ " + valor.toLocaleString("es-CO");
}

function imagenDe(producto) {
    if (!producto.imagen) {
        return "img/sin-imagen.svg";
    }

    return producto.imagen;
}

function leerCarrito() {
    const guardado = localStorage.getItem("carrito");

    if (!guardado) {
        return [];
    }

    return JSON.parse(guardado);
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    pintarContador();
}

function agregarAlCarrito(producto, cantidad) {
    const carrito = leerCarrito();
    const repetido = carrito.find(item => item.id === producto.id);

    if (repetido) {
        repetido.cantidad = repetido.cantidad + cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: imagenDe(producto),
            cantidad: cantidad
        });
    }

    guardarCarrito(carrito);
}

function pintarContador() {
    const globo = document.getElementById("contador");

    if (!globo) {
        return;
    }

    let total = 0;

    leerCarrito().forEach(item => {
        total = total + item.cantidad;
    });

    globo.textContent = total;
}

pintarContador();
