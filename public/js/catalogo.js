const grilla = document.getElementById("grilla");
const buscador = document.getElementById("buscador");
const resultados = document.getElementById("cantidad-resultados");
const chips = document.querySelectorAll(".chip");

let categoriaElegida = "todas";

async function cargarProductos() {

    try {
        const parametros = new URLSearchParams();
        parametros.append("categoria", categoriaElegida);

        if (buscador.value) {
            parametros.append("buscar", buscador.value);
        }

        const respuesta = await fetch("/api/productos?" + parametros.toString());
        const productos = await respuesta.json();

        mostrarProductos(productos);

    } catch (error) {
        console.error(error);
        resultados.textContent = "No se pudo cargar el catalogo";
    }
}

function mostrarProductos(productos) {

    if (productos.length === 0) {
        resultados.textContent = "No encontramos productos con esa busqueda";
        grilla.innerHTML = "";
        return;
    }

    resultados.textContent = productos.length + " productos disponibles";
    grilla.innerHTML = "";

    productos.forEach(producto => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        tarjeta.innerHTML = `
            <img src="${imagenDe(producto)}" alt="${producto.nombre}">
            <div class="cuerpo">
                <span class="etiqueta">${producto.categoria}</span>
                <h3>${producto.nombre}</h3>
                <div class="precio">${precio(producto.precio)}</div>
                <p class="stock">${textoStock(producto.stock)}</p>
                <a class="boton ancho" href="producto.html?id=${producto.id}">Ver producto</a>
            </div>
        `;

        grilla.appendChild(tarjeta);
    });
}

function textoStock(stock) {
    if (stock === 0) {
        return "Agotado";
    }

    if (stock < 5) {
        return "Ultimas " + stock + " unidades";
    }

    return stock + " unidades disponibles";
}

chips.forEach(chip => {
    chip.addEventListener("click", () => {

        chips.forEach(otro => otro.classList.remove("activo"));
        chip.classList.add("activo");

        categoriaElegida = chip.dataset.categoria;
        cargarProductos();
    });
});

buscador.addEventListener("keyup", cargarProductos);

cargarProductos();
