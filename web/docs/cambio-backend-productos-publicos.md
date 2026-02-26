# Cambios de Backend — Don Palito Jr.

> Este documento registra todos los cambios realizados en `donpalitojrweb/backend` que Andrea debe revisar y, si aplica, portar a `ecommerce_app/backend`.

---

## [25-02-2026] — Sistema de Emails + Facturas + Statuses expandidos

**Realizado por:** Jair
**Estado:** ✅ Aplicado en `donpalitojrweb/backend` — pendiente revisión de Andrea

### Nuevos archivos creados

#### `backend/src/services/email.service.js`
Servicio completo de correos basado en **Nodemailer + Gmail** (portado de `ecommerce_app`).

Funciones exportadas:
- `sendWelcomeEmail({ userName, userEmail })` — bienvenida al registrarse
- `sendOrderCreatedAdminEmail(emailData)` — notificación al admin cuando llega un pedido
- `sendOrderCreatedClientEmail(emailData)` — confirmación al cliente cuando crea un pedido
- `sendOrderUpdatedAdminEmail({ orderId, newStatus, previousStatus, order })` — alerta interna de cambio de estado
- `sendOrderUpdatedClientEmail({ order, newStatus })` — notificación al cliente del nuevo estado
- `sendMarketingSubscriptionEmail({ userEmail, userName })` — bienvenida a marketing
- `sendInvoiceEmails({ order, pdfBuffer, csvContent, invoiceNumber })` — envía factura adjunta al cliente y al admin

**Adaptaciones respecto a ecommerce_app:**
- `statusConfig` en `sendOrderUpdatedClientEmail` expandido para los 7 estados
- Footer de copyright usa `ENV.APP_NAME || "Don Palito Jr"` en lugar de "MigaTech"

#### `backend/src/services/invoice.service.js`
Generación de facturas con **pdfkit** y **csv-writer** (portado sin modificaciones de `ecommerce_app`).

Funciones exportadas:
- `generateInvoicePDF(invoiceData)` → `Promise<Buffer>` — PDF A4 con: logo, datos del negocio, datos de entrega del cliente, tabla de ítems, IVA 19% desglosado (`base = lineTotal / 1.19`, `iva = lineTotal - base`), totales y pie de página.
- `generateInvoiceCSV(invoiceData)` → `string` — CSV con los mismos campos.

**Número de factura:** `FV-{año}-{orderId.slice(-8).toUpperCase()}`

### Dependencias añadidas a `package.json`
```json
"csv-writer": "^1.6.0",
"pdfkit": "^0.17.2"
```
Instalar con: `npm install`

### Archivos modificados

#### `backend/src/config/env.js`
Añadidas 6 variables nuevas:
```js
LOGO_URL: process.env.LOGO_URL || '',
COMPANY_NAME: process.env.COMPANY_NAME || 'Don Palito Junior',
COMPANY_NIT: process.env.COMPANY_NIT || '',
COMPANY_ADDRESS: process.env.COMPANY_ADDRESS || 'Cra 47 #76D Sur - 37',
COMPANY_CITY: process.env.COMPANY_CITY || 'Sabaneta, Antioquia',
COMPANY_PHONE: process.env.COMPANY_PHONE || '+57 314 870 2078',
```

#### `backend/src/models/order.model.js`
El `enum` del campo `status` se expandió de 3 a 7 valores:
```js
// ANTES:
enum: ["pending", "paid", "delivered"]

// DESPUÉS:
enum: ["pending", "paid", "in_preparation", "ready", "delivered", "canceled", "rejected"]
```

#### `backend/src/controllers/admin.controller.js`
Reescrito casi en su totalidad:

1. **`VALID_STATUSES`**: array con los 7 valores válidos para validar el cuerpo del request.
2. **`inferPaymentMethod(paymentResultId)`**: detecta `'stripe'` si el ID empieza con `pi_`, `'transferencia'` si empieza con `transfer_`.
3. **`updateOrderStatus`**:
   - Hace `.populate('user').populate('orderItems.product', 'name price')` para tener datos completos.
   - Cuando el nuevo estado es `"paid"`:
     - Genera factura PDF + CSV en un IIFE async (*fire-and-forget*) para no bloquear la respuesta HTTP.
     - Llama `sendInvoiceEmails()` con el buffer del PDF y el CSV.
   - Para cualquier otro estado: llama `sendOrderUpdatedAdminEmail` + `sendOrderUpdatedClientEmail` en paralelo con `Promise.allSettled`.
