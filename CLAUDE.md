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
   arreglo; el último `.text` trae el JSON de la reserva.
2. **TRM** (`api/trm.js`): tasa oficial COP/USD de datos.gov.co. Para PayPal y
   cripto el monto en USD = saldo ÷ (TRM − 300).
3. **Máquina de efectivo del kiosko** (`api/efectivo*.js`): servicio local en el
   laptop NV11 expuesto por **ngrok**. Contrato en `Downloads/INTEGRATION.md`.
   El cambio se entrega **solo en billetes de $5.000** (lo que sobra =
   `changeShortfall`).
4. **Reporte de pago** (`api/reportar-pago.js`): al confirmar efectivo, reporta
   a Dapta y la app marca "Pagado" en la sesión (la BD real se actualiza en
   minutos).

## Variables de entorno (secretas — se configuran en Vercel y en `.env` local)

Nombres (los valores NO van aquí ni en GitHub):
- `DAPTA_API_KEY`, `DAPTA_URL` — consulta de reservas
- `KIOSK_BASE_URL`, `KIOSK_API_KEY`, `KIOSK_WEBHOOK_SECRET` — máquina de efectivo
- `DAPTA_REPORT_URL`, `DAPTA_REPORT_API_KEY` — reporte de pagos

En Vercel: Settings → Environment Variables → agregar → **Redeploy**.

## Versión kiosko (isla de registro)

Se activa si la URL trae **`?kiosko=1`** o si es una computadora con pantalla
táctil. Diferencias vs. la versión normal:
- Muestra **teclado en pantalla** para escribir la búsqueda.
- Agrega el método de pago **Efectivo** (no aparece en la versión normal).
- Los enlaces externos (check-in, Wompi, cripto, Ayllu/Yachi) se muestran como
  **códigos QR** para continuar en el celular.

## Métodos de pago (aparecen si hay saldo pendiente)

Transferencia, Wompi (+5%), PayPal, Criptomonedas, y **Efectivo (solo kiosko,
sin recargo)**. Enlaces de reserva: Ayllu → `reservasayllu.kuyay.co`, Yachi →
`reservasyachi.kuyay.co`.

## Estado actual (al 2026-06-05)

✅ Completo y en producción: consulta, check-in, disponibilidad, teclado kiosko,
pagos (transferencia/Wompi/PayPal/cripto), modo kiosko con QR, 6 idiomas,
identidad de marca (logo, banner, colores, favicon), pago en **efectivo** con
reporte a Dapta.

⏳ Pendientes / a verificar:
- Confirmar que en **Vercel** estén las 7 variables de entorno y hacer Redeploy.
- El **módulo de efectivo** del kiosko debe estar encendido (el `/health` dio
  502 cuando estaba apagado).
- Producción confirmada en **https://cheking.kuyay.co**.

## Flujo para hacer cambios

```powershell
# (dentro de C:\Users\SOPORTE\kuyay-reservaciones)
git add .
git commit -m "describe el cambio"
git push        # Vercel re-publica solo
```
Nunca subir `.env` (está protegido por `.gitignore`).
