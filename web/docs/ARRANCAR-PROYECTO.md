# Guía de Arranque — Don Palito Jr (Sesión de Desarrollo)

> **Leer antes de empezar cada sesión.**
> El registro de usuarios (Clerk → MongoDB) requiere ngrok activo, y la URL de ngrok **cambia cada vez que se reinicia** en el plan gratuito — por eso hay un paso de configuración en Clerk Dashboard al inicio de cada sesión.

---

## Requisitos previos (solo la primera vez)

- [ ] Node.js instalado
- [ ] ngrok instalado y autenticado (`ngrok config add-authtoken TU_TOKEN`)
- [ ] `.env` del backend completo (ver sección al final)
- [ ] `.env` del frontend (`web/.env`) completo

---

## Pasos de arranque (cada sesión)

### Terminal 1 — Backend

```bash
cd D:\1_donpalitojr\donpalitojrweb\backend
npm run dev:all
```

Espera hasta ver:
```
✅ Connected to MongoDB: ac-i2u3ijh-...
🚀 Server is up and running!
💻 Local: http://localhost:3000
```
> Inngest también arranca (`starting server on 0.0.0.0:8288`). La primera vez descarga el CLI vía npx, espera un momento.

---

### Terminal 2 — ngrok

```bash
ngrok http 3000
```

Copia la URL que aparece en `Forwarding`, por ejemplo:
```
https://abc123def456.ngrok-free.app
```

> ⚠️ Esta URL **cambia en cada sesión** si usas el plan gratuito de ngrok.
> Si quieres URL fija: activa el **Static Domain** gratuito en [dashboard.ngrok.com](https://dashboard.ngrok.com/domains).

---

### Paso obligatorio — Actualizar Clerk Dashboard (si la URL de ngrok cambió)

1. Ve a [dashboard.clerk.com](https://dashboard.clerk.com)
2. Selecciona tu app **"Don Palito Jr Dev"**
3. Menú izquierdo → **Webhooks**
4. Clic en tu endpoint existente → botón **Edit** (ícono lápiz ✏️)
5. Reemplaza la URL con la nueva de ngrok **+ el path al final**:
   ```
   https://abc123def456.ngrok-free.app/api/webhooks/clerk
   ```
6. Guarda los cambios

> Si la URL de ngrok **no cambió** (Static Domain), saltea este paso.

---

### Terminal 3 — Frontend (web)

```bash
cd D:\1_donpalitojr\donpalitojrweb\web
npm run dev
```

Accede en: **http://localhost:5173**

> Si el admin también está corriendo, el web puede quedar en `localhost:5174`. Verifica en la terminal qué puerto asignó Vite.

---

### (Opcional) Stripe CLI — Para probar pagos con webhook local

Si necesitas probar el webhook de Stripe (eventos de pago):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copia el `whsec_...` que imprime y ponlo en `backend/.env` como `STRIPE_WEBHOOK_SECRET`.

---

## Verificar que todo funciona

| Prueba | Resultado esperado |
|---|---|
| Abrir `http://localhost:3000` | Respuesta del backend (o 404 en `/`) |
| Registrar usuario nuevo | En terminal del backend: `Webhook received: user.created` → `User created in DB` |
| Ver en ngrok | `POST /api/webhooks/clerk  200 OK` |
| Agregar producto al carrito | Carrito persiste al recargar página |
| Pagar con `4242 4242 4242 4242` | Redirige a `/checkout/exito` con botón WhatsApp |

---

## Reiniciar servidor de desarrollo (Google Antigravity / PowerShell)

El `h + enter` / `q + enter` es solo para Vite (frontend). Para el backend con `concurrently`, usa `Ctrl+C` y luego:

```bash
npm run dev:all
```

---

## Variables de entorno

### `web/.env`
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...       # Clerk → API Keys → Publishable Key
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...      # Stripe Dashboard → Developers → API Keys
VITE_ADMIN_URL=http://localhost:5174
```

### `backend/.env`
```env
NODE_ENV=development
PORT=3000

DB_URL=mongodb+srv://...                     # MongoDB Atlas → Connect → Drivers

CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...                 # Clerk → API Keys → Secret Key
CLERK_WEBHOOK_SECRET=whsec_...               # Clerk → Webhooks → tu endpoint → Signing Secret

CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_CLOUD_NAME=...

STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...                # Stripe → Developers → API Keys
STRIPE_WEBHOOK_SECRET=whsec_...              # Stripe CLI output al ejecutar stripe listen

INNGEST_SIGNING_KEY=                         # Dejar vacío en desarrollo local
```

---

## Problemas comunes

### `"inngest" no se reconoce...`
El script ya fue corregido en `backend/package.json` para usar `npx inngest-cli@latest`.
Si vuelve a aparecer, verifica que el script diga:
```json
"inngest": "npx inngest-cli@latest dev -u http://localhost:3000/api/inngest"
```

### ngrok muestra `POST /` con 404
La URL en Clerk Dashboard no tiene el path. Debe terminar en `/api/webhooks/clerk`.

### Usuario registrado en Clerk pero NO aparece en MongoDB
Causas posibles:
1. ngrok no está corriendo
2. URL del webhook en Clerk Dashboard desactualizada (sesión nueva de ngrok)
3. `CLERK_WEBHOOK_SECRET` en `backend/.env` no coincide con el Signing Secret del endpoint

### Frontend no conecta con el backend (CORS error)
El backend permite `localhost:5173` y `localhost:5174`. Si Vite asigna otro puerto, agrégalo en `backend/src/server.js` en el array `allowedOrigins`.

---

## Estructura de terminales en sesión activa

```
Terminal 1  →  backend:    npm run dev:all        (puerto 3000 + Inngest 8288)
Terminal 2  →  ngrok:      ngrok http 3000         (túnel HTTPS → localhost:3000)
Terminal 3  →  frontend:   npm run dev             (puerto 5173 o 5174)
Terminal 4  →  stripe cli: stripe listen --forward-to localhost:3000/api/stripe/webhook  (opcional)
```

---

*Mantenido por: Jair González Buelvas — DarkerJB*
*Última actualización: 24 de febrero de 2026*
