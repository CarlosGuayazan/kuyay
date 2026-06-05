// =============================================================
//  ESTADO DEL PAGO EN EFECTIVO (intermediario seguro)
// -------------------------------------------------------------
//  El kiosko (navegador) consulta esto cada par de segundos para
//  saber cuánto se ha recibido y si el pago ya se completó.
//  Proxy de GET /api/payments/current de la máquina.
// =============================================================

export default async function handler(req, res) {
  const base = process.env.KIOSK_BASE_URL;
  const apiKey = process.env.KIOSK_API_KEY;
  if (!base || !apiKey) {
    return res.status(500).json({ error: "Falta configuración del kiosko." });
  }

  try {
    const r = await fetch(`${base}/api/payments/current`, {
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
