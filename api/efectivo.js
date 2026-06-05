// =============================================================
//  INICIAR PAGO EN EFECTIVO (intermediario seguro)
// -------------------------------------------------------------
//  Llama a la máquina de efectivo del kiosko (vía su túnel ngrok)
//  para iniciar un cobro. La API_KEY vive aquí, oculta del navegador.
// =============================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  const base = process.env.KIOSK_BASE_URL;
  const apiKey = process.env.KIOSK_API_KEY;
  if (!base || !apiKey) {
    return res
      .status(500)
      .json({ error: "Falta configuración del kiosko (KIOSK_BASE_URL / KIOSK_API_KEY)." });
  }

  const { reference, amount } = req.body || {};
  if (!reference || !amount) {
    return res.status(400).json({ error: "Faltan datos del pago (reference, amount)." });
  }

  // El webhook de resultado regresará a nuestra propia app.
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const callbackUrl = `${proto}://${host}/api/efectivo-webhook`;

  try {
    const r = await fetch(`${base}/api/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ amount, reference, callbackUrl }),
    });

    const data = await r.json().catch(() => ({}));
    // Pasamos tal cual el estado (incluye 409 si la máquina está ocupada).
    return res.status(r.status).json(data);
  } catch (err) {
    return res
      .status(502)
      .json({ error: "No se pudo conectar con la máquina de efectivo." });
  }
}
