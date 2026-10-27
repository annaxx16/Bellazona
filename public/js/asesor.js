// chat del asesor virtual, lo armo con javascript para no repetir el html en cada pagina

document.body.insertAdjacentHTML("beforeend", `
    <button id="boton-asesor">Asesor virtual</button>

    <div id="panel-asesor" class="escondido">
        <div class="asesor-top">
            Asesor BellaZona
            <small>Solo respondo sobre el catalogo de la tienda</small>
        </div>

        <div id="mensajes">
            <div class="mensaje bot">Hola, preguntame por precios, polvos, labiales o cremas.</div>
        </div>

        <form class="asesor-abajo" id="form-asesor">
            <input type="text" id="pregunta" placeholder="Escribe tu pregunta" autocomplete="off">
            <button class="boton chico" type="submit">Enviar</button>
        </form>
    </div>
`);

const botonAsesor = document.getElementById("boton-asesor");
const panelAsesor = document.getElementById("panel-asesor");
const mensajes = document.getElementById("mensajes");
const formAsesor = document.getElementById("form-asesor");
const campoPregunta = document.getElementById("pregunta");

botonAsesor.addEventListener("click", () => {
    panelAsesor.classList.toggle("escondido");
    campoPregunta.focus();
});

formAsesor.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const pregunta = campoPregunta.value.trim();

    if (pregunta === "") {
        return;
    }

    escribirMensaje(pregunta, "yo");
    campoPregunta.value = "";

    const esperando = escribirMensaje("Pensando...", "bot");

    try {
        const respuesta = await fetch("/api/asesor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pregunta: pregunta })
        });

        const datos = await respuesta.json();
        esperando.textContent = datos.respuesta || datos.error;

    } catch (error) {
        console.error(error);
        esperando.textContent = "No pude responder en este momento";
    }

    mensajes.scrollTop = mensajes.scrollHeight;
});

function escribirMensaje(texto, quien) {
    const globo = document.createElement("div");
    globo.className = "mensaje " + quien;
    globo.textContent = texto;

    mensajes.appendChild(globo);
    mensajes.scrollTop = mensajes.scrollHeight;

    return globo;
}
