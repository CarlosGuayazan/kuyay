# CLAUDE.md — Manual del proyecto (Kuyay Reservaciones)

> Este archivo lo lee Claude Code automáticamente al abrir el proyecto.
> Sirve para retomar y operar la app aunque haya pasado mucho tiempo.

## Qué es

App web para que los huéspedes del **Hostel Kuyay** (dos sedes: **Ayllu** y
**Yachi**) consulten su reservación, hagan check-in en línea, vean
disponibilidad y **paguen** (transferencia, Wompi, PayPal, criptomonedas y
**efectivo** en la isla de registro). Multi-idioma (ES, EN, DE, FR, ZH, JA).
Tiene una **versión normal** (celular/PC) y una **versión kiosko** (isla táctil).

El dueño es **Carlos Guayazan** (cegruiz@gmail.com). Está aprendiendo a
programar, así que las explicaciones deben ser claras y en **español**, y
conviene **previsualizar los cambios** antes de subirlos.

## Dónde está

- **GitHub:** https://github.com/CarlosGuayazan/kuyay  (rama principal: `main`)
- **Carpeta local:** `C:\Users\SOPORTE\kuyay-reservaciones`
- **Producción (Vercel):** **https://cheking.kuyay.co** (dominio propio).
- **Despliegue:** Vercel está conectado a GitHub → **cada `git push` a `main`
  re-publica solo** en ~1 minuto.

## Cómo correrlo localmente (para previsualizar)

```powershell
# 1) Necesita un archivo .env (NO está en GitHub). Copia .env.example a .env
#    y rellena los valores reales.
# 2) Levanta el servidor de prueba (imita a Vercel: sirve public/ y /api):
node dev-server.mjs
# 3) Abre:
#    http://localhost:3000            (versión normal)
#    http://localhost:3000/?kiosko=1  (versión isla/kiosko)
```
`dev-server.mjs` es solo para desarrollo local (está en `.gitignore`).

## Arquitectura

```
[Navegador]  →  [public/ (HTML/CSS/JS)]  →  [api/ (funciones serverless)]  →  Servicios externos
```
- `public/` = lo que ve el usuario. `api/` = intermediarios seguros que guardan
  las claves (el navegador nunca las ve).

### Archivos clave
| Archivo | Función |
|---------|---------|
| `public/index.html` | Estructura de la página |
| `public/style.css` | Diseño y colores de marca (naranja `#FF8800`) |
| `public/app.js` | Lógica: buscar reserva, mostrarla, kiosko, generar QR |
| `public/pagos.js` | Opciones de pago y sus ventanas (modales) |
| `public/i18n.js` | Todos los textos en 6 idiomas |
| `public/teclado.js` | Teclado en pantalla (solo kiosko) |
| `api/consultar.js` | Busca la reserva en el webhook de Dapta |
| `api/trm.js` | TRM del día (datos.gov.co) para montos en USD |
| `api/efectivo.js` | Inicia cobro en la máquina de efectivo del kiosko |
| `api/efectivo-estado.js` | Consulta el progreso del cobro (polling) |
| `api/efectivo-cancelar.js` | Cancela el cobro activo |
| `api/efectivo-webhook.js` | Recibe el resultado FIRMADO (verifica HMAC) |
| `api/reportar-pago.js` | Reporta a Dapta un pago en efectivo confirmado |

## Integraciones externas

1. **Dapta — consulta de reservas** (`api/consultar.js`): POST con
   `{ "informacion": "reservation number: 123" }` (etiquetas válidas:
   `Name:`, `Phone number:`, `reservation number:`, `email:`). Devuelve un
   arreglo; el último `.text` trae el JSON de la reserva. Dapta es un **agente
   de IA no determinista**: a veces devuelve el JSON y a veces un texto que no
   lo es. Por eso `consultar.js` **reintenta hasta 3 veces** cuando la respuesta
   no es una reserva válida. El navegador envía `{ numeroReserva, email,
   nombre, telefono }` (no `informacion` directo).
2. **TRM** (`api/trm.js`): tasa oficial COP/USD de datos.gov.co. Para PayPal y
   cripto el monto en USD = saldo ÷ (TRM − 300).
3. **Máquina de efectivo del kiosko** (`api/efectivo*.js`): servicio local en el
   laptop NV11 expuesto por **ngrok**. Contrato en `Downloads/INTEGRATION.md`.
   El cambio se entrega **solo en billetes de $5.000** (lo que sobra =
   `changeShortfall`). La máquina devuelve `collected` (efectivo recibido),
   `change` (cambio devuelto) y `changeShortfall` (cambio que no se pudo dar).
4. **Reporte de pago** (`api/reportar-pago.js`): al confirmar efectivo, reporta
   a Dapta y la app marca "Pagado" en la sesión (la BD real se actualiza en
   minutos). El reporte lo arma `public/pagos.js` (función `construirReporte`) así:
   - **`amount_Paid` = `collected − change`** → lo que el huésped realmente pagó.
   - **`due-balance` = `changeShortfall`** → cambio no devuelto (se le sigue debiendo).
   - `reservation-value` = `total_to_pay` de la reserva.
   - Ejemplo (verificado 2026-06-14): reserva $61.747, mete $75.000, devuelve
     $10.000 → `amount_Paid`=65.000, `due-balance`=3.253.

