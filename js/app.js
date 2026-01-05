const URL_BASE = "http://localhost:8080/WSPacketWorld/PacketWorld/";

const btnConsultar = document.getElementById("btnConsultar");
const inputGuia = document.getElementById("numeroGuia");
const mensajeError = document.getElementById("mensajeError");

const infoEnvio = document.getElementById("infoEnvio");
const tarjetaPaquetes = document.getElementById("tarjetaPaquetes");
const tarjetaHistorial = document.getElementById("tarjetaHistorial");

btnConsultar.addEventListener("click", consultarEnvio);

async function consultarEnvio() {
    const guia = inputGuia.value.trim();
    mensajeError.textContent = "";

    infoEnvio.classList.add("hidden");
    tarjetaPaquetes.classList.add("hidden");
    tarjetaHistorial.classList.add("hidden");

    if (guia === "") {
        mensajeError.textContent = "Ingresa un número de guía válido.";
        return;
    }

    try {
        // 🔹 Consultar envío
        const resEnvio = await fetch(`${URL_BASE}envio/buscar/${guia}`);
        if (!resEnvio.ok) throw new Error("Envío no encontrado");
        const envio = await resEnvio.json();

        mostrarEnvio(envio);
        mostrarPaquetes(envio.paquetes);

        // 🔹 Consultar historial
        const resHistorial = await fetch(`${URL_BASE}envio/historial/${guia}`);
        if (resHistorial.ok) {
            const lista = await resHistorial.json();
            mostrarHistorial(lista);
        }

    } catch (error) {
        console.error(error);
        mensajeError.textContent = "No se encontró información para ese número de guía.";
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

function mostrarPaquetes(lista) {
    const contenedor = document.getElementById("listaPaquetes");
    contenedor.innerHTML = "";

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = "<div class='mini-card'>Sin paquetes registrados</div>";
    } else {
        lista.forEach(pkg => {
            const div = document.createElement("div");
            div.className = "mini-card";
            div.innerHTML = `
                <strong>${pkg.descripcion}</strong><br>
                Peso: ${pkg.peso} kg<br>
                Dimensiones: ${pkg.alto}x${pkg.ancho}x${pkg.profundidad} cm
            `;
            contenedor.appendChild(div);
        });
    }

    tarjetaPaquetes.classList.remove("hidden");
}

function mostrarHistorial(lista) {
    const contenedor = document.getElementById("listaHistorial");
    contenedor.innerHTML = "";

    if (!lista || lista.length === 0) {
        // Mensaje de error con imagen
        contenedor.innerHTML = `
            <div class="error-con-imagen">
                <img src="img/logo-packetworld.png" alt="Packet World">
                <p>No hay historial disponible</p>
            </div>
        `;
    } else {
        lista.forEach(item => {
            const div = document.createElement("div");
            div.className = "mini-card";

            // Asignar clase según estado
            switch ((item.estatusNombre || "").toLowerCase()) {
                case "entregado":
                    div.classList.add("estado-entregado");
                    break;
                case "cancelado":
                    div.classList.add("estado-cancelado");
                    break;
                case "detenido":
                    div.classList.add("estado-detenido");
                    break;
                case "en tránsito":
                case "transito":
                    div.classList.add("estado-transito");
                    break;
            }

            div.innerHTML = `
                <strong>${item.estatusNombre || "Sin estatus"}</strong><br>
                ${item.comentario || "Sin comentario"}<br>
                <small>${item.fechaCambio}</small>
            `;
            contenedor.appendChild(div);
        });
    }

    tarjetaHistorial.classList.remove("hidden");
}

// Para mensajes de error general (envío no encontrado)
function mostrarErrorGeneral(mensaje) {
    const contenedor = document.getElementById("infoEnvio");
    contenedor.innerHTML = `
        <div class="error-con-imagen">
            <img src="img/logo-packetworld.png" alt="Packet World">
            <p>${mensaje}</p>
        </div>
    `;
    contenedor.classList.remove("hidden");
}



