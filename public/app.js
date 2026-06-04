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

// ¿Estamos en la isla de registro (kiosko)? Lo usan también pagos.js y teclado.js.
// Es kiosko si la URL trae ?kiosko=1, o si es una computadora con pantalla táctil.
window.ES_KIOSKO = (function () {
  const ua = navigator.userAgent || "";
  const esMovilOTablet =
    /Android|iPhone|iPad|iPod|Mobile|Tablet|Silk|Kindle|PlayBook|BlackBerry|Opera Mini|IEMobile/i.test(
      ua
    );
  const tienePantallaTactil =
    (navigator.maxTouchPoints || 0) > 0 || "ontouchstart" in window;
  const forzadoPorUrl = new URLSearchParams(location.search).has("kiosko");
  return forzadoPorUrl || (!esMovilOTablet && tienePantallaTactil);
})();

// Genera los códigos QR dentro de un contenedor (busca <img data-qr="URL">).
// Se hace en el navegador, sin enviar la URL a ningún servicio externo.
window.generarQRsEn = function (contenedor) {
  if (!contenedor || typeof qrcode !== "function") return;
  contenedor.querySelectorAll("img[data-qr]").forEach((img) => {
    const url = img.getAttribute("data-qr");
    try {
      const qr = qrcode(0, "M"); // tipo automático, corrección media
      qr.addData(url);
      qr.make();
      img.src = qr.createDataURL(6, 12); // píxeles por módulo, margen
    } catch (e) {}
  });
};

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

  // Si el check-in AÚN no está hecho, preparamos cómo realizarlo.
  let bloqueCheckin = "";
  if (!r.checked_in) {
    const urlCheckin =
      "https://checkin.lobbypms.com/welcome" +
      `?codigo=${encodeURIComponent(r.booking_id)}` +
      `&email=${encodeURIComponent(huesped.email || "")}` +
      "&lg=es";
    if (window.ES_KIOSKO) {
      // En la isla: QR para que el huésped lo haga en su celular.
      bloqueCheckin = `
        <div class="qr-bloque">
          <img class="qr qr-dinamico" data-qr="${urlCheckin}" alt="QR check-in" />
          <p class="qr-texto">${T("qrCheckin")}</p>
        </div>`;
    } else {
      // En celular/PC: botón normal.
      bloqueCheckin = `
        <a class="boton-checkin" href="${urlCheckin}" target="_blank" rel="noopener noreferrer">
          ${T("btnCheckin")}
        </a>`;
    }
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

  // En la isla, genera el QR del check-in (y de los pagos si aplica).
  if (window.generarQRsEn) generarQRsEn(resultado);
}

// En la isla de registro, convertimos los botones de reserva (Ayllu/Yachi)
// en códigos QR para que el huésped reserve desde su celular.
document.addEventListener("DOMContentLoaded", () => {
  if (!window.ES_KIOSKO) return;
  document.querySelectorAll(".boton-hostel").forEach((a) => {
    const url = a.getAttribute("href");
    const nombre = a.textContent.trim();
    const div = document.createElement("div");
    div.className = "qr-bloque";
    div.innerHTML = `
      <img class="qr qr-dinamico" data-qr="${url}" alt="QR ${nombre}" />
      <p class="qr-texto"><strong>${nombre}</strong><br>
        <span data-i18n="qrReservar">${T("qrReservar")}</span></p>`;
    a.replaceWith(div);
  });
  const disp = document.querySelector(".disponibilidad");
  if (disp && window.generarQRsEn) generarQRsEn(disp);
});

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
