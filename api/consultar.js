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

  // Leemos la configuración secreta desde las Variables de Entorno.
  // (Las configurarás en Vercel; nunca van dentro del código.)
  const apiKey = process.env.DAPTA_API_KEY;
  const baseUrl = process.env.DAPTA_URL;

  if (!apiKey || !baseUrl) {
    return res.status(500).json({
      error:
        "Falta configuración del servidor. Define DAPTA_API_KEY y DAPTA_URL en Vercel.",
    });
  }

  // Vercel ya entrega el body como objeto JSON en req.body.
  const { nombre, telefono, numeroReserva, email } = req.body || {};

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