4. **`getAllCustomers`**: usa `.select("name email imageUrl addresses isActive createdAt documentType documentNumber gender dateOfBirth")` para devolver solo los campos necesarios.
5. **`updateCustomerStatus`** (nueva función): `PATCH /admin/customers/:customerId/status` recibe `{ isActive: boolean }` y actualiza el usuario con `{ $set: { isActive } }`.

#### `backend/src/routes/admin.routes.js`
Nueva ruta añadida:
```js
router.patch("/customers/:customerId/status", updateCustomerStatus);
```

#### `backend/src/config/inngest.js`
En la función `sync-user`, después de `User.create(newUser)`:
```js
sendWelcomeEmail({
  userName: `${first_name || ""} ${last_name || ""}`.trim() || "Usuario",
  userEmail: email_addresses[0]?.email_address,
}).catch(err => console.error("Error enviando welcome email:", err.message));
```
(Fire-and-forget: el error en el email no interrumpe la creación del usuario.)

#### `backend/src/controllers/order.controller.js`
Al final de la creación de pedido por transferencia, después del loop de reducción de stock:
```js
const emailData = { orderId, items, total, userName, userEmail, paymentMethod };
Promise.allSettled([
  sendOrderCreatedAdminEmail(emailData),
  sendOrderCreatedClientEmail(emailData),
]);
```

#### `backend/src/controllers/payment.controller.js`
En `handleWebhook`, al crear la orden vía Stripe:
```js
const dbUser = await User.findById(userId);
Promise.allSettled([
  sendOrderCreatedAdminEmail(emailData),
  sendOrderCreatedClientEmail(emailData),
]);
```

### Variables de entorno que Andrea debe agregar en `backend/.env`
```env
# Empresa (para facturas PDF/CSV)
LOGO_URL=                           # URL pública del logo (dejar vacío si no hay)
COMPANY_NAME=Don Palito Junior
COMPANY_NIT=900.123.456-7           # Ajustar al NIT real
COMPANY_ADDRESS=Cra 47 #76D Sur - 37
COMPANY_CITY=Sabaneta, Antioquia
COMPANY_PHONE=+57 314 870 2078

# Email (necesario para que los emails funcionen)
ADMIN_EMAIL=luchodonpalito@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Contraseña de aplicación de Google (no la contraseña normal)
```

> **Nota para Andrea:** Para generar la contraseña de aplicación de Google: Cuenta de Google → Seguridad → Verificación en dos pasos (debe estar activa) → Contraseñas de aplicaciones.

---

## [25-02-2026] — Sistema de Cupones: correcciones y endpoint público

**Realizado por:** Jair
**Estado:** ✅ Aplicado en `donpalitojrweb/backend` y `donpalitojrweb/web` — pendiente revisión de Andrea

### Contexto — bugs encontrados

1. **Cupones reutilizables indefinidamente**: el flujo de pedido por transferencia nunca registraba al usuario en `coupon.usedBy`, así que el backend siempre lo aceptaba como "no usado".
2. **`POST /payment/create-transfer-order` no existía**: el frontend hacía la llamada pero el backend devolvía 404, rompiendo todo el flujo de pago por transferencia bancaria.
3. **Carrusel del Home con datos hardcodeados**: `Home.jsx` usaba `mockData.js` en lugar de los cupones reales de la DB.

---

### Archivos backend modificados

#### `backend/src/controllers/coupon.controller.js`
Nueva función exportada `getActiveCoupons`:
- Retorna solo cupones donde `isActive: true` y que no hayan expirado
- Genera campo `description` automáticamente según `discountType`:
  - `percentage` → `"10% de descuento"`
  - `fixed` → `"$5.000 de descuento"`
