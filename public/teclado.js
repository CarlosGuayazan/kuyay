// =====================================================================
//  TECLADO EN PANTALLA (para la isla de registro con pantalla táctil)
// ---------------------------------------------------------------------
//  Aparece SOLO cuando hace falta:
//   - En celulares/tablets NO se muestra (el sistema ya tiene teclado).
//   - En una computadora CON pantalla táctil (tu isla) SÍ se muestra.
//   - Si la dirección termina en "?kiosko=1", se fuerza siempre
//     (úsalo como la dirección fija de tu isla de registro).
// =====================================================================

(function () {
  // ---- 1) Decidir si debemos mostrar el teclado ----
  // Usamos la misma detección de kiosko que app.js (window.ES_KIOSKO).
  if (!window.ES_KIOSKO) return; // No se necesita teclado en pantalla.
  if (!window.SimpleKeyboard) return; // Por si el CDN no cargó.

  const Keyboard = window.SimpleKeyboard.default;

  // ---- 2) Crear el contenedor del teclado (fijo abajo) ----
  const contenedor = document.createElement("div");
  contenedor.id = "teclado-tactil";
  contenedor.className = "teclado-oculto";
  contenedor.innerHTML = '<div class="simple-keyboard"></div>';
  document.body.appendChild(contenedor);

  let inputActivo = null; // El campo que el huésped está llenando.

  // ---- 3) Configurar el teclado ----
  const teclado = new Keyboard(".simple-keyboard", {
    onChange: (texto) => {
      if (inputActivo) {
        inputActivo.value = texto;
        // Avisamos a la app por si hay validaciones que dependan del valor.
        inputActivo.dispatchEvent(new Event("input", { bubbles: true }));
      }
    },
    onKeyPress: (boton) => {
      if (boton === "{shift}" || boton === "{lock}") alternarMayusculas();
      if (boton === "{enter}") ocultar();
    },
    layout: {
      default: [
        "1 2 3 4 5 6 7 8 9 0 {bksp}",
        "q w e r t y u i o p",
        "a s d f g h j k l ñ",
        "{shift} z x c v b n m @ . {shift}",
        "{space} {enter}",
      ],
      shift: [
        "1 2 3 4 5 6 7 8 9 0 {bksp}",
        "Q W E R T Y U I O P",
        "A S D F G H J K L Ñ",
        "{shift} Z X C V B N M @ . {shift}",
        "{space} {enter}",
      ],
    },
    display: etiquetasIdioma(),
  });

  // Textos de las teclas especiales, según el idioma actual.
  function etiquetasIdioma() {
    const t = (clave, alt) => (window.I18N ? I18N.t(clave) : alt);
    return {
      "{bksp}": t("kbBorrar", "⌫ Borrar"),
      "{enter}": t("kbListo", "Listo ✓"),
      "{space}": t("kbEspacio", "espacio"),
      "{shift}": t("kbMayus", "⇧ Mayús"),
    };
  }

  // Si el huésped cambia de idioma, actualizamos las teclas especiales.
  if (window.I18N) {
    I18N.onChange(() => teclado.setOptions({ display: etiquetasIdioma() }));
  }

  function alternarMayusculas() {
    const actual = teclado.options.layoutName;
    teclado.setOptions({
      layoutName: actual === "default" ? "shift" : "default",
    });
  }

  function mostrar() {
    contenedor.classList.remove("teclado-oculto");
    document.body.classList.add("con-teclado");
  }

  function ocultar() {
    contenedor.classList.add("teclado-oculto");
    document.body.classList.remove("con-teclado");
    if (inputActivo) inputActivo.blur();
    inputActivo = null;
  }

  // ---- 4) Conectar el teclado con CUALQUIER campo de texto ----
  //  Usamos DELEGACIÓN de eventos (escuchamos en todo el documento) en vez de
  //  enganchar campo por campo al cargar. Así también funciona en los campos
  //  que se crean dinámicamente, como el módulo "Consulta tu disponibilidad"
  //  y el formulario de reserva (antes el teclado no se activaba ahí).
  function esCampoDeTexto(el) {
    if (!el || el.tagName !== "INPUT") return false;
    if (el.readOnly || el.disabled) return false; // p. ej. los campos de fecha
    if (el.hasAttribute("data-no-teclado")) return false;
    const tipo = (el.getAttribute("type") || "text").toLowerCase();
    return ["text", "email", "search", "tel", "url", "password"].includes(tipo);
  }

  document.addEventListener("focusin", (evento) => {
    const campo = evento.target;
    if (!esCampoDeTexto(campo)) return;
    inputActivo = campo;
    teclado.setInput(campo.value);
    teclado.setOptions({ layoutName: "default" });
    mostrar();
    // Desplazamos el campo a la vista para que el teclado no lo tape.
    setTimeout(
      () => campo.scrollIntoView({ block: "center", behavior: "smooth" }),
      150
    );
  });

  // ---- 5) Ocultar el teclado al tocar fuera de un campo o del teclado ----
  document.addEventListener("mousedown", (evento) => {
    const dentroDelTeclado = contenedor.contains(evento.target);
    if (!dentroDelTeclado && !esCampoDeTexto(evento.target)) ocultar();
  });
})();
