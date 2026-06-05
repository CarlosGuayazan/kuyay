// =============================================================
//  CANCELAR PAGO EN EFECTIVO (intermediario seguro)
// -------------------------------------------------------------
//  Proxy de POST /api/payments/current/cancel de la máquina.
// =============================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  const base = process.env.KIOSK_BASE_URL;
  const apiKey = process.env.KIOSK_API_KEY;
  if (!base || !apiKey) {
    return res.status(500).json({ error: "Falta configuración del kiosko." });
  }

  try {
    const r = await fetch(`${base}/api/payments/current/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await r.json().catch(() => ({}));
    return res.status(r.status).json(data);
  } catch (err) {
    return res
      .status(502)
      .json({ error: "Sin conexión con la máquina de efectivo." });
  }
}
