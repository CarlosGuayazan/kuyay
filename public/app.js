// ===== Lógica de la página (corre en el navegador) =====
//
// Este código NO conoce tu clave secreta. Solo le habla a nuestro
// intermediario seguro en /api/consultar, que es quien tiene la clave.

const formulario = document.getElementById("formulario");
const resultado = document.getElementById("resultado");
const botonBuscar = document.getElementById("botonBuscar");

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  // Recogemos lo que escribió el usuario.
  const datos = {
    numeroReserva: document.getElementById("numeroReserva").value.trim(),
    email: document.getElementById("email").value.trim(),
    nombre: document.getElementById("nombre").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
  };

  // Validación: al menos un dato.
  if (!datos.numeroReserva && !datos.email && !datos.nombre && !datos.telefono) {
    mostrarMensaje("Por favor ingresa al menos un dato para buscar.", true);
    return;
  }

  // Estado "cargando".
  botonBuscar.disabled = true;
  botonBuscar.textContent = "Buscando...";
  mostrarMensaje("Consultando tu reservación, un momento...");

  try {
    const respuesta = await fetch("/api/consultar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const json = await respuesta.json();

    if (json.error) {
      mostrarMensaje(json.error, true);
    } else if (json.encontrada) {
      mostrarReserva(json.reserva);
    } else {
      mostrarMensaje(
        json.mensaje || "No se encontró ninguna reservación.",
        false
      );
    }
  } catch (err) {
    mostrarMensaje(
      "Hubo un problema de conexión. Intenta de nuevo en unos segundos.",
      true
    );
  } finally {
    botonBuscar.disabled = false;
    botonBuscar.textContent = "Buscar reservación";
  }
});

// Muestra un mensaje simple (informativo o de error).
function mostrarMensaje(texto, esError = false) {
  resultado.classList.remove("oculto");
  resultado.innerHTML = `<div class="mensaje ${
    esError ? "error" : ""
  }">${escaparHtml(texto)}</div>`;
}

// Dibuja la tarjeta bonita con los datos de la reservación.
function mostrarReserva(r) {
  const huesped = r.holder || {};
  const nombreCompleto = [huesped.name, huesped.surname, huesped.second_surname]
    .filter(Boolean)
    .join(" ");

  // Si el check-in AÚN no está hecho, preparamos el botón para realizarlo.
  // Construimos la URL con el número de reserva y el correo del huésped.
  let bloqueCheckin = "";
  if (!r.checked_in) {
    const urlCheckin =
      "https://checkin.lobbypms.com/welcome" +
      `?codigo=${encodeURIComponent(r.booking_id)}` +
      `&email=${encodeURIComponent(huesped.email || "")}` +
      "&lg=es";
    bloqueCheckin = `
      <a class="boton-checkin" href="${urlCheckin}">
        ✅ Realizar mi check-in en línea
      </a>`;
  } else {
    bloqueCheckin = `
      <p class="checkin-listo">✔️ Tu check-in ya está realizado.</p>`;
  }

  resultado.classList.remove("oculto");
  resultado.innerHTML = `
    <div class="tarjeta-reserva">
      <header>
        <h2>Reservación #${escaparHtml(r.booking_id)}</h2>
        <span>${escaparHtml(r.channel?.name || "Reserva directa")}</span>
      </header>
      <div class="cuerpo-reserva">
        ${fila("Huésped", nombreCompleto || "—")}
        ${fila("Correo", huesped.email || "—")}
        ${fila("Teléfono", huesped.phone || "—")}
        ${fila("País", huesped.country || "—")}
        ${fila("Habitación", `${r.assigned_room?.name || "—"} (${r.assigned_room?.type || "—"})`)}
        ${fila("Entrada (check-in)", formatearFecha(r.start_date))}
        ${fila("Salida (check-out)", formatearFecha(r.end_date))}
        ${fila("Huéspedes", r.total_guests ?? "—")}
        ${fila("Total a pagar", formatearDinero(r.total_to_pay))}
        ${fila("Pagado", formatearDinero(r.paid_out))}
        ${fila("Check-in realizado", estado(r.checked_in))}
        ${fila("Check-out realizado", estado(r.checked_out))}
        ${bloqueCheckin}
      </div>
    </div>
  `;
}

// ---- Pequeñas ayudas de formato ----

function fila(etiqueta, valor) {
  return `
    <div class="fila">
      <span class="etiqueta">${escaparHtml(etiqueta)}</span>
      <span class="valor">${valor}</span>
    </div>`;
}

function estado(valor) {
  return valor
    ? `<span class="etiqueta-estado estado-si">Sí</span>`
    : `<span class="etiqueta-estado estado-no">No</span>`;
}

function formatearFecha(fecha) {
  if (!fecha) return "—";
  try {
    const d = new Date(fecha + "T00:00:00");
    return d.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (_) {
    return fecha;
  }
}

function formatearDinero(monto) {
  if (monto === null || monto === undefined) return "—";
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(monto);
  } catch (_) {
    return monto;
  }
}

// Evita problemas de seguridad al insertar texto en la página.
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
