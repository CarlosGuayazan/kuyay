// =============================================================
//  Módulo de Reservas (disponibilidad nativa) — cheking.kuyay.co
// -------------------------------------------------------------
//  Front-end que llama a la API de reservas en el VPS (IP
//  autorizada en LobbyPMS). Muestra disponibilidad de AMBAS casas
//  con nuestro contenido (foto/descr.) en el idioma activo, y crea
//  la reserva en 2 fases (cliente -> reserva). No saca al usuario
//  del sitio. El modal se monta en <body> (no se recorta).
// =============================================================

(function () {
  const API =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : "https://limpieza.kuyay.co"; // API en el VPS (IP autorizada). CORS habilitado.

  const CONTENIDO = window.ROOMS_CONTENT || {};

  // Idioma activo (es/en/…). El contenido está en es/en; el resto cae a en.
  function lang() {
    const l = (window.I18N && window.I18N.lang) || "es";
    return l === "es" ? "es" : "en";
  }
  // Toma el texto del objeto {es,en} (o string simple) en el idioma activo.
  function L(o) {
    if (o == null) return "";
    if (typeof o === "string") return o;
    return o[lang()] || o.en || o.es || "";
  }

  // Textos de la interfaz (ES/EN).
  const STR = {
    es: {
      titulo: "📅 Consulta disponibilidad y reserva",
      llegada: "Llegada", salida: "Salida", buscar: "Buscar",
      buscando: "Buscando disponibilidad…",
      sinResultados: "No hay habitaciones disponibles para esas fechas.",
      errorBuscar: "No se pudo consultar la disponibilidad. Intenta de nuevo.",
      fechaInvalida: "Elige una fecha de salida posterior a la de llegada.",
      desde: "Desde", estancia: "estancia", noche: "noche", noches: "noches",
      persona: "persona", personas: "personas", reservar: "Reservar", cerrar: "Cerrar",
      seleccionar: "Seleccionar",
      nombre: "Nombre(s)", apellido: "Apellido(s)",
      telefono: "Teléfono (con código país, ej. +57...)",
      nacionalidad: "Nacionalidad", correo: "Correo", documento: "Documento / Identificación",
      total: "Total", confirmar: "Confirmar reserva", cancelar: "Cancelar",
      completa: "Completa todos los campos obligatorios.", procesando: "Procesando…",
      okTitulo: "✅ ¡Reserva creada!", okCodigo: "Código",
      okTexto: "Te contactaremos para confirmar. El pago se realiza en el hostal.",
      errorReserva: "No se pudo crear la reserva.", listo: "Listo",
    },
    en: {
      titulo: "📅 Check availability & book",
      llegada: "Check-in", salida: "Check-out", buscar: "Search",
      buscando: "Searching availability…",
      sinResultados: "No rooms available for those dates.",
      errorBuscar: "Could not check availability. Please try again.",
      fechaInvalida: "Pick a check-out date after the check-in date.",
      desde: "From", estancia: "stay", noche: "night", noches: "nights",
      persona: "guest", personas: "guests", reservar: "Book", cerrar: "Close",
      seleccionar: "Select",
      nombre: "First name(s)", apellido: "Last name(s)",
      telefono: "Phone (with country code, e.g. +57...)",
      nacionalidad: "Nationality", correo: "Email", documento: "ID / Document number",
      total: "Total", confirmar: "Confirm booking", cancelar: "Cancel",
      completa: "Please fill in all required fields.", procesando: "Processing…",
      okTitulo: "✅ Booking created!", okCodigo: "Code",
      okTexto: "We'll contact you to confirm. Payment is made at the hostel.",
      errorReserva: "Could not create the booking.", listo: "Done",
    },
  };
  const T = (k) => (STR[lang()] || STR.es)[k];

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

  // ---------- Helpers de fecha (en horario LOCAL, sin líos de zona horaria) ----------
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const hoyISO = () => toISO(new Date());
  const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
  const locale = () => (lang() === "es" ? "es-CO" : "en-US");
  const fmtFecha = (iso) =>
    iso ? new Intl.DateTimeFormat(locale(), { weekday: "short", day: "numeric", month: "short" }).format(parseISO(iso)) : "";

  let ROOMS = [];
  let consulta = { start: "", end: "" };
  let sel = { start: "", end: "" }; // selección actual de fechas del buscador
  let selInit = false;

  // ---------- Modal (montado en <body> para que no lo recorte nada) ----------
  function modalEl() {
    let m = document.getElementById("rsv-modal");
    if (!m) {
      m = document.createElement("div");
      m.id = "rsv-modal";
      m.className = "rsv-modal";
      m.innerHTML = '<div class="rsv-modal-card" id="rsv-modal-card"></div>';
      m.addEventListener("click", (e) => {
        if (e.target.id === "rsv-modal") cerrarModal();
      });
      document.body.appendChild(m);
    }
    return m;
  }
  function abrirModal(html) {
    modalEl();
    $("#rsv-modal-card").innerHTML = html;
    $("#rsv-modal").classList.add("abierto");
  }
  function cerrarModal() {
    const m = document.getElementById("rsv-modal");
    if (m) { m.classList.remove("abierto"); $("#rsv-modal-card").innerHTML = ""; }
  }

  // ---------- Montaje en la sección de disponibilidad ----------
  function montar() {
    const cont = $(".disponibilidad");
    if (!cont) return;
    if (!selInit) { // inicializa la selección una sola vez (conserva al cambiar idioma)
      sel.start = consulta.start || hoyISO();
      sel.end = consulta.end || "";
      selInit = true;
    }
    cont.innerHTML = `
      <h2>${T("titulo")}</h2>
      <div class="rsv-buscador">
        <label class="rsv-campo">${T("llegada")}
          <input type="text" id="rsv-in" class="rsv-fecha" readonly data-no-teclado
                 placeholder="${T("seleccionar")}" value="${esc(fmtFecha(sel.start))}" />
        </label>
        <label class="rsv-campo">${T("salida")}
          <input type="text" id="rsv-out" class="rsv-fecha" readonly data-no-teclado
                 placeholder="${T("seleccionar")}" value="${esc(fmtFecha(sel.end))}" />
        </label>
        <button class="rsv-boton" id="rsv-buscar">${T("buscar")}</button>
      </div>
      <p class="rsv-estado" id="rsv-estado"></p>
      <div class="rsv-grid" id="rsv-grid"></div>`;
    modalEl();
    // Calendario de Llegada: desde hoy en adelante.
    $("#rsv-in").addEventListener("click", () =>
      abrirCalendario({
        value: sel.start,
        min: hoyISO(),
        onPick: (d) => {
          sel.start = d;
          // La salida nunca puede ser anterior o igual a la llegada.
          if (sel.end && sel.end <= d) sel.end = "";
          sincFechas();
        },
      })
    );
    // Calendario de Salida: SIEMPRE posterior a la llegada.
    $("#rsv-out").addEventListener("click", () =>
      abrirCalendario({
        value: sel.end,
        min: addDays(sel.start || hoyISO(), 1),
        onPick: (d) => { sel.end = d; sincFechas(); },
      })
    );
    $("#rsv-buscar").addEventListener("click", buscar);
    if (ROOMS.length) pintar();
  }

  // Refresca el texto mostrado en los dos campos de fecha.
  function sincFechas() {
    const i = $("#rsv-in"), o = $("#rsv-out");
    if (i) i.value = fmtFecha(sel.start);
    if (o) o.value = fmtFecha(sel.end);
  }

  // ---------- Calendario táctil (grande, amigable a los dedos) ----------
  function abrirCalendario({ value, min, max, onPick }) {
    const view = parseISO(value || min || hoyISO());
    view.setDate(1);
    const ov = document.createElement("div");
    ov.className = "cal-modal";
    ov.innerHTML = '<div class="cal-card" id="cal-card"></div>';
    ov.addEventListener("click", (e) => { if (e.target === ov) cerrar(); });
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add("abierto"));

    function cerrar() {
      ov.classList.remove("abierto");
      setTimeout(() => ov.remove(), 150);
    }
    const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

    function render() {
      const loc = locale();
      const titulo = cap(new Intl.DateTimeFormat(loc, { month: "long", year: "numeric" }).format(view));
      const dows = [];
      // 2024-01-01 fue lunes: nombres de día empezando en lunes.
      for (let i = 0; i < 7; i++)
        dows.push(new Intl.DateTimeFormat(loc, { weekday: "short" }).format(new Date(2024, 0, 1 + i)));
      const y = view.getFullYear(), mo = view.getMonth();
      const startOffset = (new Date(y, mo, 1).getDay() + 6) % 7; // 0 = lunes
      const diasMes = new Date(y, mo + 1, 0).getDate();
      let cells = "";
      for (let i = 0; i < startOffset; i++) cells += '<span class="cal-day empty"></span>';
      for (let d = 1; d <= diasMes; d++) {
        const iso = toISO(new Date(y, mo, d));
        const off = (min && iso < min) || (max && iso > max);
        const cls = ["cal-day"];
        if (off) cls.push("disabled");
        if (iso === value) cls.push("sel");
        if (iso === hoyISO()) cls.push("today");
        cells += `<button type="button" class="${cls.join(" ")}" ${off ? "disabled" : ""} data-iso="${iso}">${d}</button>`;
      }
      $("#cal-card").innerHTML = `
        <div class="cal-header">
          <button type="button" class="cal-nav" data-nav="-1" aria-label="anterior">‹</button>
          <span class="cal-title">${esc(titulo)}</span>
          <button type="button" class="cal-nav" data-nav="1" aria-label="siguiente">›</button>
        </div>
        <div class="cal-dows">${dows.map((d) => `<span>${esc(d)}</span>`).join("")}</div>
        <div class="cal-grid">${cells}</div>
        <button type="button" class="rsv-boton secundario" id="cal-cerrar" style="width:100%;margin-top:12px">${T("cerrar")}</button>`;
      ov.querySelectorAll(".cal-nav").forEach((b) =>
        b.addEventListener("click", () => { view.setMonth(view.getMonth() + Number(b.dataset.nav)); render(); })
      );
      ov.querySelectorAll(".cal-day[data-iso]:not(.disabled)").forEach((b) =>
        b.addEventListener("click", () => { onPick(b.dataset.iso); cerrar(); })
      );
      $("#cal-cerrar").addEventListener("click", cerrar);
    }
    render();
  }

  // ---------- Buscar disponibilidad ----------
  async function buscar() {
    const start = sel.start;
    const end = sel.end;
    const est = $("#rsv-estado");
    if (!start || !end || end <= start) {
      est.textContent = T("fechaInvalida");
      return;
    }
    consulta = { start, end };
    est.textContent = T("buscando");
    $("#rsv-grid").innerHTML = "";
    try {
      const r = await fetch(`${API}/api/book/availability?start_date=${start}&end_date=${end}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Error");
      ROOMS = data.rooms || [];
      est.textContent = ROOMS.length ? "" : T("sinResultados");
      pintar();
    } catch (e) {
      est.textContent = T("errorBuscar");
    }
  }

  // ---------- Pintar tarjetas ----------
  function pintar() {
    const grid = $("#rsv-grid");
    if (!grid) return;
    grid.innerHTML = "";
    ROOMS.forEach((room, i) => {
      const c = CONTENIDO[String(room.category_id)] || {};
      const foto = (c.fotos && c.fotos[0]) || "";
      const titulo = c.titulo || room.name;
      const noches = room.nights;
      const nNoches = `${noches} ${noches === 1 ? T("noche") : T("noches")}`;
      const personas = Object.keys(room.precio_total).map(Number).sort((a, b) => a - b);
      const opciones = personas
        .map((p) => `<option value="${p}">${p} ${p === 1 ? T("persona") : T("personas")} — ${fmt(room.precio_total[p])}</option>`)
        .join("");
      const desde = room.precio_total[personas[0]];

      const card = document.createElement("div");
      card.className = "rsv-card";
      card.innerHTML = `
        ${foto ? `<img class="rsv-foto" src="${esc(foto)}" alt="${esc(titulo)}" loading="lazy" />` : ""}
        <div class="rsv-card-body">
          <span class="rsv-sede">🏠 ${esc(room.sede_name)}</span>
          <h3 class="rsv-titulo">${esc(titulo)}</h3>
          <p class="rsv-tipo">${esc(L(c.tipo))}</p>
          <p class="rsv-desc">${esc(L(c.descripcion))}</p>
          <p class="rsv-precio">${T("desde")} ${fmt(desde)} <small>· ${T("estancia")} (${nNoches})</small></p>
          <div class="rsv-fila">
            <select class="rsv-personas">${opciones}</select>
            <button class="rsv-boton rsv-reservar">${T("reservar")}</button>
          </div>
        </div>`;
      if (foto) card.querySelector(".rsv-foto").addEventListener("click", () => abrirGaleria(c, titulo));
      card.querySelector(".rsv-reservar").addEventListener("click", () => {
        const ppl = Number(card.querySelector(".rsv-personas").value);
        abrirFormulario(room, ppl);
      });
      grid.appendChild(card);
    });
  }

  // ---------- Galería de fotos (nativa) ----------
  function abrirGaleria(c, titulo) {
    const fotos = (c.fotos || []).map((f) => `<img class="rsv-modal-foto" src="${esc(f)}" alt="${esc(titulo)}" />`).join("");
    abrirModal(`
      <h3 class="rsv-titulo" style="margin-bottom:8px">${esc(titulo)}</h3>
      ${fotos}
      <p class="rsv-tipo">${esc(L(c.tipo))}</p>
      <p class="rsv-desc" style="margin-top:6px">${esc(L(c.descripcion))}</p>
      <button class="rsv-boton secundario" style="width:100%;margin-top:12px" id="rsv-cerrar">${T("cerrar")}</button>`);
    $("#rsv-cerrar").addEventListener("click", cerrarModal);
  }

  // ---------- Formulario de reserva ----------
  function abrirFormulario(room, personas) {
    const c = CONTENIDO[String(room.category_id)] || {};
    const titulo = c.titulo || room.name;
    const total = room.precio_total[personas];
    const nNoches = `${room.nights} ${room.nights === 1 ? T("noche") : T("noches")}`;
    const paises = PAISES.map(([code, nm]) => `<option value="${code}">${esc(nm)}</option>`).join("");
    abrirModal(`
      <h3 class="rsv-titulo">${esc(titulo)}</h3>
      <p class="rsv-tipo">🏠 ${esc(room.sede_name)} · ${personas} ${personas === 1 ? T("persona") : T("personas")} · ${nNoches}</p>
      <p class="rsv-precio">${T("total")}: ${fmt(total)}</p>
      <p class="rsv-tipo">${esc(consulta.start)} → ${esc(consulta.end)}</p>
      <div class="rsv-form">
        <label>${T("nombre")} *<input id="f-name" autocomplete="given-name" /></label>
        <label>${T("apellido")} *<input id="f-surname" autocomplete="family-name" /></label>
        <label>${T("telefono")} *<input id="f-phone" inputmode="tel" placeholder="+57..." /></label>
        <label>${T("nacionalidad")} *<select id="f-nat">${paises}</select></label>
        <label>${T("correo")} *<input id="f-email" type="email" autocomplete="email" /></label>
        <label>${T("documento")} *<input id="f-doc" /></label>
        <p class="rsv-error" id="f-error" style="display:none"></p>
        <button class="rsv-boton" id="f-enviar" style="width:100%;margin-top:14px">${T("confirmar")}</button>
        <button class="rsv-boton secundario" id="f-cancelar" style="width:100%;margin-top:8px">${T("cancelar")}</button>
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
      err.textContent = T("completa");
      err.style.display = "block";
      return;
    }
    const btn = $("#f-enviar");
    btn.disabled = true;
    btn.textContent = T("procesando");
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
          price: d.prices[personas] != null ? d.prices[personas] : d.prices[1],
        })),
      };
      const r = await fetch(`${API}/api/book/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || T("errorReserva"));

      // Mostrar la reserva recién creada en la MISMA tarjeta (datos + check-in
      // + medios de pago), como si la hubiera consultado.
      let mostrada = false;
      if (data.booking_id && window.kuyaySetReserva) {
        try {
          const lr = await fetch(`${API}/api/book/lookup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numeroReserva: String(data.booking_id) }),
          });
          const ld = await lr.json();
          if (ld.encontrada && ld.reserva) {
            cerrarModal();
            window.kuyaySetReserva(ld.reserva);
            mostrada = true;
          }
        } catch (e) {
          /* si falla la consulta, mostramos el mensaje simple abajo */
        }
      }
      if (!mostrada) {
        abrirModal(`
          <div class="rsv-ok">${T("okTitulo")}<br>${T("okCodigo")}: <strong>${esc(data.booking_id || "—")}</strong></div>
          <p class="rsv-desc" style="margin-top:10px">${T("okTexto")}</p>
          <button class="rsv-boton" style="width:100%;margin-top:12px" id="rsv-fin">${T("listo")}</button>`);
        $("#rsv-fin").addEventListener("click", cerrarModal);
      }
    } catch (e) {
      btn.disabled = false;
      btn.textContent = T("confirmar");
      err.textContent = e.message || T("errorReserva");
      err.style.display = "block";
    }
  }

  // ---------- Arranque + re-traducción al cambiar idioma ----------
  function iniciar() {
    if (window.ES_KIOSKO) document.body.classList.add("kiosko");
    montar();
    if (window.I18N && window.I18N.onChange) {
      window.I18N.onChange(() => montar()); // re-render en el idioma nuevo (conserva fechas/resultados)
    }
  }
  if (document.readyState !== "loading") iniciar();
  else document.addEventListener("DOMContentLoaded", iniciar);
})();