## Variables de entorno (secretas — se configuran en Vercel y en `.env` local)

Nombres (los valores NO van aquí ni en GitHub):
- `DAPTA_API_KEY`, `DAPTA_URL` — consulta de reservas
- `KIOSK_BASE_URL`, `KIOSK_API_KEY`, `KIOSK_WEBHOOK_SECRET` — máquina de efectivo
- `DAPTA_REPORT_URL`, `DAPTA_REPORT_API_KEY` — reporte de pagos

En Vercel: Settings → Environment Variables → agregar → **Redeploy**.

## Versión kiosko (isla de registro)

Se activa **ÚNICAMENTE si la URL trae `?kiosko`** (la isla usa la dirección fija
`https://cheking.kuyay.co/?kiosko=1`). La detección está en `public/app.js`
(`window.ES_KIOSKO`). En la versión normal (celular/PC, **incluso una PC con
pantalla táctil**) NO se muestran teclado en pantalla, QR ni efectivo.
> ⚠️ Antes la detección también se activaba por "pantalla táctil", lo que hacía
> aparecer QR/teclado en la versión normal desde PCs táctiles. Se corrigió el
> 2026-06-14: ahora depende solo de `?kiosko`.

Diferencias vs. la versión normal:
- Muestra **teclado en pantalla** para escribir la búsqueda.
- Agrega el método de pago **Efectivo** (no aparece en la versión normal).
- Los enlaces externos (check-in, Wompi, cripto, Ayllu/Yachi) se muestran como
  **códigos QR** para continuar en el celular.

## Métodos de pago (aparecen si hay saldo pendiente)

Transferencia, Wompi (+5%), PayPal, Criptomonedas, y **Efectivo (solo kiosko,
sin recargo)**. Enlaces de reserva: Ayllu → `reservasayllu.kuyay.co`, Yachi →
`reservasyachi.kuyay.co`.

## Estado actual (al 2026-06-14)

✅ Completo y en producción: consulta, check-in, disponibilidad, teclado kiosko,
pagos (transferencia/Wompi/PayPal/cripto), modo kiosko con QR, 6 idiomas,
identidad de marca (logo, banner, colores, favicon), pago en **efectivo** con
reporte a Dapta.

✅ Verificado el 2026-06-14 (pruebas reales con la máquina NV11):
- Reporte de pago en efectivo correcto: `amount_Paid` = `collected − change`,
  `due-balance` = `changeShortfall` (ver "Integraciones externas" punto 4).
- Búsqueda de reservas con reintento (Dapta es no determinista).
- Modo kiosko ahora depende **solo de `?kiosko`** (ya no por pantalla táctil).

⏳ Pendientes / a verificar:
- Confirmar que en **Vercel** estén las 7 variables de entorno y hacer Redeploy.
- El **módulo de efectivo** del kiosko debe estar encendido (el `/health` dio
  502 cuando estaba apagado).
- (Opcional) Limpiar logs de diagnóstico ruidosos (`[efectivo-estado]`).
- (Opcional) Auto-recarga del kiosko al detectar versión nueva (ver abajo).

## ⚠️ Cosas importantes que aprendimos (para retomar sin tropezar)

1. **Recargar el kiosko tras cada deploy.** El kiosko deja la página abierta;
   un `git push` NO se ve hasta **recargar la página** (`Ctrl + Shift + R`).
   Las cabeceras de Vercel ya revalidan (`max-age=0, must-revalidate`), el
   problema es la pestaña abierta con el JS viejo en memoria. (Esto causó un
   "falso bug" el 2026-06-14: el reporte salía con valores viejos.)
2. **Logs de diagnóstico en Vercel** (Observability → Logs). Útiles para depurar:
   - `[consultar]` — cada intento de búsqueda y qué devolvió Dapta.
   - `[reportar-pago]` — el JSON enviado a Dapta y su respuesta.
   - `[efectivo-webhook]` — el resultado completo y FIRMADO de la máquina (fuente confiable).
   - `[efectivo-estado]` — el snapshot del polling al completarse el pago.
3. **Dos fuentes de datos del pago en efectivo:** el **webhook firmado**
   (`api/efectivo-webhook.js`) y el **polling** (`api/efectivo-estado.js` →
   `GET /api/payments/current`). Ambos traen `collected`/`change`/`changeShortfall`.
   Hoy el reporte se arma en el navegador con el dato del polling.
4. **Probar las dos versiones por separado:** normal (`/`) y kiosko (`/?kiosko=1`).

## Flujo para hacer cambios

```powershell
# (dentro de C:\Users\SOPORTE\kuyay-reservaciones)
git add .
git commit -m "describe el cambio"
git push        # Vercel re-publica solo
```
Nunca subir `.env` (está protegido por `.gitignore`).
