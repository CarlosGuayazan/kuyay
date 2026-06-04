// =============================================================
//  TRM del día (Tasa Representativa del Mercado)
// -------------------------------------------------------------
//  Obtiene la TRM oficial de Colombia desde el portal de datos
//  abiertos del gobierno (datos.gov.co). La usamos para calcular
//  los montos en dólares (PayPal y Criptomonedas).
// =============================================================

export default async function handler(req, res) {
  try {
    const url =
      "https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=1";

    const respuesta = await fetch(url);
    const data = await respuesta.json();

    const valor = data && data[0] && parseFloat(data[0].valor);

    if (!valor || Number.isNaN(valor)) {
      return res.status(502).json({ error: "No se pudo obtener la TRM." });
    }

    // Cacheamos 1 hora en el borde de Vercel (la TRM cambia 1 vez al día).
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json({ trm: valor, fecha: data[0].vigenciadesde });
  } catch (err) {
    return res.status(502).json({ error: "Error al obtener la TRM." });
  }
}
