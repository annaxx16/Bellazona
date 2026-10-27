const caja = document.getElementById("detalle");

const direccion = new URLSearchParams(window.location.search);
const idProducto = direccion.get("id");

let productoActual = null;

async function cargarProducto() {

    try {
        const respuesta = await fetch("/api/productos/" + idProducto);

        if (!respuesta.ok) {
            caja.innerHTML = "<p class='texto-gris'>No encontramos ese producto.</p>";
            return;
        }

        productoActual = await respuesta.json();
        mostrarProducto(productoActual);

    } catch (error) {
        console.error(error);
        caja.innerHTML = "<p class='texto-gris'>Hubo un error cargando el producto.</p>";
    }
}

function mostrarProducto(producto) {

    document.title = producto.nombre + " | BellaZona";

    const agotado = producto.stock === 0;

    caja.innerHTML = `
        <div class="detalle">
            <div class="foto">
                <img src="${imagenDe(producto)}" alt="${producto.nombre}">
            </div>

            <div>
                <span class="etiqueta">${producto.categoria}</span>
                <h1>${producto.nombre}</h1>
                <span class="precio">${precio(producto.precio)}</span>
                <p>${producto.descripcion}</p>

                <div class="caja">
                    <p class="stock">${agotado ? "Producto agotado" : "Quedan " + producto.stock + " unidades"}</p>

                    <div class="fila-cantidad">
                        <label for="cantidad" class="texto-gris">Cantidad</label>
                        <input type="number" id="cantidad" value="1" min="1" max="${producto.stock}">
                    </div>

                    <button class="boton ancho" id="boton-agregar" ${agotado ? "disabled" : ""}>Agregar al carrito</button>
                    <button class="boton borde ancho" id="boton-comprar" style="margin-top: 10px;" ${agotado ? "disabled" : ""}>Comprar ahora</button>

                    <p class="texto-gris" id="aviso-producto" style="margin-bottom: 0;"></p>
                </div>
            </div>
        </div>
    `;

    document.getElementById("boton-agregar").addEventListener("click", () => {
        guardar();
        document.getElementById("aviso-producto").textContent = "Producto agregado al carrito";
    });

    document.getElementById("boton-comprar").addEventListener("click", () => {
        guardar();
        window.location.href = "carrito.html";
    });
}

function guardar() {
    const cantidad = Number(document.getElementById("cantidad").value);

    if (cantidad < 1) {
        return;
    }

    agregarAlCarrito(productoActual, cantidad);
}

cargarProducto();