- **No expone `usedBy`** (seguridad: el cliente no debe ver qué usuarios usaron cada cupón)
- Sin paginación — los cupones activos en un negocio pequeño son pocos

#### `backend/src/routes/coupon.routes.js`
Nueva ruta **pública** (sin `protectRoute`):
```js
// ANTES — solo rutas con auth:
router.post("/validate", protectRoute, validateCoupon);
router.get("/", protectRoute, adminOnly, getCoupons);
...

// DESPUÉS — se agrega ruta pública al inicio:
router.get("/active", getActiveCoupons);  // sin auth — para el marquee del Home
router.post("/validate", protectRoute, validateCoupon);
router.get("/", protectRoute, adminOnly, getCoupons);
...
```

> **Nota para Andrea:** Esta ruta va ANTES de las demás para evitar que Express la interprete como `/:id`. El orden en Express importa.

#### `backend/src/controllers/payment.controller.js`
Nueva función exportada `createTransferOrder`:
- Acepta `{ cartItems, shippingAddress, couponCode }` del body (igual que el frontend envía)
- Valida stock de cada producto en DB
- Valida el cupón: `isActive`, `expiresAt`, y si el usuario ya lo usó (`usedBy`)
- Calcula `totalPrice = subtotal - discount`
- Crea la orden con `status: "pending"` y `paymentResult: { id: "transfer_${Date.now()}", status: "pending" }`
- Reduce stock de cada producto
- **Marca el cupón como usado**: `Coupon.findOneAndUpdate({ code }, { $addToSet: { usedBy: user._id } })`
- Envía emails de creación al admin y al cliente (fire-and-forget)
- Retorna `{ order }`

#### `backend/src/routes/payment.routes.js`
```js
// ANTES:
router.post("/create-intent", protectRoute, createPaymentIntent);
router.post("/webhook", handleWebhook);

// DESPUÉS — ruta de transferencia añadida:
router.post("/create-intent", protectRoute, createPaymentIntent);
router.post("/create-transfer-order", protectRoute, createTransferOrder);
router.post("/webhook", handleWebhook);
```

---

### Impacto para mobile y admin

| Cambio | Mobile | Admin |
|---|---|---|
| `GET /coupons/active` (nuevo, público) | Sin impacto — mobile no usa esta ruta | Sin impacto — admin usa `GET /coupons` (adminOnly) |
| `POST /payment/create-transfer-order` (nuevo, protegido) | Sin impacto — mobile usa Stripe o su propio flujo | Sin impacto |
| Funciones existentes (`validateCoupon`, `createPaymentIntent`, webhook) | ✅ Sin cambios | ✅ Sin cambios |

---

## [25-02-2026] — Campo `firstOrderOnly` en Cupones

**Realizado por:** Jair
**Estado:** ✅ Aplicado en `donpalitojrweb/backend` — pendiente revisión de Andrea

### Contexto

El cupón `BIENVENIDO10` (10% de descuento) está pensado exclusivamente para el primer pedido de un cliente. Antes no existía mecanismo para restringirlo, por lo que cualquier usuario podía aplicarlo en pedidos posteriores.

---

### Archivos backend modificados

#### `backend/src/models/coupon.model.js`
Nuevo campo booleano añadido al schema (después del array `usedBy`):
```js
firstOrderOnly: {
  type: Boolean,
  default: false,
},
```

#### `backend/src/controllers/coupon.controller.js`

**1. Import añadido** al inicio del archivo:
```js
import { Order } from "../models/order.model.js";
```

**2. En `validateCoupon`**, después de la verificación de `alreadyUsed`:
```js
if (coupon.firstOrderOnly) {
  const orderCount = await Order.countDocuments({
    clerkId: req.user.clerkId,
    status: { $in: ["paid", "delivered", "in_preparation", "ready"] },
  });
  if (orderCount > 0) {
    return res.status(400).json({
      error: "Este cupón es válido solo para tu primera compra.",
    });
  }
}
```

**3. En `getActiveCoupons`**:
- Eliminado campo auto-generado `description` del resultado (era redundante con lo que ya muestra el frontend en el header de la tarjeta)
- Añadido `firstOrderOnly: c.firstOrderOnly ?? false` al objeto retornado
- `.select()` actualizado para incluir `firstOrderOnly`

