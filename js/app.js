const URL_BASE = "http://localhost:8080/WSPacketWorld/PacketWorld/";

const btnConsultar = document.getElementById("btnConsultar");
const inputGuia = document.getElementById("numeroGuia");
const mensajeError = document.getElementById("mensajeError");

const infoEnvio = document.getElementById("infoEnvio");
const historial = document.getElementById("historial");

btnConsultar.addEventListener("click", consultarEnvio);

async function consultarEnvio() {
    const guia = inputGuia.value.trim();
    mensajeError.textContent = "";

    infoEnvio.classList.add("hidden");
    historial.classList.add("hidden");

    if (guia === "") {
        mensajeError.textContent = "Ingresa un número de guía válido.";
        return;
    }

    try {
        // 🔹 1. Consultar envío
        const resEnvio = await fetch(`${URL_BASE}envio/buscar/${guia}`);
        if (!resEnvio.ok) throw new Error("Envío no encontrado");

        const envio = await resEnvio.json();
        mostrarEnvio(envio);

        // 🔹 2. Consultar historial usando el nuevo endpoint por número de guía
        const resHistorial = await fetch(`${URL_BASE}envio/historial/${guia}`);
        if (resHistorial.ok) {
            const lista = await resHistorial.json();
            mostrarHistorial(lista);
        } else {
            console.warn("Historial no disponible");
        }

    } catch (error) {
        console.error(error);
        mensajeError.textContent =
            "No se encontró información para ese número de guía.";
    }
}

function mostrarEnvio(envio) {
    document.getElementById("lblGuia").textContent = envio.numeroGuia;
    document.getElementById("lblDestinatario").textContent = envio.nombreDestinatario;
    document.getElementById("lblDireccion").textContent =
        `${envio.calleDestino} ${envio.numeroDestino}`;
    document.getElementById("lblEstatus").textContent = envio.estatus;

    infoEnvio.classList.remove("hidden");
}

function mostrarHistorial(lista) {
    const ul = document.getElementById("listaHistorial");
    ul.innerHTML = "";

    if (!lista || lista.length === 0) {
        ul.innerHTML = "<li>Sin historial disponible</li>";
    } else {
        lista.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${item.estatusNombre}</strong><br>
                ${item.comentario || "Sin comentario"}<br>
                <small>${item.fechaCambio}</small>
            `;
            ul.appendChild(li);
        });
    }

    historial.classList.remove("hidden");
}
