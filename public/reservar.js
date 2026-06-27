// =============================================================
//  Módulo de Reservas (disponibilidad nativa) — cheking.kuyay.co
// -------------------------------------------------------------
//  Llama a la API de reservas que corre en el VPS (IP autorizada
//  en LobbyPMS). Muestra disponibilidad de AMBAS casas con nuestro
//  contenido (foto/descr.), y crea la reserva en dos fases
//  (cliente -> reserva). NO saca al usuario del sitio.
// =============================================================

(function () {
  // Base de la API: local en desarrollo, VPS en producción.
  const API =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : "https://limpieza.kuyay.co"; // API en el VPS (IP autorizada). CORS habilitado.

  // Mientras validamos el POST de reservas con LobbyPMS, dejamos la
  // creación en línea apagada (se puede ver disponibilidad/galería).
  // Lo pasamos a true cuando la reserva de prueba funcione.
  const BOOKING_ENABLED = true;

  const CONTENIDO = window.ROOMS_CONTENT || {};

  // Lista de nacionalidades (ISO 3166-1 alpha-2) — común para el hostal.
  const PAISES = [
    ["CO", "Colombia"], ["US", "Estados Unidos"], ["CA", "Canadá"], ["MX", "México"],
    ["AR", "Argentina"], ["BR", "Brasil"], ["CL", "Chile"], ["PE", "Perú"],
    ["EC", "Ecuador"], ["VE", "Venezuela"], ["BO", "Bolivia"], ["UY", "Uruguay"],
    ["PY", "Paraguay"], ["CR", "Costa Rica"], ["PA", "Panamá"], ["GT", "Guatemala"],
    ["DO", "Rep. Dominicana"], ["CU", "Cuba"], ["ES", "España"], ["FR", "Francia"],
    ["DE", "Alemania"], ["GB", "Reino Unido"], ["IT", "Italia"], ["PT", "Portugal"],
    ["NL", "Países Bajos"], ["BE", "Bélgica"], ["CH", "Suiza"], ["AT", "Austria"],
    ["IE", "Irlanda"], ["SE", "Suecia"], ["NO", "Noruega"], ["DK", "Dinamarca"],
    ["FI", "Finlandia"], ["PL", "Polonia"], ["CZ", "Chequia"], ["GR", "Grecia"],
    ["RU", "Rusia"], ["UA", "Ucrania"], ["TR", "Turquía"], ["IL", "Israel"],
    ["AU", "Australia"], ["NZ", "Nueva Zelanda"], ["JP", "Japón"], ["CN", "China"],
    ["KR", "Corea del Sur"], ["IN", "India"], ["ZA", "Sudáfrica"], ["MA", "Marruecos"],
  ];

  const $ = (s, r) => (r || document).querySelector(s);
  const fmt = (n) => "$" + Number(n).toLocaleString("es-CO");
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  let ROOMS = [];
  let consulta = { start: "", end: "" };

  // ---------- Montaje en la sección de disponibilidad ----------
  function montar() {
    const cont = $(".disponibilidad");
    if (!cont) return;
    const hoy = new Date().toISOString().slice(0, 10);
    cont.innerHTML = `
      <h2>📅 Consulta disponibilidad y reserva</h2>
      <div class="rsv-buscador">
        <label class="rsv-campo">Llegada
          <input type="date" id="rsv-in" min="${hoy}" value="${hoy}" />
        </label>
        <label class="rsv-campo">Salida
          <input type="date" id="rsv-out" min="${hoy}" />
        </label>
        <button class="rsv-boton" id="rsv-buscar">Buscar</button>
      </div>
      <p class="rsv-estado" id="rsv-estado"></p>
      <div class="rsv-grid" id="rsv-grid"></div>
      <div class="rsv-modal" id="rsv-modal"><div class="rsv-modal-card" id="rsv-modal-card"></div></div>`;
    $("#rsv-buscar").addEventListener("click", buscar);
    $("#rsv-modal").addEventListener("click", (e) => {
      if (e.target.id === "rsv-modal") cerrarModal();
    });
  }

  // ---------- Buscar disponibilidad ----------
  async function buscar() {
    const start = $("#rsv-in").value;
    const end = $("#rsv-out").value;
    const est = $("#rsv-estado");
    if (!start || !end || end <= start) {
      est.textContent = "Elige una fecha de salida posterior a la de llegada.";
      return;
    }
    consulta = { start, end };
    est.textContent = "Buscando disponibilidad…";
    $("#rsv-grid").innerHTML = "";
    try {
      const r = await fetch(`${API}/api/book/availability?start_date=${start}&end_date=${end}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Error");
      ROOMS = data.rooms || [];
      est.textContent = ROOMS.length ? "" : "No hay habitaciones disponibles para esas fechas.";
      pintar();
    } catch (e) {
      est.textContent = "No se pudo consultar la disponibilidad. Intenta de nuevo.";
    }
  }

  // ---------- Pintar tarjetas ----------
  function pintar() {
    const grid = $("#rsv-grid");
    grid.innerHTML = "";
    ROOMS.forEach((room, i) => {
      const c = CONTENIDO[String(room.category_id)] || {};
      const foto = (c.fotos && c.fotos[0]) || "";
      const titulo = c.titulo || room.name;
      const noches = room.nights;
      const personas = Object.keys(room.precio_total)
        .map(Number)
        .sort((a, b) => a - b);
      const opciones = personas
        .map(
          (p) =>
            `<option value="${p}">${p} ${p === 1 ? "persona" : "personas"} — ${fmt(
              room.precio_total[p]
            )} (${noches} ${noches === 1 ? "noche" : "noches"})</option>`
        )
        .join("");
      const desde = room.precio_total[personas[0]];

      const card = document.createElement("div");
      card.className = "rsv-card";
      card.innerHTML = `
        ${foto ? `<img class="rsv-foto" src="${esc(foto)}" alt="${esc(titulo)}" data-i="${i}" loading="lazy" />` : ""}
        <div class="rsv-card-body">
          <span class="rsv-sede">🏠 ${esc(room.sede_name)}</span>
          <h3 class="rsv-titulo">${esc(titulo)}</h3>
          <p class="rsv-tipo">${esc(c.tipo || "")}</p>
          <p class="rsv-desc">${esc(c.descripcion || "")}</p>
          <p class="rsv-precio">Desde ${fmt(desde)} <small>· estancia (${noches} ${noches === 1 ? "noche" : "noches"})</small></p>
          <div class="rsv-fila">
            <select class="rsv-personas">${opciones}</select>
            <button class="rsv-boton rsv-reservar" data-i="${i}">Reservar</button>
          </div>
        </div>`;
      if (foto)
        card.querySelector(".rsv-foto").addEventListener("click", () => abrirGaleria(c, titulo));
      card.querySelector(".rsv-reservar").addEventListener("click", () => {
        if (!BOOKING_ENABLED) return avisoProximamente();
        const ppl = Number(card.querySelector(".rsv-personas").value);
        abrirFormulario(room, ppl);
      });
      grid.appendChild(card);
    });
  }

  // ---------- Modal ----------
  function abrirModal(html) {
    $("#rsv-modal-card").innerHTML = html;
    $("#rsv-modal").classList.add("abierto");
  }
  function cerrarModal() {
    $("#rsv-modal").classList.remove("abierto");
    $("#rsv-modal-card").innerHTML = "";
  }

  // ---------- Aviso mientras la reserva en línea está en pruebas ----------
  function avisoProximamente() {
    abrirModal(`
      <div class="rsv-ok">🔜 Reserva en línea en pruebas</div>
      <p class="rsv-desc" style="margin-top:10px">¡Muy pronto podrás reservar aquí mismo! Por ahora escríbenos para confirmar tu reserva. Gracias por tu paciencia. 🙌</p>
      <button class="rsv-boton" style="width:100%;margin-top:12px" id="rsv-fin">Entendido</button>`);
    $("#rsv-fin").addEventListener("click", cerrarModal);
  }

  // ---------- Galería de fotos (nativa) ----------
  function abrirGaleria(c, titulo) {
    const fotos = (c.fotos || []).map((f) => `<img class="rsv-modal-foto" src="${esc(f)}" alt="${esc(titulo)}" />`).join("");
    abrirModal(`
      <h3 class="rsv-titulo" style="margin-bottom:8px">${esc(titulo)}</h3>
      ${fotos}
      <p class="rsv-tipo">${esc(c.tipo || "")}</p>
      <p class="rsv-desc" style="margin-top:6px">${esc(c.descripcion || "")}</p>
      <button class="rsv-boton secundario" style="width:100%;margin-top:12px" id="rsv-cerrar">Cerrar</button>`);
    $("#rsv-cerrar").addEventListener("click", cerrarModal);
  }

  // ---------- Formulario de reserva ----------
  function abrirFormulario(room, personas) {
    const c = CONTENIDO[String(room.category_id)] || {};
    const titulo = c.titulo || room.name;
    const total = room.precio_total[personas];
    const paises = PAISES.map(([code, nm]) => `<option value="${code}">${esc(nm)}</option>`).join("");
    abrirModal(`
      <h3 class="rsv-titulo">${esc(titulo)}</h3>
      <p class="rsv-tipo">🏠 ${esc(room.sede_name)} · ${personas} ${personas === 1 ? "persona" : "personas"} · ${room.nights} ${room.nights === 1 ? "noche" : "noches"}</p>
      <p class="rsv-precio">Total: ${fmt(total)}</p>
      <p class="rsv-tipo">${esc(consulta.start)} → ${esc(consulta.end)}</p>
      <div class="rsv-form">
        <label>Nombre(s) *<input id="f-name" autocomplete="given-name" /></label>
        <label>Apellido(s) *<input id="f-surname" autocomplete="family-name" /></label>
        <label>Teléfono (con código país, ej. +57...) *<input id="f-phone" inputmode="tel" placeholder="+57..." /></label>
        <label>Nacionalidad *<select id="f-nat">${paises}</select></label>
        <label>Correo *<input id="f-email" type="email" autocomplete="email" /></label>
        <label>Documento / Identificación *<input id="f-doc" /></label>
        <p class="rsv-error" id="f-error" style="display:none"></p>
        <button class="rsv-boton" id="f-enviar" style="width:100%;margin-top:14px">Confirmar reserva</button>
        <button class="rsv-boton secundario" id="f-cancelar" style="width:100%;margin-top:8px">Cancelar</button>
      </div>`);
    $("#f-cancelar").addEventListener("click", cerrarModal);
    $("#f-enviar").addEventListener("click", () => enviar(room, personas));
  }

  // ---------- Enviar: crea cliente y luego reserva ----------
  async function enviar(room, personas) {
    const err = $("#f-error");
    err.style.display = "none";
    const payload = {
      name: $("#f-name").value.trim(),
      surname: $("#f-surname").value.trim(),
      phone: $("#f-phone").value.trim(),
      nationality: $("#f-nat").value,
      email: $("#f-email").value.trim(),
      document: $("#f-doc").value.trim(),
    };
    if (!payload.name || !payload.surname || !payload.phone || !payload.email || !payload.document) {
      err.textContent = "Completa todos los campos obligatorios.";
      err.style.display = "block";
      return;
    }
    const btn = $("#f-enviar");
    btn.disabled = true;
    btn.textContent = "Procesando…";
    try {
      const body = {
        ...payload,
        sede: room.sede,
        category_id: room.category_id,
        start_date: consulta.start,
        end_date: consulta.end,
        total_adults: personas,
        rates_per_day: room.rates_per_day.map((d) => ({
          date: d.date,
          value: d.prices[personas] != null ? d.prices[personas] : d.prices[1],
        })),
      };
      const r = await fetch(`${API}/api/book/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "No se pudo crear la reserva.");
      abrirModal(`
        <div class="rsv-ok">✅ ¡Reserva creada!<br>Código: <strong>${esc(data.booking_id || "—")}</strong></div>
        <p class="rsv-desc" style="margin-top:10px">Te contactaremos para confirmar. El pago se realiza en el hostal.</p>
        <button class="rsv-boton" style="width:100%;margin-top:12px" id="rsv-fin">Listo</button>`);
      $("#rsv-fin").addEventListener("click", cerrarModal);
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "Confirmar reserva";
      err.textContent = e.message || "Error al crear la reserva.";
      err.style.display = "block";
    }
  }

  if (document.readyState !== "loading") montar();
  else document.addEventListener("DOMContentLoaded", montar);
})();
