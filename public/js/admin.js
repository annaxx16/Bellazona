const pantallaLogin = document.getElementById("pantalla-login");
const pantallaPanel = document.getElementById("pantalla-panel");
const formLogin = document.getElementById("form-login");
const errorLogin = document.getElementById("error-login");

const tablaProductos = document.getElementById("tabla-productos");
const tablaVentas = document.getElementById("tabla-ventas");
const formProducto = document.getElementById("form-producto");
const tituloForm = document.getElementById("titulo-form");
const botonCancelar = document.getElementById("boton-cancelar");
const aviso = document.getElementById("aviso");

let clave = localStorage.getItem("claveAdmin");
let productos = [];


formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = {
        usuario: document.getElementById("usuario").value,
        clave: document.getElementById("clave").value
    };

    try {
        const respuesta = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            errorLogin.textContent = resultado.error;
            return;
        }

        clave = resultado.clave;
        localStorage.setItem("claveAdmin", clave);
        abrirPanel();

    } catch (error) {
        console.error(error);
        errorLogin.textContent = "No se pudo conectar con el servidor";
    }
});

document.getElementById("boton-salir").addEventListener("click", () => {
    localStorage.removeItem("claveAdmin");
    window.location.reload();
});

function abrirPanel() {
    pantallaLogin.classList.add("escondido");
    pantallaPanel.classList.remove("escondido");

    cargarProductos();
    cargarVentas();
}


async function cargarProductos() {
    const respuesta = await fetch("/api/productos");
    productos = await respuesta.json();

    tablaProductos.innerHTML = "";

    productos.forEach(producto => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><img src="${imagenDe(producto)}" alt="${producto.nombre}"></td>
            <td>
                ${producto.nombre}
                <div class="stock" style="margin: 2px 0 0;">${producto.categoria}</div>
            </td>
            <td style="white-space: nowrap;">${precio(producto.precio)}</td>
            <td>${producto.stock}</td>
            <td style="white-space: nowrap;">
                <button class="boton borde chico" data-editar="${producto.id}">Editar</button>
                <button class="boton rojo chico" data-borrar="${producto.id}">Borrar</button>
            </td>
        `;

        tablaProductos.appendChild(fila);
    });

    document.querySelectorAll("[data-editar]").forEach(boton => {
        boton.addEventListener("click", () => llenarFormulario(Number(boton.dataset.editar)));
    });

    document.querySelectorAll("[data-borrar]").forEach(boton => {
        boton.addEventListener("click", () => borrar(Number(boton.dataset.borrar)));
    });
}

formProducto.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const id = document.getElementById("id-producto").value;
    const archivo = document.getElementById("imagenArchivo").files[0];

    const datos = new FormData();
    datos.append("nombre", document.getElementById("nombre").value);
    datos.append("categoria", document.getElementById("categoria").value);
    datos.append("precio", document.getElementById("precio").value);
    datos.append("stock", document.getElementById("stock").value);
    datos.append("descripcion", document.getElementById("descripcion").value);
    datos.append("imagen", document.getElementById("imagen").value);

    if (archivo) {
        datos.append("imagenArchivo", archivo);
    }

    const ruta = id ? "/api/productos/" + id : "/api/productos";
    const metodo = id ? "PUT" : "POST";

    try {
        const respuesta = await fetch(ruta, {
            method: metodo,
            headers: { "x-clave": clave },
            body: datos
        });

        const resultado = await respuesta.json();

        if (respuesta.status === 401) {
            cerrarPorSeguridad();
            return;
        }

        if (!respuesta.ok) {
            mostrarAviso(resultado.error);
            return;
        }

        mostrarAviso(id ? "Producto actualizado" : "Producto creado");
        limpiarFormulario();
        cargarProductos();

    } catch (error) {
        console.error(error);
        mostrarAviso("No se pudo guardar el producto");
    }
});

function llenarFormulario(id) {
    const producto = productos.find(p => p.id === id);

    document.getElementById("id-producto").value = producto.id;
    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("categoria").value = producto.categoria;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("stock").value = producto.stock;
    document.getElementById("descripcion").value = producto.descripcion;
    document.getElementById("imagen").value = producto.imagen;
    mostrarVistaPrevia(imagenDe(producto));

    tituloForm.textContent = "Editando: " + producto.nombre;
    botonCancelar.classList.remove("escondido");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function borrar(id) {
    const producto = productos.find(p => p.id === id);

    if (!confirm("Seguro que quieres borrar " + producto.nombre + "?")) {
        return;
    }

    const respuesta = await fetch("/api/productos/" + id, {
        method: "DELETE",
        headers: { "x-clave": clave }
    });

    if (respuesta.status === 401) {
        cerrarPorSeguridad();
        return;
    }

    mostrarAviso("Producto eliminado");
    limpiarFormulario();
    cargarProductos();
}

botonCancelar.addEventListener("click", limpiarFormulario);

function limpiarFormulario() {
    formProducto.reset();
    document.getElementById("id-producto").value = "";
    tituloForm.textContent = "Nuevo producto";
    botonCancelar.classList.add("escondido");
    mostrarVistaPrevia("");
}


const vistaPrevia = document.getElementById("vista-previa");

function mostrarVistaPrevia(ruta) {
    if (!ruta) {
        vistaPrevia.classList.add("escondido");
        vistaPrevia.src = "";
        return;
    }

    vistaPrevia.src = ruta;
    vistaPrevia.classList.remove("escondido");
}

document.getElementById("imagenArchivo").addEventListener("change", (evento) => {
    const archivo = evento.target.files[0];

    if (!archivo) {
        return;
    }

    if (archivo.size > 2 * 1024 * 1024) {
        mostrarAviso("La imagen no puede pesar mas de 2 MB");
        evento.target.value = "";
        return;
    }

    mostrarVistaPrevia(URL.createObjectURL(archivo));
});

document.getElementById("imagen").addEventListener("change", (evento) => {
    mostrarVistaPrevia(evento.target.value.trim());
});


async function cargarVentas() {
    const respuesta = await fetch("/api/ventas", {
        headers: { "x-clave": clave }
    });

    if (respuesta.status === 401) {
        cerrarPorSeguridad();
        return;
    }

    const ventas = await respuesta.json();

    if (ventas.length === 0) {
        tablaVentas.innerHTML = "<tr><td colspan='5' class='texto-gris'>Todavia no hay compras registradas</td></tr>";
        return;
    }

    tablaVentas.innerHTML = "";

    ventas.forEach(venta => {
        const nombres = venta.items.map(item => item.cantidad + " " + item.nombre).join(", ");

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${venta.numero}</td>
            <td>${venta.fecha}</td>
            <td>${venta.cliente}<div class="stock" style="margin: 2px 0 0;">${venta.correo}</div></td>
            <td>${nombres}</td>
            <td>${precio(venta.total)}</td>
        `;

        tablaVentas.appendChild(fila);
    });
}


function mostrarAviso(texto) {
    aviso.textContent = texto;
    aviso.classList.remove("escondido");

    setTimeout(() => aviso.classList.add("escondido"), 3000);
}

function cerrarPorSeguridad() {
    localStorage.removeItem("claveAdmin");
    alert("La sesion se cerro, vuelve a entrar");
    window.location.reload();
}

if (clave) {
    abrirPanel();
}
