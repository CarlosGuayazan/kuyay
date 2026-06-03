# 🏨 Consulta de Reservaciones · Hotel Kuyay

Aplicación web sencilla para consultar reservaciones activas. El usuario
escribe su número de reservación o correo, y la página le muestra los
datos de su reserva.

La clave secreta (`x-api-key`) **nunca queda expuesta**: vive en un
"intermediario" en la nube (una función serverless de Vercel).

---

## 🧩 ¿Cómo está armado? (en simple)

```
[Navegador del usuario]
        │  escribe su correo / número de reserva
        ▼
[public/  → la página web]  (HTML + CSS + JavaScript)
        │  le pide datos a...
        ▼
[api/consultar.js  → el intermediario seguro]  ← aquí vive tu clave
        │  le pregunta a...
        ▼
[Tu webhook de Dapta]  →  Base de datos de reservaciones
```

| Carpeta / archivo     | ¿Qué hace?                                            |
| --------------------- | ----------------------------------------------------- |
| `public/index.html`   | La estructura de la página (el formulario)            |
| `public/style.css`    | Los colores y el diseño                               |
| `public/app.js`       | La lógica del navegador (enviar y mostrar resultados) |
| `api/consultar.js`    | El intermediario seguro que guarda tu clave           |
| `.env.example`        | Plantilla de tus secretos                             |
| `.gitignore`          | Evita subir secretos a GitHub                         |

---

## 🚀 PASO A PASO PARA PUBLICARLA

> No necesitas saber programar para seguir esto. Solo copia, pega y haz clic.

### 1) Crea tu cuenta en GitHub

1. Entra a https://github.com y crea una cuenta (gratis).
2. Haz clic en **New repository** (nuevo repositorio).
3. Ponle un nombre, por ejemplo: `kuyay-reservaciones`.
4. Déjalo en **Private** (privado) si no quieres que otros vean el código.
5. Clic en **Create repository**. (No marques agregar README, ya tienes uno.)

### 2) Sube esta carpeta a GitHub

La forma más fácil sin usar comandos:

1. Descarga **GitHub Desktop**: https://desktop.github.com
2. Instálalo e inicia sesión con tu cuenta de GitHub.
3. Menú **File → Add local repository** y elige esta carpeta
   (`kuyay-reservaciones`).
4. Te dirá que no es un repositorio aún → clic en **create a repository**.
5. Escribe un resumen (ej. "primera versión") y clic en **Commit**.
6. Clic en **Publish repository** para subirlo a la nube. ✅

> 💡 Cada vez que cambies algo: haces **Commit** + **Push** y queda
> guardada una nueva versión. Eso es "versionar".

### 3) Publica en Vercel (hosting gratis)

1. Entra a https://vercel.com y regístrate **con tu cuenta de GitHub**.
2. Clic en **Add New… → Project**.
3. Elige tu repositorio `kuyay-reservaciones` → **Import**.
4. **MUY IMPORTANTE — antes de hacer Deploy**, abre la sección
   **Environment Variables** y agrega estas dos:

   | Name (nombre)    | Value (valor)                                                                 |
   | ---------------- | ----------------------------------------------------------------------------- |
   | `DAPTA_API_KEY`  | tu clave real de Dapta                                                         |
   | `DAPTA_URL`      | `https://api.dapta.ai/api/cegruizgmailcom-173-176-8/kuyay-future-reservations-source` |

   (Toma `DAPTA_URL` **sin** el `?x-api-key=...` del final.)

5. Clic en **Deploy** y espera ~1 minuto.
6. Vercel te dará una dirección tipo `https://kuyay-reservaciones.vercel.app`
   👉 ¡Esa es tu app en vivo!

---

## 🔒 Sobre la seguridad y privacidad

- **Tu clave está protegida**: solo el intermediario (`api/consultar.js`)
  la conoce, leyéndola de las variables de entorno de Vercel. El navegador
  nunca la recibe.
- **Nunca subas el archivo `.env`** a GitHub (el `.gitignore` ya lo evita).
- **Privacidad de huéspedes**: hoy cualquiera que escriba un correo o número
  de reserva válido puede ver esos datos. Si quieres mayor protección,
  podemos exigir **dos datos que coincidan** (ej. número de reserva + correo)
  antes de mostrar la información. Pídemelo y lo agrego.

---

## 🛠️ ¿Quieres probarla en tu computadora antes de publicar? (opcional)

Necesitas tener instalado [Node.js](https://nodejs.org) (versión 18+).

```powershell
# 1) Instala la herramienta de Vercel (una sola vez)
npm install -g vercel

# 2) Crea tu archivo de secretos local
#    Copia .env.example y renómbralo a .env, y pon tu clave real

# 3) Dentro de la carpeta del proyecto, ejecuta:
vercel dev
```

Luego abre la dirección que te muestre (normalmente
`http://localhost:3000`).

---

## 📡 Detalle técnico del webhook (referencia)

- **Método:** `POST`
- **Body:** JSON con un único campo `informacion`
- **Formato del valor:** etiquetas separadas por coma, por ejemplo:
  `"reservation number: 20491561, email: ilugo.398043@guest.booking.com"`
- **Etiquetas válidas:** `Name:`, `Phone number:`, `reservation number:`, `email:`
  (con enviar **una** basta).
- **Respuesta:** un arreglo; el último elemento (`.text`) contiene el JSON de
  la reservación, o el mensaje "No se encontró ninguna reservación...".
