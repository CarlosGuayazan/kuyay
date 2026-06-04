// =====================================================================
//  OPCIONES DE PAGO
// ---------------------------------------------------------------------
//  Si la reservación tiene saldo pendiente (Pagado < Total a pagar),
//  mostramos botones de pago. Cada uno abre una ventana (modal) con
//  sus instrucciones: Transferencia, Wompi, PayPal y Criptomonedas.
// =====================================================================

(function () {
  // ---- Datos fijos (cámbialos aquí si algún dato cambia) ----
  const QR_WHATSAPP =
    "https://kuyay.co/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-03-at-20.02.31.jpeg";
  const WA_LINK =
    "https://wa.me/573629639?text=Hola,%20he%20completado%20mi%20pago";
  const WOMPI_LINK = "https://checkout.wompi.co/l/VPOS_R9JSmA";
  const WOMPI_QR =
    "https://kuyay.co/wp-content/uploads/2026/06/chekout-wompiqr-code.png";
  const PAYPAL_USER = "@CarlosGuayaza";
  const CRIPTO_LINK = "https://nowpayments.io/pos-terminal/kuyayhostel";
  const DESCUENTO_TRM = 300; // Se resta a la TRM para la tasa de compra.
  const RECARGO_WOMPI = 0.05; // 5% adicional con Wompi.

  let reservaActual = null;
  let trmCache = null;

  // ---- Ventana reutilizable (modal) ----
  const overlay = document.createElement("div");
  overlay.id = "modal-pago";
  overlay.className = "modal-overlay oculto";
  overlay.innerHTML = `
    <div class="modal-card">
      <button type="button" class="modal-cerrar" aria-label="Cerrar">✕</button>
      <div class="modal-contenido"></div>
    </div>`;
  document.body.appendChild(overlay);
  const contenido = overlay.querySelector(".modal-contenido");

  function abrirModal(html) {
    contenido.innerHTML = html;
    overlay.classList.remove("oculto");
  }
  function cerrarModal() {
    overlay.classList.add("oculto");
    contenido.innerHTML = "";
  }

  overlay
    .querySelector(".modal-cerrar")
    .addEventListener("click", cerrarModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrarModal();
  });

  // ---- Saldo pendiente ----
  function saldoPendiente(r) {
    return (Number(r.total_to_pay) || 0) - (Number(r.paid_out) || 0);
  }

  // ---- Función pública: arma la sección de pago para una reserva ----
  // app.js la llama dentro de mostrarReserva(). Si no hay saldo, no muestra nada.
  window.construirSeccionPago = function (reserva) {
    reservaActual = reserva;
    const saldo = saldoPendiente(reserva);
    if (saldo <= 0) return "";

    return `
      <div class="pagos">
        <h3>💰 Saldo pendiente: ${formatearDinero(saldo)}</h3>
        <p>Elige cómo deseas pagar:</p>
        <div class="botones-pago">
          <button type="button" class="boton-pago" data-pago="transferencia">🏦 Transferencia</button>
          <button type="button" class="boton-pago" data-pago="wompi">💳 Tarjeta · Wompi (+5%)</button>
          <button type="button" class="boton-pago" data-pago="paypal">🅿️ PayPal</button>
          <button type="button" class="boton-pago" data-pago="cripto">🪙 Criptomonedas</button>
        </div>
      </div>`;
  };

  // ---- Clics: abrir el modal según la opción elegida ----
  document.addEventListener("click", (e) => {
    if (e.target.closest(".boton-finalizar")) {
      cerrarModal();
      return;
    }
    const btn = e.target.closest(".boton-pago");
    if (!btn) return;

    const metodo = btn.dataset.pago;
    if (metodo === "transferencia") abrirModal(htmlTransferencia());
    else if (metodo === "wompi") abrirModal(htmlWompi());
    else if (metodo === "paypal") {
      abrirModal(htmlCargando("🅿️ PayPal"));
      mostrarConUSD("paypal");
    } else if (metodo === "cripto") {
      abrirModal(htmlCargando("🪙 Criptomonedas"));
      mostrarConUSD("cripto");
    }
  });

  // ===================== Contenido de cada opción =====================

  // --- 1) Transferencia ---
  function htmlTransferencia() {
    const saldo = saldoPendiente(reservaActual);
    return `
      <h2>🏦 Pago por transferencia</h2>
      <p class="monto-grande">${formatearDinero(saldo)}</p>
      <div class="datos-pago">
        <p>🔑 <strong>Llave Bre-B:</strong> @Guayazan512 (Bancolombia)</p>
        <p>📱 <strong>Nequi:</strong> 321 6363732
          <span class="a-nombre">A nombre de: Cindy Díaz</span></p>
        <p>📱 <strong>Daviplata:</strong> 300 2696890
          <span class="a-nombre">A nombre de: Carlos Guayazan</span></p>
        <p>🏛️ <strong>Bancolombia Ahorros:</strong> 69957664822
          <span class="a-nombre">C.C 1136880512 · Carlos Guayazan</span></p>
      </div>
      <p class="reporte-titulo">📲 Reporta tu pago enviando el comprobante por WhatsApp:</p>
      <img class="qr" src="${QR_WHATSAPP}" alt="QR para reportar pago por WhatsApp" />
      <a class="boton-whatsapp" href="${WA_LINK}" target="_blank" rel="noopener noreferrer">Reportar por WhatsApp</a>
      <button type="button" class="boton-finalizar">Finalizar</button>`;
  }

  // --- 2) Wompi (tarjeta, con 5% de recargo) ---
  function htmlWompi() {
    const saldo = saldoPendiente(reservaActual);
    const conRecargo = Math.round(saldo * (1 + RECARGO_WOMPI));
    return `
      <h2>💳 Pago con tarjeta (Wompi)</h2>
      <p class="aviso-recargo">⚠️ Esta opción tiene un <strong>recargo del 5%</strong>.</p>
      <p>Saldo: ${formatearDinero(saldo)}</p>
      <p class="monto-grande">Total a pagar: ${formatearDinero(conRecargo)}</p>
      <a class="boton-pago-accion" href="${WOMPI_LINK}" target="_blank" rel="noopener noreferrer">Pagar con Wompi</a>
      <p class="reporte-titulo">o escanea este código QR:</p>
      <img class="qr" src="${WOMPI_QR}" alt="Código QR de pago Wompi" />
      <button type="button" class="boton-finalizar">Finalizar</button>`;
  }

  // --- 3 y 4) PayPal y Criptomonedas (requieren el monto en USD) ---
  async function mostrarConUSD(metodo) {
    const saldo = saldoPendiente(reservaActual);
    try {
      const trm = await obtenerTRM();
      const tasa = trm - DESCUENTO_TRM;
      const usd = Math.ceil((saldo / tasa) * 100) / 100; // 2 decimales

      const notaTasa = `
        <p class="nota-tasa">
          Calculado con la TRM de hoy (${formatearDinero(trm)}) menos $300 =
          tasa de ${formatearDinero(tasa)} por dólar.
        </p>`;

      if (metodo === "paypal") {
        abrirModal(`
          <h2>🅿️ Pago con PayPal</h2>
          <p>Envía el pago a este usuario de PayPal:</p>
          <p class="monto-grande">${PAYPAL_USER}</p>
          <p class="monto-grande">Monto: $${usd.toFixed(2)} USD</p>
          ${notaTasa}
          <p class="reporte-titulo">📲 Luego reporta tu pago enviando el comprobante por WhatsApp:</p>
          <img class="qr" src="${QR_WHATSAPP}" alt="QR para reportar pago por WhatsApp" />
          <a class="boton-whatsapp" href="${WA_LINK}" target="_blank" rel="noopener noreferrer">Reportar por WhatsApp</a>
          <button type="button" class="boton-finalizar">Finalizar</button>`);
      } else {
        abrirModal(`
          <h2>🪙 Pago con Criptomonedas</h2>
          <p class="monto-grande">Monto: $${usd.toFixed(2)} USD</p>
          ${notaTasa}
          <a class="boton-pago-accion" href="${CRIPTO_LINK}" target="_blank" rel="noopener noreferrer">Pagar con criptomonedas</a>
          <button type="button" class="boton-finalizar">Finalizar</button>`);
      }
    } catch (err) {
      abrirModal(`
        <h2>${metodo === "paypal" ? "🅿️ PayPal" : "🪙 Criptomonedas"}</h2>
        <p class="error-trm">No pudimos obtener la tasa del dólar en este momento.
        Por favor intenta de nuevo en unos minutos.</p>
        <button type="button" class="boton-finalizar">Cerrar</button>`);
    }
  }

  function htmlCargando(titulo) {
    return `<h2>${titulo}</h2><p>Calculando el monto en dólares con la TRM de hoy...</p>`;
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
