// ===== Lógica de la página (corre en el navegador) =====
//
// Este código NO conoce tu clave secreta. Solo le habla a nuestro
// intermediario seguro en /api/consultar, que es quien tiene la clave.
// Los textos visibles vienen de i18n.js (multi-idioma).

const formulario = document.getElementById("formulario");
const resultado = document.getElementById("resultado");
const botonBuscar = document.getElementById("botonBuscar");

// Atajo para traducir (si i18n no cargara, muestra la clave).
const T = (clave, vars) => (window.I18N ? I18N.t(clave, vars) : clave);
const LOCALE = () => (window.I18N ? I18N.locale : "es-CO");

// Guardamos la última reserva mostrada para volver a dibujarla
// si el huésped cambia de idioma.
let ultimaReserva = null;

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
    ultimaReserva = null;
    mostrarMensaje(T("msgValida"), true);
    return;
  }

  // Estado "cargando".
  botonBuscar.disabled = true;
  botonBuscar.textContent = T("btnBuscando");
  mostrarMensaje(T("msgCargando"));

  try {
    const respuesta = await fetch("/api/consultar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const json = await respuesta.json();

    if (json.error) {
      ultimaReserva = null;
      mostrarMensaje(json.error, true);
    } else if (json.encontrada) {
      ultimaReserva = json.reserva;
      mostrarReserva(json.reserva);
    } else {
      ultimaReserva = null;
      mostrarMensaje(T("msgNoEncontrada"), false);
    }
  } catch (err) {
    ultimaReserva = null;
    mostrarMensaje(T("msgConexion"), true);
  } finally {
    botonBuscar.disabled = false;
    botonBuscar.textContent = T("btnBuscar");
  }
});

// Si el huésped cambia de idioma, volvemos a dibujar la reserva mostrada.
if (window.I18N) {
  I18N.onChange(() => {
    if (ultimaReserva) mostrarReserva(ultimaReserva);
  });
}

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
  let bloqueCheckin = "";
  if (!r.checked_in) {
    const urlCheckin =
      "https://checkin.lobbypms.com/welcome" +
      `?codigo=${encodeURIComponent(r.booking_id)}` +
      `&email=${encodeURIComponent(huesped.email || "")}` +
      "&lg=es";
    bloqueCheckin = `
      <a class="boton-checkin" href="${urlCheckin}" target="_blank" rel="noopener noreferrer">
        ${T("btnCheckin")}
      </a>`;
  } else {
    bloqueCheckin = `
      <p class="checkin-listo">${T("checkinListo")}</p>`;
  }

  resultado.classList.remove("oculto");
  resultado.innerHTML = `
    <div class="tarjeta-reserva">
      <header>
        <h2>${T("rcReserva")} #${escaparHtml(r.booking_id)}</h2>
        <span>${escaparHtml(r.channel?.name || T("rcReservaDirecta"))}</span>
      </header>
      <div class="cuerpo-reserva">
        ${fila(T("rcHuesped"), nombreCompleto || "—")}
        ${fila(T("rcCorreo"), huesped.email || "—")}
        ${fila(T("rcTelefono"), huesped.phone || "—")}
        ${fila(T("rcPais"), huesped.country || "—")}
        ${fila(T("rcHabitacion"), `${r.assigned_room?.name || "—"} (${r.assigned_room?.type || "—"})`)}
        ${fila(T("rcEntrada"), formatearFecha(r.start_date))}
        ${fila(T("rcSalida"), formatearFecha(r.end_date))}
        ${fila(T("rcHuespedes"), r.total_guests ?? "—")}
        ${fila(T("rcTotal"), formatearDinero(r.total_to_pay))}
        ${fila(T("rcPagado"), formatearDinero(r.paid_out))}
        ${fila(T("rcCheckinReal"), estado(r.checked_in))}
        ${fila(T("rcCheckoutReal"), estado(r.checked_out))}
        ${bloqueCheckin}
        ${typeof construirSeccionPago === "function" ? construirSeccionPago(r) : ""}
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
    ? `<span class="etiqueta-estado estado-si">${T("estadoSi")}</span>`
    : `<span class="etiqueta-estado estado-no">${T("estadoNo")}</span>`;
}

function formatearFecha(fecha) {
  if (!fecha) return "—";
  try {
    const d = new Date(fecha + "T00:00:00");
    return d.toLocaleDateString(LOCALE(), {
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
    return new Intl.NumberFormat(LOCALE(), {
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
