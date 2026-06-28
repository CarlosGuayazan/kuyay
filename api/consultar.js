// =============================================================
//  INTERMEDIARIO SEGURO (Serverless Function de Vercel)
// -------------------------------------------------------------
//  Este archivo corre EN LA NUBE, no en el navegador.
//  Aquí es donde vive tu clave secreta (x-api-key), guardada
//  como "Variable de Entorno" en Vercel. El navegador nunca la ve.
//
//  Flujo:
//    Navegador  ->  /api/consultar (este archivo)  ->  Dapta
// =============================================================

export default async function handler(req, res) {
  // Solo aceptamos peticiones POST.
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  // Vercel ya entrega el body como objeto JSON en req.body.
  const { nombre, telefono, numeroReserva, email } = req.body || {};

  // 1) CONSULTA DIRECTA A LOBBYPMS (vía nuestra API del VPS). Determinística.
  //    Si encuentra la reserva, respondemos de inmediato.
  if (numeroReserva || email || nombre || telefono) {
    try {
      const LOOKUP_URL =
        process.env.LOOKUP_URL || "https://limpieza.kuyay.co/api/book/lookup";
      const lr = await fetch(LOOKUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroReserva, email, nombre, telefono }),
      });
      if (lr.ok) {
        const ld = await lr.json();
        if (ld && ld.encontrada && ld.reserva) {
          console.log(`[consultar] LobbyPMS directo OK booking_id=${ld.reserva.booking_id}`);
          return res.status(200).json({ encontrada: true, reserva: ld.reserva });
        }
      }
    } catch (e) {
      console.error("[consultar] lookup directo falló, uso Dapta:", e && e.message);
    }
  }

  // 2) RESPALDO: Dapta (agente de IA). Solo si lo de arriba no encontró nada.
  const apiKey = process.env.DAPTA_API_KEY;
  const baseUrl = process.env.DAPTA_URL;

  if (!apiKey || !baseUrl) {
    // Sin Dapta configurado: devolvemos "no encontrada" (no es un error fatal).
    return res.status(200).json({ encontrada: false });
  }

  // Construimos el texto que tu webhook espera dentro de "informacion".
  // Solo agregamos los datos que el usuario realmente escribió.
  const partes = [];
  if (numeroReserva) partes.push(`reservation number: ${numeroReserva}`);
  if (email) partes.push(`email: ${email}`);
  if (telefono) partes.push(`Phone number: ${telefono}`);
  if (nombre) partes.push(`Name: ${nombre}`);

  if (partes.length === 0) {
    return res
      .status(400)
      .json({ error: "Debes enviar al menos un dato de búsqueda." });
  }

  const informacion = partes.join(", ");
  const url = `${baseUrl}?x-api-key=${encodeURIComponent(apiKey)}`;

  // Dapta es un agente de IA: a veces devuelve el JSON de la reserva y a veces
  // un texto de "razonamiento" que no es JSON. Por eso reintentamos hasta 3
  // veces cuando la respuesta no es una reserva válida.
  const MAX_INTENTOS = 3;
  let ultimoTexto = "";

  try {
    for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
      const respuesta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ informacion }),
      });

      const data = await respuesta.json();

      // Dapta responde un arreglo; el ÚLTIMO elemento trae el resultado final
      // (los anteriores son el "razonamiento" del agente, que ignoramos).
      let textoResultado = "";
      if (Array.isArray(data) && data.length > 0) {
        textoResultado = data[data.length - 1].text || "";
      } else if (data && typeof data.text === "string") {
        textoResultado = data.text;
      }
      ultimoTexto = textoResultado;

      // Intentamos interpretar el resultado como JSON (la reservación).
      let reserva = null;
      try {
        reserva = JSON.parse(textoResultado);
      } catch (_) {
        reserva = null;
      }

      console.log(
        `[consultar] intento ${intento}/${MAX_INTENTOS} | buscar: "${informacion}" | ` +
          (reserva && reserva.booking_id
            ? `OK booking_id=${reserva.booking_id}`
            : `sin reserva | respuesta: ${textoResultado.slice(0, 300)}`)
      );

      if (reserva && reserva.booking_id) {
        return res.status(200).json({ encontrada: true, reserva });
      }
      // Si no fue una reserva válida, reintentamos (salvo en el último intento).
    }

    // Agotamos los reintentos sin obtener una reserva válida.
    return res.status(200).json({
      encontrada: false,
      mensaje:
        ultimoTexto ||
        "No se encontró ninguna reservación con los datos proporcionados.",
    });
  } catch (err) {
    console.error("[consultar] error al consultar Dapta:", err && err.message);
    return res
      .status(502)
      .json({ error: "Error al consultar el servicio de reservaciones." });
  }
}