---

### Migración de datos existentes

El campo tiene `default: false`, por lo que todos los documentos existentes siguen funcionando sin cambios. Para marcar `BIENVENIDO10` como exclusivo de primera compra:

```js
// Ejecutar en MongoDB Compass (pestaña Documents) o mongosh
db.coupons.updateOne({ code: "BIENVENIDO10" }, { $set: { firstOrderOnly: true } })
```

---

### Impacto para mobile y admin

| Cambio | Mobile | Admin |
|---|---|---|
| Campo `firstOrderOnly` en schema | ✅ Sin impacto (default false, cupones existentes intactos) | Admin puede leer y actualizar el campo via `PUT /coupons/:id` |
| Validación en `validateCoupon` | ✅ Sin impacto en cupones con `firstOrderOnly: false` | Sin impacto |
| `getActiveCoupons` sin `description` | Mobile no usa esta ruta | Sin impacto |

---

## [24-02-2026] — Rutas de Productos Públicas

**Fecha:** 2026-02-24
**Solicitado por:** Jair (Web Frontend)
**Pendiente revisión de:** Andrea (Backend)

---

## ¿Qué se cambió?

En `backend/src/routes/product.routes.js` se quitó `protectRoute` de los dos endpoints GET de productos:

```js
// ANTES (requería autenticación):
router.get("/", protectRoute, getAllProducts);
router.get("/:id", protectRoute, getProductById);

// DESPUÉS (acceso público):
router.get("/", getAllProducts);
router.get("/:id", getProductById);
```

El cambio se aplicó en:
- `D:\1_donpalitojr\ecommerce_app\backend\src\routes\product.routes.js` ← repo de Andrea
- `D:\1_donpalitojr\donpalitojrweb\backend\src\routes\product.routes.js` ← repo de Jair (ya estaba así)

---

## ¿Por qué?

La web (`donpalitojrweb`) permite explorar el catálogo y ver detalle de productos sin necesidad de estar logueado (experiencia de vitrina pública). Con `protectRoute` activo, los usuarios no logueados recibían un **401 Unauthorized** y el catálogo no cargaba.

Mobile no se ve afectado porque su flujo de app requiere login antes de acceder a cualquier pantalla — la restricción la maneja la app, no la API.

---

## Impacto

| Cliente | Comportamiento anterior | Comportamiento nuevo |
|---------|------------------------|----------------------|
| Web (sin login) | 401 → catálogo vacío | ✅ Carga productos normalmente |
| Web (con login) | Cargaba normal | ✅ Sin cambios |
| Mobile | Siempre logueado | ✅ Sin cambios |
| Admin | Usa rutas admin separadas | ✅ Sin cambios |

---

## Rutas públicas (sin autenticación)

| Ruta | Motivo |
|---|---|
| `GET /api/products` | Catálogo visible sin login (vitrina pública) |
| `GET /api/products/:id` | Detalle de producto visible sin login |
| `GET /api/coupons/active` | Carrusel de promociones en el Home (añadida el 25-02-2026) |

## Lo que SÍ sigue requiriendo autenticación

Todas las demás operaciones siguen protegidas con `protectRoute`:
- Carrito (GET/POST/PUT/DELETE `/api/cart`)
- Órdenes (GET `/api/orders`)
- Wishlist (GET/POST/DELETE `/api/users/wishlist`)
- Direcciones (GET/POST/PUT/DELETE `/api/users/addresses`)
- Perfil de usuario (GET/PUT `/api/users/profile`)
- Cupones — validar (POST `/api/coupons/validate`)
- Pagos (POST `/api/payment/create-intent`, POST `/api/payment/create-transfer-order`)

---

## Para revertir (si se decide mantener auth en productos)

Si en producción se quiere requerir login para ver productos:

```js
router.get("/", protectRoute, getAllProducts);
router.get("/:id", protectRoute, getProductById);
```

Y en el web, mostrar un "teaser" con login gate antes de mostrar precios/detalles.
