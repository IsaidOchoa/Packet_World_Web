const URL_BASE = "http://localhost:8080/WSPacketWorld/PacketWorld/";

const btnConsultar = document.getElementById("btnConsultar");
const inputGuia = document.getElementById("numeroGuia");
const mensajeError = document.getElementById("mensajeError");

const infoEnvio = document.getElementById("infoEnvio");
const tarjetaPaquetes = document.getElementById("tarjetaPaquetes");
const tarjetaHistorial = document.getElementById("tarjetaHistorial");

//Limpiar entrada: solo letras, números, guion (-) y guion bajo (_)
inputGuia.addEventListener('input', function () {
    this.value = this.value.replace(/[^A-Za-z0-9\-_]/g, '');
});

btnConsultar.addEventListener("click", consultarEnvio);

async function consultarEnvio() {
    let guia = inputGuia.value.trim();

    mensajeError.textContent = "";
    infoEnvio.classList.add("hidden");
    tarjetaPaquetes.classList.add("hidden");
    tarjetaHistorial.classList.add("hidden");

    if (guia === "") {
        mostrarErrorGeneral("Ingresa un número de guía válido.");
        return;
    }

    if (guia.length > 20) {
        mostrarErrorGeneral("El número de guía no puede tener más de 20 caracteres.");
        return;
    }

    try {
        //Consultar envío
        const resEnvio = await fetch(`${URL_BASE}envio/buscar/${guia}`);
        if (!resEnvio.ok) throw new Error("Envío no encontrado");
        const envio = await resEnvio.json();

        //Éxito: mostrar datos reales
        mostrarEnvio(envio);
        mostrarPaquetes(envio.paquetes);

        //Consultar historial
        const resHistorial = await fetch(`${URL_BASE}envio/historial/${guia}`);
        if (resHistorial.ok) {
            const lista = await resHistorial.json();
            mostrarHistorial(lista);
        }

    } catch (error) {
        console.error(error);
        mostrarErrorGeneral("No se encontró información para ese número de guía.");
    }
}

function mostrarEnvio(envio) {
    const contenedor = document.getElementById("infoEnvio");
    contenedor.innerHTML = `
        <h3>Información del envío</h3>
        <p><strong>Número de guía:</strong> <span>${envio.numeroGuia}</span></p>
        <p><strong>Destinatario:</strong> <span>${envio.nombreDestinatario}</span></p>
        <p><strong>Dirección:</strong> <span>${envio.calleDestino} ${envio.numeroDestino}</span></p>
        <p><strong>Estatus actual:</strong> <span>${envio.estatus}</span></p>
    `;
    contenedor.classList.remove("hidden");
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
        contenedor.innerHTML = `
            <div class="error-con-imagen">
                <img src="assets/img/logo-packetworld.png" alt="Packet World">
                <p>No hay historial disponible</p>
            </div>
        `;
    } else {
        lista.forEach(item => {
            const div = document.createElement("div");
            div.className = "mini-card";

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
                <div class="fecha-historial">${formatearFecha(item.fechaCambio)}</div>
            `;
            contenedor.appendChild(div);
        });
    }

    tarjetaHistorial.classList.remove("hidden");
}

// Función para formatear fechas ISO a formato humano en español
function formatearFecha(fechaISO) {
    try {
        const date = new Date(fechaISO);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        return "Fecha inválida";
    }
}

function mostrarErrorGeneral(mensaje) {
    const contenedor = document.getElementById("infoEnvio");
    contenedor.innerHTML = `
        <div class="error-con-imagen">
            <img src="assets/img/ic_logo_packet_world.png" alt="Packet World">
            <p>${mensaje}</p>
        </div>
    `;
    contenedor.classList.remove("hidden");
}