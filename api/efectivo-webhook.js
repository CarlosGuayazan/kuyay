// =============================================================
//  WEBHOOK DE RESULTADO DEL PAGO EN EFECTIVO
// -------------------------------------------------------------
//  La máquina del kiosko nos avisa aquí el resultado final,
//  FIRMADO. Verificamos la firma con el WEBHOOK_SECRET antes de
//  confiar en el contenido (HMAC-SHA256 sobre el cuerpo crudo).
//
//  Importante: leemos el cuerpo CRUDO (sin parsear) para validar
//  la firma exactamente sobre los mismos bytes que firmó el kiosko.
// =============================================================

import crypto from "crypto";

// Le pedimos a Vercel que NO parsee el cuerpo: lo necesitamos crudo.
export const config = { api: { bodyParser: false } };

function leerCuerpoCrudo(req) {
  // En el servidor de prueba local ya viene en req.rawBody.
  if (typeof req.rawBody === "string") return Promise.resolve(req.rawBody);
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido." });
  }

  const secret = process.env.KIOSK_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Falta KIOSK_WEBHOOK_SECRET." });
  }

  const raw = await leerCuerpoCrudo(req);
  const firmaRecibida = req.headers["x-kiosk-signature"] || "";
  const firmaEsperada =
    "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");

  let valida = false;
  try {
    valida =
      firmaRecibida.length === firmaEsperada.length &&
      crypto.timingSafeEqual(
        Buffer.from(firmaRecibida),
        Buffer.from(firmaEsperada)
      );
  } catch (_) {
    valida = false;
  }

  if (!valida) {
    return res.status(401).json({ error: "Firma inválida." });
  }

  // Log del resultado completo y firmado (la fuente confiable de la máquina).
  console.log("[efectivo-webhook] resultado firmado:", raw);

  // Firma válida: el resultado es confiable.
  // El kiosko es la fuente de verdad (el navegador consulta el estado),
  // así que aquí solo confirmamos la recepción (2xx) para que no reintente.
  // Si en el futuro quieres registrar el pago en una base de datos, este
  // es el lugar correcto para hacerlo.
  return res.status(200).json({ received: true });
}
