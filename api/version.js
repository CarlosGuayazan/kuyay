// =============================================================
//  VERSIÓN DESPLEGADA
// -------------------------------------------------------------
//  Devuelve un identificador de la versión actual (el commit que
//  Vercel publicó). El kiosko lo consulta cada minuto y, si cambia,
//  se recarga solo para tomar el código nuevo. Así no hay que
//  acordarse de recargar la isla tras cada despliegue.
// =============================================================

export default function handler(req, res) {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    "dev";
  // Nunca lo caches: siempre queremos saber la versión real del momento.
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ version });
}
