// =============================================================
//  REPORTAR PAGO (intermediario seguro)
// -------------------------------------------------------------
//  Reporta a Dapta un pago en efectivo confirmado por la máquina.
//  La x-api-key del reporte vive aquí, oculta del navegador.
//  El navegador envía los datos del pago; aquí los reenviamos.
// =============================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  const url = process.env.DAPTA_REPORT_URL;
  const apiKey = process.env.DAPTA_REPORT_API_KEY;
  if (!url || !apiKey) {
    return res.status(500).json({
      error:
        "Falta configuración del reporte (DAPTA_REPORT_URL / DAPTA_REPORT_API_KEY).",
    });
  }

  const datos = req.body || {};

  try {
    const r = await fetch(`${url}?x-api-key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { accept: "*/*", "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const data = await r.json().catch(() => ({}));
    return res.status(r.status).json({ ok: r.ok, data });
  } catch (err) {
    return res.status(502).json({ error: "No se pudo reportar el pago." });
  }
}
