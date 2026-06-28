// =============================================================
//  INTERMEDIARIO SEGURO — Cancelar reserva (Serverless de Vercel)
// -------------------------------------------------------------
//  El navegador NO habla con LobbyPMS directamente. Esta función
//  reenvía la cancelación a nuestra API del VPS (que tiene el token
//  y la IP autorizada), igual que /api/consultar.
//    Navegador  ->  /api/cancelar (este archivo)  ->  VPS /api/book/cancel
// =============================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }
  const { booking_id, sede } = req.body || {};
  if (!booking_id) {
    return res.status(400).json({ error: "Falta el número de reserva." });
  }

  const CANCEL_URL =
    process.env.CANCEL_URL || "https://limpieza.kuyay.co/api/book/cancel";

  try {
    const r = await fetch(CANCEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id, sede }),
    });
    const data = await r.json().catch(() => ({}));
    console.log(
      `[cancelar] booking=${booking_id} sede=${sede || "-"} -> ${r.status} ${JSON.stringify(data).slice(0, 160)}`
    );
    return res.status(r.status).json(data);
  } catch (e) {
    console.error("[cancelar] error:", e && e.message);
    return res.status(502).json({ error: "No se pudo conectar con el servicio de cancelación." });
  }
}
