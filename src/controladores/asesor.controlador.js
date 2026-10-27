const OpenAI = require("openai");
const { coleccion } = require("../basededatos");

const apiKey = process.env.OPENAI_API_KEY;
const hayLlave = apiKey && apiKey.startsWith("sk-");

let openai;
if (hayLlave) {
    openai = new OpenAI({ apiKey: apiKey });
}

const INSTRUCCIONES = `Eres el asesor virtual de BellaZona, una tienda de maquillaje y productos de belleza.
Responde unicamente sobre los productos del catalogo y sobre como usar la pagina (buscar, carrito, comprar).
Si preguntan otra cosa responde: "Solo puedo ayudarte con el catalogo de BellaZona".
Maximo 2 frases, en espanol y sin saludos largos. Los precios van en pesos colombianos.`;

async function responder(req, res) {
    const pregunta = req.body.pregunta;

    if (!pregunta || pregunta.trim() === "") {
        return res.status(400).json({ error: "Escribe una pregunta" });
    }

    // si no hay api key igual contesto con lo que encuentre en el catalogo
    if (!hayLlave) {
        return res.json({ respuesta: await buscarEnCatalogo(pregunta) });
    }

    try {
        const respuesta = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.3,
            max_tokens: 120,
            messages: [
                { role: "system", content: INSTRUCCIONES },
                { role: "system", content: "Catalogo: " + await resumenCatalogo() },
                { role: "user", content: pregunta.slice(0, 200) }
            ]
        });

        res.json({ respuesta: respuesta.choices[0].message.content });

    } catch (error) {
        console.error("Fallo el asesor:", error.message);
        res.json({ respuesta: await buscarEnCatalogo(pregunta) });
    }
}

// mando el catalogo cortito para no gastar tantos tokens
async function resumenCatalogo() {
    const productos = await coleccion("productos").find().toArray();

    return productos
        .map(p => `${p.nombre} (${p.categoria}) $${p.precio} stock ${p.stock}`)
        .join(" | ");
}

// respuesta de reserva, busca por palabras en el nombre o la categoria
async function buscarEnCatalogo(pregunta) {
    const productos = await coleccion("productos").find().toArray();
    // le quito los signos a la pregunta y me quedo con las palabras largas
    const palabras = pregunta
        .toLowerCase()
        .replace(/[^a-z0-9ñ ]/g, " ")
        .split(" ")
        .filter(palabra => palabra.length >= 3);

    // cuento cuantas palabras de la pregunta coincide cada producto
    const encontrados = [];

    for (const p of productos) {
        const texto = (p.nombre + " " + p.categoria).toLowerCase();
        let puntos = 0;

        palabras.forEach(palabra => {
            if (texto.includes(palabra)) {
                puntos++;
            }
        });

        if (puntos > 0) {
            encontrados.push({ producto: p, puntos: puntos });
        }
    }

    encontrados.sort((a, b) => b.puntos - a.puntos);

    if (encontrados.length === 0) {
        return "Solo puedo ayudarte con el catalogo de BellaZona. Tenemos productos Ani-k para rostro, ojos y labios, y brochas.";
    }

    const lista = encontrados
        .slice(0, 3)
        .map(r => r.producto.nombre + " por $" + r.producto.precio.toLocaleString("es-CO"))
        .join(", ");

    return "En el catalogo tenemos: " + lista + ".";
}

module.exports = { responder };
