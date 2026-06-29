// =====================================================================
//  PRIVACIDAD DEL KIOSKO (isla de registro)
// ---------------------------------------------------------------------
//  Evita que los datos de un huésped queden en pantalla para el siguiente.
//   - Reinicio AUTOMÁTICO por inactividad: si nadie toca la pantalla por
//     INACTIVIDAD_MS, la app vuelve sola al inicio (recarga limpia → no
//     queda nada del huésped anterior).
//   - AVISO con cuenta regresiva AVISO_MS antes, con botón "Sigo aquí",
//     para no borrar mientras alguien está leyendo sus datos.
//   - Botón "Finalizar" siempre visible para cerrar manualmente.
//   - NUNCA reinicia si hay un pago en curso (misma guarda que el auto-deploy).
//  Solo actúa en modo kiosko (?kiosko=1).
// =====================================================================

(function () {
  if (!window.ES_KIOSKO) return;

  const INACTIVIDAD_MS = 90000; // 90 s sin tocar -> vuelve al inicio
  const AVISO_MS = 15000; // muestra el aviso 15 s antes de reiniciar

  // Textos en los 6 idiomas (si falta uno, cae a EN y luego ES).
  const TXT = {
    es: { finalizar: "Finalizar", aviso: "¿Sigues ahí? Volvemos al inicio en {s} s", sigo: "Sigo aquí" },
    en: { finalizar: "Finish", aviso: "Still there? Returning to start in {s} s", sigo: "I'm still here" },
    de: { finalizar: "Beenden", aviso: "Noch da? Rückkehr zum Start in {s} s", sigo: "Ich bin noch da" },
    fr: { finalizar: "Terminer", aviso: "Toujours là ? Retour à l'accueil dans {s} s", sigo: "Je suis là" },
    zh: { finalizar: "结束", aviso: "还在吗？{s} 秒后返回首页", sigo: "我还在" },
    ja: { finalizar: "終了", aviso: "まだいますか？{s} 秒後に最初に戻ります", sigo: "います" },
  };
  const lang = () => (window.I18N && window.I18N.lang) || "es";
  const t = (k) => ((TXT[lang()] || TXT.en)[k] || TXT.es[k]);

  // ¿El huésped está ocupado? (pago abierto o escribiendo) -> no reiniciar.
  function ocupado() {
    if (document.querySelector("#modal-pago:not(.oculto)")) return true;
    const a = document.activeElement;
    return !!(a && a.matches && a.matches("input, textarea, select"));
  }

  const reiniciar = () => location.reload(); // recarga limpia (?kiosko=1 se conserva)

  // ---- Botón "Finalizar" (siempre visible) ----
  const btn = document.createElement("button");
  btn.id = "kiosko-finalizar";
  btn.type = "button";
  btn.addEventListener("click", reiniciar);

  // ---- Overlay de aviso con cuenta regresiva ----
  const overlay = document.createElement("div");
  overlay.id = "kiosko-aviso";
  overlay.innerHTML =
    '<div class="kiosko-aviso-card">' +
    '<p id="kiosko-aviso-texto"></p>' +
    '<button type="button" id="kiosko-aviso-sigo"></button>' +
    "</div>";

  function montar() {
    document.body.appendChild(btn);
    document.body.appendChild(overlay);
    pintarTextos();
    overlay.querySelector("#kiosko-aviso-sigo").addEventListener("click", reiniciarTimer);
    // Tocar el fondo del aviso también cuenta como "sigo aquí".
    overlay.addEventListener("click", (e) => { if (e.target === overlay) reiniciarTimer(); });
    reiniciarTimer();
  }

  function pintarTextos() {
    btn.textContent = "✕ " + t("finalizar");
    overlay.querySelector("#kiosko-aviso-sigo").textContent = t("sigo");
  }

  let timerInactivo = null;
  let timerCuenta = null;
  let segs = 0;

  function pintarCuenta() {
    overlay.querySelector("#kiosko-aviso-texto").textContent = t("aviso").replace("{s}", segs);
  }

  function mostrarAviso() {
    // Si está ocupado (pago/escribiendo), no avisamos: posponemos el chequeo.
    if (ocupado()) { reiniciarTimer(); return; }
    segs = Math.round(AVISO_MS / 1000);
    pintarCuenta();
    overlay.classList.add("visible");
    timerCuenta = setInterval(() => {
      segs -= 1;
      if (segs <= 0) { clearInterval(timerCuenta); reiniciar(); return; }
      pintarCuenta();
    }, 1000);
  }

  function reiniciarTimer() {
    clearTimeout(timerInactivo);
    clearInterval(timerCuenta);
    overlay.classList.remove("visible");
    timerInactivo = setTimeout(mostrarAviso, INACTIVIDAD_MS - AVISO_MS);
  }

  // Cualquier actividad del huésped reinicia el contador.
  ["touchstart", "mousedown", "keydown", "input"].forEach((ev) =>
    document.addEventListener(ev, reiniciarTimer, { passive: true, capture: true })
  );

  // Al cambiar de idioma, actualizamos los textos.
  if (window.I18N && window.I18N.onChange) {
    window.I18N.onChange(() => { pintarTextos(); if (overlay.classList.contains("visible")) pintarCuenta(); });
  }

  if (document.body) montar();
  else document.addEventListener("DOMContentLoaded", montar);
})();
