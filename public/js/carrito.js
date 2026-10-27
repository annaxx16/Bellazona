const lista = document.getElementById("lista-carrito");
const cajaTotal = document.getElementById("caja-total");
const formCompra = document.getElementById("form-compra");
const mensajeCompra = document.getElementById("mensaje-compra");

function mostrarCarrito() {
    const carrito = leerCarrito();

    if (carrito.length === 0) {
        lista.innerHTML = "<p class='texto-gris'>Todavia no has agregado productos. <a href='index.html' style='text-decoration: underline;'>Ir al catalogo</a></p>";
        cajaTotal.innerHTML = "";
        return;
    }

    lista.innerHTML = "";
    let total = 0;

    carrito.forEach((item, posicion) => {
        total = total + (item.precio * item.cantidad);

        const fila = document.createElement("div");
        fila.className = "item-carrito";

        fila.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}">
            <div class="info">
                <h4>${item.nombre}</h4>
                <p class="stock" style="margin: 0;">${item.cantidad} x ${precio(item.precio)}</p>
            </div>
            <div style="text-align: right;">
                <div class="precio">${precio(item.precio * item.cantidad)}</div>
                <button class="boton rojo chico" data-posicion="${posicion}" style="margin-top: 8px;">Quitar</button>
            </div>
        `;

        lista.appendChild(fila);
    });

    cajaTotal.innerHTML = "<span>Total</span><span>" + precio(total) + "</span>";

    document.querySelectorAll("[data-posicion]").forEach(boton => {
        boton.addEventListener("click", () => {
            quitar(Number(boton.dataset.posicion));
        });
    });
}

function quitar(posicion) {
    const carrito = leerCarrito();
    carrito.splice(posicion, 1);
    guardarCarrito(carrito);
    mostrarCarrito();
}

formCompra.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const carrito = leerCarrito();

    if (carrito.length === 0) {
        mensajeCompra.textContent = "Tu carrito esta vacio";
        return;
    }

    const compra = {
        cliente: document.getElementById("cliente").value,
        correo: document.getElementById("correo").value,
        direccion: document.getElementById("direccion").value,
        items: carrito.map(item => {
            return { id: item.id, cantidad: item.cantidad };
        })
    };

    try {
        const respuesta = await fetch("/api/ventas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(compra)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensajeCompra.textContent = datos.error;
            return;
        }

        localStorage.removeItem("carrito");
        pintarContador();
        mostrarCarrito();

        formCompra.reset();
        mensajeCompra.textContent = "Compra numero " + datos.numero + " registrada. Total " + precio(datos.total) + ". Gracias por comprar en BellaZona.";

    } catch (error) {
        console.error(error);
        mensajeCompra.textContent = "No se pudo registrar la compra";
    }
});

mostrarCarrito();
