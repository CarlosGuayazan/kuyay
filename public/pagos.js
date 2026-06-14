// =====================================================================
//  OPCIONES DE PAGO
// ---------------------------------------------------------------------
//  Si la reservación tiene saldo pendiente (Pagado < Total a pagar),
//  mostramos botones de pago. Cada uno abre una ventana (modal) con
//  sus instrucciones: Transferencia, Wompi, PayPal y Criptomonedas.
//  Los textos vienen de i18n.js (multi-idioma).
// =====================================================================

(function () {
  // ---- Datos fijos (cámbialos aquí si algún dato cambia) ----
  const QR_WHATSAPP =
    "https://kuyay.co/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-03-at-20.02.31.jpeg";
  const WA_LINK =
    "https://wa.me/573193108212?text=Hola,%20he%20completado%20mi%20pago";
  const WOMPI_LINK = "https://checkout.wompi.co/l/VPOS_R9JSmA";
  const WOMPI_QR =
    "https://kuyay.co/wp-content/uploads/2026/06/chekout-wompiqr-code.png";
  const PAYPAL_USER = "@CarlosGuayaza";
  const CRIPTO_LINK = "https://nowpayments.io/pos-terminal/kuyayhostel";
  const DESCUENTO_TRM = 300; // Se resta a la TRM para la tasa de compra.
  const RECARGO_WOMPI = 0.05; // 5% adicional con Wompi.

  // Atajo para traducir.
  const t = (clave, vars) => (window.I18N ? I18N.t(clave, vars) : clave);

  let reservaActual = null;
  let trmCache = null;

  // ---- Ventana reutilizable (modal) ----
  const overlay = document.createElement("div");
  overlay.id = "modal-pago";
  overlay.className = "modal-overlay oculto";
  overlay.innerHTML = `
    <div class="modal-card">
      <button type="button" class="modal-cerrar" aria-label="X">✕</button>
      <div class="modal-contenido"></div>
    </div>`;
  document.body.appendChild(overlay);
  const contenido = overlay.querySelector(".modal-contenido");

  function abrirModal(html) {
    contenido.innerHTML = html;
    overlay.classList.remove("oculto");
    // En la isla, genera los códigos QR del modal (Cripto, etc.).
    if (window.generarQRsEn) window.generarQRsEn(contenido);
  }

  const esKiosko = () => !!window.ES_KIOSKO;

  // El botón "Reportar por WhatsApp" es un enlace externo: en la isla NO se
  // muestra (el huésped escanea el QR de WhatsApp que ya aparece arriba).
  const botonWhatsapp = () =>
    esKiosko()
      ? ""
      : `<a class="boton-whatsapp" href="${WA_LINK}" target="_blank" rel="noopener noreferrer">${t("trBtnWhatsapp")}</a>`;
  function cerrarModal() {
    detenerPoll();
    overlay.classList.add("oculto");
    contenido.innerHTML = "";
  }

  overlay.querySelector(".modal-cerrar").addEventListener("click", cerrarModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrarModal();
  });

  // ---- Saldo pendiente ----
  function saldoPendiente(r) {
    return (Number(r.total_to_pay) || 0) - (Number(r.paid_out) || 0);
  }

  // ---- Función pública: arma la sección de pago para una reserva ----
  window.construirSeccionPago = function (reserva) {
    reservaActual = reserva;
    const saldo = saldoPendiente(reserva);
    if (saldo <= 0) return "";

    return `
      <div class="pagos">
        <h3>💰 ${t("pagSaldo")} ${formatearDinero(saldo)}</h3>
        <p>${t("pagElige")}</p>
        <div class="botones-pago">
          ${
            esKiosko()
              ? `<button type="button" class="boton-pago" data-pago="efectivo">${t("pagBtnEfectivo")}</button>`
              : ""
          }
          <button type="button" class="boton-pago" data-pago="transferencia">${t("pagBtnTransfer")}</button>
          <button type="button" class="boton-pago" data-pago="wompi">${t("pagBtnWompi")}</button>
          <button type="button" class="boton-pago" data-pago="paypal">${t("pagBtnPaypal")}</button>
          <button type="button" class="boton-pago" data-pago="cripto">${t("pagBtnCripto")}</button>
        </div>
      </div>`;
  };

  // ---- Clics: abrir el modal según la opción elegida ----
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-ef-cancelar]")) {
      cancelarEfectivo();
      cerrarModal();
      return;
    }
    if (e.target.closest(".boton-finalizar")) {
      cerrarModal();
      return;
    }
    const btn = e.target.closest(".boton-pago");
    if (!btn) return;

    const metodo = btn.dataset.pago;
    if (metodo === "efectivo") iniciarEfectivo();
    else if (metodo === "transferencia") abrirModal(htmlTransferencia());
    else if (metodo === "wompi") abrirModal(htmlWompi());
    else if (metodo === "paypal") {
      abrirModal(htmlCargando(t("pagBtnPaypal")));
      mostrarConUSD("paypal");
    } else if (metodo === "cripto") {
      abrirModal(htmlCargando(t("pagBtnCripto")));
      mostrarConUSD("cripto");
    }
  });

  // ===================== Contenido de cada opción =====================

  // --- 0) Efectivo (solo en la isla/kiosko) ---
  // Se conecta con la máquina de efectivo del kiosko mediante nuestros
  // intermediarios seguros: /api/efectivo (iniciar), /api/efectivo-estado
  // (consultar) y /api/efectivo-cancelar (cancelar).
  let efPollTimer = null;

  function detenerPoll() {
    if (efPollTimer) {
      clearInterval(efPollTimer);
      efPollTimer = null;
    }
  }

  async function iniciarEfectivo() {
    abrirModal(`
      <h2>${t("efTitulo")}</h2>
      <p class="ef-estado">${t("efIniciando")}</p>
      <div class="spinner"></div>`);

    const saldo = saldoPendiente(reservaActual);
    const reference = "booking-" + reservaActual.booking_id;

    try {
      const r = await fetch("/api/efectivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, amount: saldo }),
      });
      if (r.status === 409) return efMensaje(t("efOcupado"));
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !(data && data.ok)) return efMensaje(t("efError"));
      const pago = data.payment || {};
      efCobrando(pago.collected || 0, saldo);
      iniciarPoll(saldo);
    } catch (e) {
      efMensaje(t("efError"));
    }
  }

  function efCobrando(collected, saldo) {
    abrirModal(`
      <h2>${t("efTitulo")}</h2>
      <p class="ef-estado">${t("efInserta")}</p>
      <p class="monto-grande" id="ef-recibido">${t("efRecibido")}: ${formatearDinero(
        collected
      )} / ${formatearDinero(saldo)}</p>
      <p class="ef-texto">${t("efCambioNota")}</p>
      <button type="button" class="boton-finalizar" data-ef-cancelar="1">${t("efCancelar")}</button>`);
  }

  function iniciarPoll(saldo) {
    detenerPoll();
    efPollTimer = setInterval(async () => {
      try {
        const r = await fetch("/api/efectivo-estado");
        const data = await r.json().catch(() => ({}));
        const pago = (data && data.payment) || data;
        if (!pago || !pago.status) return;

        if (pago.status === "collecting") {
          const el = document.getElementById("ef-recibido");
          if (el) {
            el.textContent = `${t("efRecibido")}: ${formatearDinero(
              pago.collected || 0
            )} / ${formatearDinero(saldo)}`;
          }
        } else if (
          pago.status === "completed" ||
          pago.status === "completed_with_shortfall"
        ) {
          detenerPoll();
          efCompletado(pago);
        } else if (pago.status === "cancelled") {
          detenerPoll();
          efMensaje(t("efCancelado"));
        }
      } catch (e) {}
    }, 2000);
  }

  function efCompletado(pago) {
    // 1) Capturamos los datos del reporte ANTES de marcar la reserva como pagada.
    const datosReporte = construirReporte(pago);

    // 2) Marcamos la reserva como pagada en esta sesión: actualiza "Pagado" y
    //    quita todos los métodos de pago. La base de datos real se actualiza en
    //    unos minutos gracias al reporte de pago.
    if (window.marcarReservaPagada) window.marcarReservaPagada();

    // 3) Mostramos el resultado al huésped.
    const cambio = pago.change || 0;
    const faltante = pago.changeShortfall || 0;
    let html = `
      <h2>${t("efPagado")}</h2>
      <p class="monto-grande">${t("efRecibido")}: ${formatearDinero(
        pago.collected || 0
      )}</p>`;
    if (cambio > 0)
      html += `<p class="ef-texto">${t("efCambio")}: ${formatearDinero(cambio)}</p>`;
    if (faltante > 0)
      html += `<p class="aviso-recargo">${t("efFaltante")}: ${formatearDinero(
        faltante
      )}</p>`;
    html += `<button type="button" class="boton-finalizar">${t("btnFinalizar")}</button>`;
    abrirModal(html);

    // 4) Reportamos el pago a la base de datos (en segundo plano).
    enviarReporte(datosReporte);
  }

  // Arma el cuerpo del reporte de pago a partir de la reserva y el resultado.
  function construirReporte(pago) {
    const h = reservaActual.holder || {};
    const nombre = [h.name, h.surname, h.second_surname]
      .filter(Boolean)
      .join(" ");
    const saldoPrevio = saldoPendiente(reservaActual);

    // Datos que reporta la máquina de efectivo:
    //   collected       = efectivo que metió el huésped
    //   change          = cambio que la máquina devolvió (solo billetes de $5.000)
    //   changeShortfall = cambio que NO se pudo devolver (sobrante < $5.000)
    const recibido = Number(pago.collected) || 0;
    const cambio = Number(pago.change) || 0;
    const faltante = Number(pago.changeShortfall) || 0;

    // Lo que el huésped REALMENTE pagó = lo que metió − el cambio que recibió.
    // (Si por algún motivo no llega "collected", caemos al monto cobrado.)
    const pagado =
      recibido > 0 ? recibido - cambio : Number(pago.amount) || saldoPrevio;

    // Saldo a conciliar = el cambio que la máquina no pudo devolver.
    // Es dinero que se le sigue debiendo al huésped (sobrante de billetes).
    const due = faltante;
    return {
      guest_name: nombre,
      amount_Paid: String(pagado),
      "reservation-value": String(reservaActual.total_to_pay || ""),
      "due-balance": String(due),
      "date-time": pago.completedAt || new Date().toISOString(),
      "reservation-id": String(reservaActual.booking_id || ""),
      room:
        (reservaActual.assigned_room && reservaActual.assigned_room.name) || "",
    };
  }

  function enviarReporte(datos) {
    fetch("/api/reportar-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    }).catch(() => {});
  }

  function efMensaje(msg) {
    detenerPoll();
    abrirModal(`
      <h2>${t("efTitulo")}</h2>
      <p class="ef-texto">${msg}</p>
      <button type="button" class="boton-finalizar">${t("btnFinalizar")}</button>`);
  }

  function cancelarEfectivo() {
    detenerPoll();
    fetch("/api/efectivo-cancelar", { method: "POST" }).catch(() => {});
  }

  // --- 1) Transferencia ---
  function htmlTransferencia() {
    const saldo = saldoPendiente(reservaActual);
    return `
      <h2>${t("trTitulo")}</h2>
      <p class="monto-grande">${formatearDinero(saldo)}</p>
      <div class="datos-pago">
        <p>🔑 <strong>${t("trLlave")}</strong> @Guayazan512 (Bancolombia)</p>
        <p>📱 <strong>${t("trNequi")}</strong> 321 6363732
          <span class="a-nombre">${t("trANombre")} Cindy Díaz</span></p>
        <p>📱 <strong>${t("trDaviplata")}</strong> 300 2696890
          <span class="a-nombre">${t("trANombre")} Carlos Guayazan</span></p>
        <p>🏛️ <strong>${t("trBancolombia")}</strong> 69957664822
          <span class="a-nombre">C.C 1136880512 · Carlos Guayazan</span></p>
      </div>
      <p class="reporte-titulo">${t("trReporta")}</p>
      <img class="qr" src="${QR_WHATSAPP}" alt="QR WhatsApp" />
      ${botonWhatsapp()}
      <button type="button" class="boton-finalizar">${t("btnFinalizar")}</button>`;
  }

  // --- 2) Wompi (tarjeta, con 5% de recargo) ---
  function htmlWompi() {
    const saldo = saldoPendiente(reservaActual);
    const conRecargo = Math.round(saldo * (1 + RECARGO_WOMPI));
    return `
      <h2>${t("woTitulo")}</h2>
      <p class="aviso-recargo">${t("woRecargo")}</p>
      <p>${t("woSaldo")} ${formatearDinero(saldo)}</p>
      <p class="monto-grande">${t("woTotal")} ${formatearDinero(conRecargo)}</p>
      ${esKiosko() ? "" : `<a class="boton-pago-accion" href="${WOMPI_LINK}" target="_blank" rel="noopener noreferrer">${t("woBtnPagar")}</a>`}
      <p class="reporte-titulo">${esKiosko() ? t("qrPagar") : t("woEscanea")}</p>
      <img class="qr" src="${WOMPI_QR}" alt="QR Wompi" />
      <button type="button" class="boton-finalizar">${t("btnFinalizar")}</button>`;
  }

  // --- 3 y 4) PayPal y Criptomonedas (requieren el monto en USD) ---
  async function mostrarConUSD(metodo) {
    const saldo = saldoPendiente(reservaActual);
    try {
      const trm = await obtenerTRM();
      const tasa = trm - DESCUENTO_TRM;
      const usd = Math.ceil((saldo / tasa) * 100) / 100; // 2 decimales

      const notaTasa = `
        <p class="nota-tasa">${t("notaTasa", {
          trm: formatearDinero(trm),
          tasa: formatearDinero(tasa),
        })}</p>`;

      if (metodo === "paypal") {
        abrirModal(`
          <h2>${t("ppTitulo")}</h2>
          <p>${t("ppEnvia")}</p>
          <p class="monto-grande">${PAYPAL_USER}</p>
          <p class="monto-grande">${t("montoLbl")} $${usd.toFixed(2)} USD</p>
          ${notaTasa}
          <p class="reporte-titulo">${t("ppReporta")}</p>
          <img class="qr" src="${QR_WHATSAPP}" alt="QR WhatsApp" />
          ${botonWhatsapp()}
          <button type="button" class="boton-finalizar">${t("btnFinalizar")}</button>`);
      } else {
        abrirModal(`
          <h2>${t("crTitulo")}</h2>
          <p class="monto-grande">${t("montoLbl")} $${usd.toFixed(2)} USD</p>
          ${notaTasa}
          ${
            esKiosko()
              ? `<div class="qr-bloque"><img class="qr qr-dinamico" data-qr="${CRIPTO_LINK}" alt="QR" /><p class="qr-texto">${t("qrPagar")}</p></div>`
              : `<a class="boton-pago-accion" href="${CRIPTO_LINK}" target="_blank" rel="noopener noreferrer">${t("crBtnPagar")}</a>`
          }
          <button type="button" class="boton-finalizar">${t("btnFinalizar")}</button>`);
      }
    } catch (err) {
      abrirModal(`
        <h2>${metodo === "paypal" ? t("ppTitulo") : t("crTitulo")}</h2>
        <p class="error-trm">${t("errTRM")}</p>
        <button type="button" class="boton-finalizar">${t("btnFinalizar")}</button>`);
    }
  }

  function htmlCargando(titulo) {
    return `<h2>${titulo}</h2><p>${t("calcCargando")}</p>`;
  }

  async function obtenerTRM() {
    if (trmCache) return trmCache;
    const r = await fetch("/api/trm");
    const j = await r.json();
    if (!j.trm) throw new Error("TRM no disponible");
    trmCache = Number(j.trm);
    return trmCache;
  }
})();
