# Changelog — Don Palito Jr. (Frontend Web)

Registro de cambios del frontend (`donpalitojrweb/web`).
Formato: **fecha · archivo(s) · tipo · descripción**

---

## [25-02-2026] — Sesión 10

### ✨ Home — Rediseño completo de la sección de Promociones activas

| Archivo | Cambio |
|---|---|
| `pages/Home.jsx` | Sección de promos movida: antes de "Nuestros Favoritos" → ahora entre "Nuestros Favoritos" y "Encuéntranos" |
| `pages/Home.jsx` | Scroll carousel reemplazado por navegación con flechas (una promo a la vez): `useState(currentIdx)`, botones `IoChevronBack / IoChevronForward`, dot indicators circulares |
| `pages/Home.jsx` | Tarjetas rediseñadas estilo cupón: header `bg-brand-accent` con descuento en `text-6xl font-black`, separador dashed, badge `font-mono` con código, nota `firstOrderOnly` y fecha de expiración |
| `pages/Home.jsx` | Fondo de sección: imagen Cloudinary con overlay `bg-brand-primary/80` (en lugar de fondo plano) |
| `pages/Home.jsx` | Auto-descripción redundante eliminada del header (backend ya no la incluye en `getActiveCoupons`) |
| `pages/Home.jsx` | `border-y border-brand-accent/20` removido (causaba líneas pixeladas/antialias visible); `pb-16` → `py-16` en sección Encuéntranos para separación correcta |

---

### 🆕 Backend + Frontend — Campo `firstOrderOnly` en cupones

| Archivo | Cambio |
|---|---|
| `backend/src/models/coupon.model.js` | Nuevo campo `firstOrderOnly: { type: Boolean, default: false }` |
| `backend/src/controllers/coupon.controller.js` | `validateCoupon`: si `coupon.firstOrderOnly`, consulta `Order.countDocuments` por `clerkId`; si tiene pedidos previos en estados `paid/delivered/in_preparation/ready`, retorna 400 "Este cupón es válido solo para tu primera compra." |
| `backend/src/controllers/coupon.controller.js` | `getActiveCoupons`: eliminado campo auto-generado `description`; añadido `firstOrderOnly` al resultado; `.select()` actualizado |
| `pages/Home.jsx` | Card de promo muestra `"Solo en tu primera compra"` cuando `promo.firstOrderOnly === true` |

#### Migración de datos
```js
// Ejecutado en MongoDB Compass — cupón BIENVENIDO10 marcado como primera compra
db.coupons.updateOne({ code: "BIENVENIDO10" }, { $set: { firstOrderOnly: true } })
```

---

### 🐛 Checkout — Toast en error de validación de cupón

| Archivo | Cambio |
|---|---|
| `pages/checkout/Checkout.jsx` | `handleCouponValidate` catch: añadido `toast.error(msg)` junto a `setCouponError(msg)` — el usuario ve toast rojo además del mensaje inline |

---

### ✨ RatingModal — Rediseño completo (fiel a app mobile)

| Archivo | Cambio |
|---|---|
| `components/profile/RatingModal.jsx` | Título cambiado a **"Calificar Productos"** |
| `components/profile/RatingModal.jsx` | Eliminados: campo `comments`, textarea, campo `comment` del payload al backend |
| `components/profile/RatingModal.jsx` | Layout horizontal por producto: imagen `w-16 h-16 object-contain` + columna de info (nombre, cantidad, precio) |
| `components/profile/RatingModal.jsx` | Estrellas: `IoStar` tamaño 32, color `text-brand-accent` (naranja), alineadas al centro |
| `components/profile/RatingModal.jsx` | Cards de producto: `bg-brand-accent/10 rounded-xl p-4` (fondo crema cálido) |
| `components/profile/RatingModal.jsx` | Añadido import `formatCurrency` para mostrar precio por producto |

---

### ✨ Login + Register — Fondo hero + Glassmorphism + Localización completa

| Archivo | Cambio |
|---|---|
| `pages/auth/Login.jsx` | Fondo reemplazado: `<img>` absoluta `object-cover` con imagen hero de Cloudinary + overlay `bg-black/40` |
| `pages/auth/Login.jsx` | Card Clerk: `backgroundColor: 'rgba(255,255,255,0.12)'`, `backdropFilter: 'blur(12px)'`, `border: '1px solid rgba(255,255,255,0.2)'` (frosted glass) |
| `pages/auth/Login.jsx` | Inputs crema: `variables.colorInputBackground: '#FAF4EC'` |
| `pages/auth/Login.jsx` | Botón Google blanco: `socialButtonsBlockButton: { backgroundColor: 'rgba(255,255,255,0.90)' }` |
| `pages/auth/Login.jsx` | Labels "(Optional)" ocultos: `formFieldOptionalLabel: { display: 'none' }` |
| `pages/auth/Register.jsx` | Todos los cambios anteriores aplicados también al registro (`<SignUp>`) |
| `App.jsx` | `localization` reemplazado: 5 strings manuales → `esES` completo de `@clerk/localizations` (ya instalado) |

#### Notas — Ajustes vía Clerk Dashboard
- **"My Application"** → cambiar a `Don Palito Jr.`: *Dashboard → Settings → Application name*
- **Campos "Optional"** → marcar como Required: *User & Authentication → Personal Information → First/Last name → Required*
- **Login con Apple**: se activa automáticamente en el dashboard cuando los compañeros conecten sus credenciales

---

## [25-02-2026] — Sesión 9

### 🐛 Corrección completa del sistema de cupones

#### Bugs corregidos en backend
| Archivo | Problema | Solución |
|---|---|---|
| `backend/src/routes/payment.routes.js` | `POST /payment/create-transfer-order` no existía — todos los pedidos por transferencia daban 404 silencioso | Nueva ruta registrada apuntando a `createTransferOrder` |
| `backend/src/controllers/payment.controller.js` | Sin función para pedidos por transferencia | Nueva función `createTransferOrder`: valida stock, aplica cupón, crea orden, reduce stock, marca cupón como usado (`$addToSet: { usedBy }`), envía emails |
| `backend/src/controllers/coupon.controller.js` | No existía endpoint público para listar cupones activos (el Home los mostraba con mock) | Nueva función `getActiveCoupons` retorna cupones activos/no expirados con `description` generada, sin exponer `usedBy` |
| `backend/src/routes/coupon.routes.js` | `GET /active` no existía | Nueva ruta pública (sin `protectRoute`) para que el Home cargue cupones sin autenticación |

#### Depuración del frontend
| Archivo | Cambio |
|---|---|
| `pages/Cart.jsx` | Eliminados: `FALLBACK_PROMOS`, estados `couponCode/appliedCoupon/couponError`, handlers `handleApplyCoupon/handleRemoveCoupon`, sección JSX del cupón, referencia al cupón en WhatsApp. Totales simplificados. Imports `IoClose` e `Input` eliminados. |
| `pages/Home.jsx` | Reemplazado `import { promotions } from mockData` por `useQuery(['coupons', 'active'], couponService.getActive)` — carrusel ahora muestra cupones reales de la DB |
| `services/index.js` | Añadido `couponService.getActive()` → `GET /coupons/active` |
| `data/mockData.js` | Eliminado export `promotions` (BIENVENIDO10, COMBO20 hardcodeados) |

#### Flujo resultante
```
Antes:
  Cart  → FALLBACK_PROMOS (mock, sin verificar uso previo) → cupón "siempre válido"
  Checkout → backend real → cupón válido, pero usedBy nunca se actualizaba
  → Usuario podía usar el mismo cupón indefinidamente

Después:
  Cart  → sin cupón (el usuario aplica el cupón en Checkout)
  Checkout → backend real → verifica usedBy → si ya lo usó: error 400
  → Al completar pedido: backend agrega userId a coupon.usedBy → no puede reusarlo
```

---

## [25-02-2026] — Sesión 8

### 🆕 Backend — Sistema de emails + facturas portado desde ecommerce_app

#### Nuevos servicios creados
| Archivo | Descripción |
|---|---|
| `backend/src/services/email.service.js` | Servicio completo de correos con Nodemailer + Gmail. 8 funciones exportadas: `sendWelcomeEmail`, `sendOrderCreatedAdminEmail`, `sendOrderCreatedClientEmail`, `sendOrderUpdatedAdminEmail`, `sendOrderUpdatedClientEmail`, `sendMarketingSubscriptionEmail`, `sendInvoiceEmails`. Adaptado para 7 estados de pedido con mensajes personalizados en español. |
| `backend/src/services/invoice.service.js` | Generación de facturas PDF (`pdfkit`) y CSV (`csv-writer`). `generateInvoicePDF()` retorna `Buffer` A4 con logo, tabla de ítems, IVA 19% desglosado (base + IVA calculados desde precio final). `generateInvoiceCSV()` retorna string CSV. Número de factura: `FV-{año}-{últimos 8 chars del orderId en mayúsculas}`. |

#### Dependencias instaladas (backend)
```
npm install pdfkit@^0.17.2 csv-writer@^1.6.0
```

#### Archivos backend modificados
| Archivo | Cambio |
|---|---|
| `backend/src/config/env.js` | Añadidas 6 vars de empresa: `LOGO_URL`, `COMPANY_NAME`, `COMPANY_NIT`, `COMPANY_ADDRESS`, `COMPANY_CITY`, `COMPANY_PHONE` |
| `backend/src/models/order.model.js` | Enum de `status` expandido de 3 → 7 valores: `pending, paid, in_preparation, ready, delivered, canceled, rejected` |
| `backend/src/controllers/admin.controller.js` | Reescrito: `VALID_STATUSES` array con 7 estados, `inferPaymentMethod()` detecta `stripe`/`transferencia` desde el ID del resultado de pago. `updateOrderStatus` genera factura PDF+CSV de forma asíncrona (*fire-and-forget*) al marcar como `paid`, y envía emails de actualización para los demás estados. `getAllCustomers` usa `.select()` con campos específicos. Nueva función `updateCustomerStatus` |
| `backend/src/routes/admin.routes.js` | Nueva ruta `PATCH /admin/customers/:customerId/status` → `updateCustomerStatus` |
| `backend/src/config/inngest.js` | Llama `sendWelcomeEmail` al crear usuario nuevo en el evento `sync-user` de Clerk (fire-and-forget con `.catch` para no interrumpir el flujo) |
| `backend/src/controllers/order.controller.js` | Llama `sendOrderCreatedAdminEmail` + `sendOrderCreatedClientEmail` al crear pedido por transferencia (`Promise.allSettled` fire-and-forget) |
| `backend/src/controllers/payment.controller.js` | Mismos emails al crear pedido vía webhook de Stripe (busca `dbUser` para obtener nombre y email del cliente) |

#### Variables de entorno requeridas en `backend/.env`
```env
# Empresa (para facturas)
LOGO_URL=https://...              # URL pública del logo (opcional, puede dejarse vacío)
COMPANY_NAME=Don Palito Junior
COMPANY_NIT=900.123.456-7
COMPANY_ADDRESS=Cra 47 #76D Sur - 37
COMPANY_CITY=Sabaneta, Antioquia
COMPANY_PHONE=+57 314 870 2078

# Email (ya debería existir)
ADMIN_EMAIL=luchodonpalito@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx   # contraseña de aplicación de Google
```

---

### 🐛 Fix — Imágenes de productos cortadas en carrito y checkout

| Archivo | Problema | Solución |
|---|---|---|
| `components/cart/CartItem.jsx` | `object-cover` recortaba productos con proporción no cuadrada | → `object-contain bg-base-200` |
| `pages/checkout/Checkout.jsx` | `object-cover` + acceso directo a `images[0]` sin fallback | → `object-contain bg-base-200` + `getProductImage()` centralizado |
| `pages/profile/OrderDetail.jsx` | `object-cover` recortaba la imagen en el detalle del pedido | → `object-contain bg-base-200` |

---

### ♻️ Limpieza — Eliminación de métodos de pago QR y efectivo

QR (Nequi/Daviplata) y efectivo requieren presencia física en la sede. Se eliminaron completamente del frontend. Solo quedan: **Transferencia bancaria** y **Tarjeta (Stripe)**.

| Archivo | Cambio |
|---|---|
| `components/checkout/PaymentMethodSelector.jsx` | Eliminados objetos `qr` y `efectivo` del array `methods`. Eliminados imports `IoCash` e `IoQrCode` |
| `components/cart/OrderSummary.jsx` | "Otros métodos de pago" → **"Pagar por transferencia"**. Icono `IoCash` → `IoSwapHorizontal` |
| `utils/constants.js` | `PAYMENT_METHODS` reducido de 3 → 1 clave: `{ TRANSFER: 'transferencia' }` |
| `utils/whatsappHelpers.js` | Eliminadas entradas `qr` y `efectivo` del mapa `paymentLabel` |
| `pages/profile/OrderDetail.jsx` | `PAYMENT_LABELS` limpiado (qr/efectivo eliminados); agregada clave `stripe` → `'Tarjeta de crédito/débito'` |
| `pages/checkout/Checkout.jsx` | 2 comentarios actualizados: eliminadas referencias a QR/efectivo |
| `pages/Cart.jsx` | 1 comentario actualizado + typo `"tranferencia"` → `"transferencia"` corregido |
| `pages/info/Terms.jsx` | "...bancaria, QR (Nequi/Daviplata) o efectivo contra entrega." → "...bancaria o tarjeta de crédito/débito." |
| `pages/info/FAQ.jsx` | 2 respuestas actualizadas eliminando referencias a QR y efectivo |

---

## [24-02-2026] — Sesión 7

### 🐛 Fixes UX + ✨ Botones de favoritos

#### Favoritos implementados
| Archivo | Cambio |
|---|---|
| `components/products/ProductCard.jsx` | Botón de corazón absoluto (esquina superior derecha) con `useWishlist` + `useAuth`. Relleno `#C34928` si está en favoritos, outline `#5B3A29` si no. Requiere login → `toast.info` |
| `pages/ProductDetail.jsx` | Botón secundario "Agregar a favoritos" / "Guardado en favoritos" debajo del botón de carrito, con el mismo patrón de autenticación |

#### Bugs corregidos
| Archivo | Problema | Solución |
|---|---|---|
| `pages/profile/Wishlist.jsx` | Toast duplicado al agregar al carrito desde favoritos | Eliminado `toast.success` explícito de `handleAddToCart` (CartContext ya lo dispara) |
| `pages/profile/Wishlist.jsx` | Imagen de productos recortada (`object-cover`) | Cambiado contenedor a `h-40 bg-white` + `object-contain` en la imagen |
| `pages/profile/Wishlist.jsx` | Bordes de cards distintos al catálogo | Reemplazadas clases custom por `card-product` para coherencia visual |
| `components/layout/Navbar.jsx` | Menú hamburguesa no se podía volver a abrir tras scroll (el tap generaba un micro-scroll que disparaba el listener inmediatamente) | `useEffect` con `setTimeout` de 150ms antes de registrar el listener de scroll |
| `App.jsx` | Links del footer abrían la página pero no hacían scroll-to-top | `<ScrollToTop />` no estaba montado en App.jsx — añadido dentro de `<Router>` |

#### Texto actualizado
| Archivo | Cambio |
|---|---|
| `pages/Home.jsx` | Hero: "Empanadas crujientes..." → "Palitos crujientes, buñuelos esponjosos y tradición colombiana en cada bocado. Calidad desde 2005." |

---

### 🔗 Alineación con backend + mobile (ecommerce_app actualizado)

#### FASE A — Rutas de productos públicas
| Archivo | Cambio |
|---|---|
| `ecommerce_app/backend/src/routes/product.routes.js` | Eliminado `protectRoute` de `GET /` y `GET /:id` — productos accesibles sin token (acordado con Andrea) |
| `docs/cambio-backend-productos-publicos.md` | Documentación del cambio para Andrea: impacto, razón, cómo revertir |

#### FASE B — Manejo de cuenta inactiva
| Archivo | Cambio |
|---|---|
| `services/api.js` | Interceptor 403 detecta `{ code: "ACCOUNT_INACTIVE" }` → toast + redirect a `/cuenta-inactiva` con 1.5s de delay |
| `pages/AccountInactive.jsx` | Nueva página con opciones de contacto (email + WhatsApp) y botón volver al inicio |
| `App.jsx` | Nueva ruta pública `/cuenta-inactiva` → `<AccountInactive />` |

#### FASE C — Checkout + Cupones (bugs críticos)
| Archivo | Bug → Solución |
|---|---|
| `services/index.js` | `paymentService.createPaymentIntent` no enviaba `couponCode` → añadido como 3er parámetro |
| `services/index.js` | No existía `paymentService.createTransferOrder` → nuevo método `POST /payment/create-transfer-order` |
| `services/index.js` | `couponService.validate` enviaba solo `{ code }` → ahora envía `{ code, subtotal }` |
| `pages/checkout/Checkout.jsx` | `handleConfirm` usaba `orderService.createOrder` (endpoint inexistente) → usa `paymentService.createTransferOrder` |
| `pages/checkout/Checkout.jsx` | `handleInitStripe` no pasaba cupón → ahora pasa `couponCode` cuando hay cupón activo |
| `pages/checkout/Checkout.jsx` | `couponData.discountPercent` no existe en respuesta del backend → usa `discountAmount` directamente |

#### FASE D — Perfil extendido
| Archivo | Cambio |
|---|---|
| `hooks/useProfile.js` | Nuevo hook React Query: `GET/PUT /users/profile`, `PUT /users/notification-preferences`, `PATCH /users/deactivate` |
| `services/index.js` | Nuevo `userService` con los 4 endpoints del perfil extendido |
| `pages/profile/Profile.jsx` | Nuevas secciones en tab "Info Personal": datos demográficos (documentType, documentNumber, gender, dateOfBirth) y preferencias de notificaciones (toggles emailNotifications/marketingEmails). "Eliminar cuenta" reemplazado por "Desactivar cuenta" real via PATCH /users/deactivate |

#### FASE E — Categorías
| Archivo | Cambio |
|---|---|
| `utils/constants.js` | Añadida `PRODUCT_CATEGORIES` con las 5 categorías reales de mobile/MongoDB: Palitos Premium, Cocteleros, Dulces, Especiales, Nuevos |

#### FASE F — Admin redirect
| Archivo | Cambio |
|---|---|
| `contexts/AuthContext.jsx` | Detecta admin via `sessionClaims.role`, `publicMetadata.role` o `VITE_ADMIN_EMAIL`. Expone `isAdmin` y `user.role` |

---

## [24-02-2026] — Sesión 6

### 🐛 Bugs corregidos + ✨ Mejoras UX en Pedidos

#### Bugs corregidos
| Archivo | Problema | Solución |
|---|---|---|
| `utils/constants.js` | `ORDER_STATUS_COLORS` y `ORDER_STATUS_LABELS` tenían claves en español pero el backend retorna valores en inglés (`"pending"`, `"paid"`, `"delivered"`) → badges sin color ni texto | Cambiadas a claves inglesas con hex exactos (igual que mobile). Conservadas claves en español como aliases para compatibilidad legacy |
| `components/profile/OrderTimeline.jsx` | El backend NO retorna campo `timeline` → todos los círculos aparecían grises | Cuando `timeline` está vacío, se derivan los estados completados desde `currentStatus` usando `STEP_ORDER`. Línea conectora verde sólo si el siguiente paso también está completado |
| `pages/profile/OrderDetail.jsx` | `<Badge variant={ORDER_STATUS_COLORS[order.status]}>` recibía hex como variant (sin soporte) → badge sin estilo | Reemplazado por `<div>` inline con `backgroundColor: statusColor + '20'` y `color: statusColor` (patrón idéntico al de mobile y `Orders.jsx`) |
| `hooks/useOrders.js` | `try/catch` silencioso retornaba `[]` ante cualquier error → "Sin pedidos aún" aunque el backend esté caído | Eliminado try/catch; React Query propaga el error. `enabled: isAuthenticated` como guard |

#### Nuevas funcionalidades
| Archivo | Cambio |
|---|---|
| `pages/profile/Profile.jsx` | Sección de **accesos rápidos** encima de los tabs: cards clickeables "Mis Pedidos" y "Favoritos" con íconos de color (verde #10B981 / rojo #EF4444). Patrón fiel a `mobile/app/(profile)/profile.tsx` |
| `pages/profile/Orders.jsx` | Estado de error visible cuando `isError` es true (mensaje claro "No se pudieron cargar los pedidos" en vez del estado vacío engañoso) |
| `pages/profile/OrderDetail.jsx` | Botón **"Descargar factura"** genera PDF imprimible con `react-to-print` v3. Factura incluye: encabezado con datos de Don Palito Jr., tabla de productos con filas alternadas, totales (subtotal/IVA/envío/total), dirección de entrega, pie de página con fecha de generación. Reemplaza descarga CSV |

#### Dependencia instalada
```
npm install react-to-print
```

---

## [24-02-2026] — Sesión 5

### 🆕 Fase 7 — Reseñas conectadas al backend real

#### Nuevo archivo
- `hooks/useReviews.js` — mutation hook React Query para `POST /api/reviews`, invalida caché de `products` y `orders` en `onSuccess`. Patrón idéntico al de la app móvil (`mobile/hooks/useReviews.ts`)

#### Archivos actualizados
| Archivo | Cambio |
|---|---|
| `components/profile/RatingModal.jsx` | Reemplazado `reviewService` + estado local `submitting` por `useReviews` hook. Envío en paralelo con `Promise.allSettled()` en vez de loop secuencial |
| `pages/profile/Orders.jsx` | Botón "Calificar" (⭐ fondo brand-primary) para pedidos `delivered` sin calificar + badge "Calificado" (✅ checkmark) para los ya calificados + `RatingModal` integrado. Patrón fiel a `mobile/app/(profile)/orders.tsx` |

#### Lógica del botón (fiel a mobile)
```
order.status === "delivered":
  hasReviewed === true  → badge "Calificado" (IoCheckmarkCircle, bg-brand-secondary/10)
  hasReviewed === false → botón "Calificar" (IoStar, bg-brand-primary)
    → abre RatingModal con orden seleccionada
    → al enviar: Promise.allSettled() → POST /api/reviews por cada producto
    → onSuccess: invalida ["orders"] y ["products"] → React Query refresca
```

---

## [24-02-2026] — Sesión 4

### ✅ Integración backend completada y verificada

#### Correcciones de configuración
| Elemento | Problema | Solución |
|---|---|---|
| `backend/package.json` — script `inngest` | `inngest dev` requiere CLI global, no instalada → `"inngest" no se reconoce...` | Cambiado a `npx inngest-cli@latest dev -u http://localhost:3000/api/inngest` |
| Clerk Dashboard → Webhooks | URL configurada sin path (`/`) → ngrok recibía `POST /` con 404 | URL corregida a `https://<ngrok-url>/api/webhooks/clerk` |

#### Flujo completo verificado y funcionando ✅
```
Usuario se registra en frontend
  → Clerk envía POST /api/webhooks/clerk (ngrok → localhost:3000)
  → Backend verifica firma (CLERK_WEBHOOK_SECRET) ✅
  → Publica evento clerk.user.created a Inngest ✅
  → Función sync-user ejecutada ✅
  → Usuario creado en MongoDB ✅
```

#### Pago con Stripe verificado ✅
- Tarjeta de prueba `4242 4242 4242 4242` → pedido registrado en MongoDB
- `CheckoutSuccess` muestra botón WhatsApp con mensaje pre-llenado

#### Nueva documentación creada
- `docs/ARRANCAR-PROYECTO.md` — guía de inicio por sesión (incluye pasos ngrok + Clerk)

---

## [23-02-2026] — Sesión 3

### ♻️ Refactor — Alineación con backend real (andreaac777/ecommerce_app)

#### Hooks corregidos
| Archivo | Problema | Solución |
|---|---|---|
| `hooks/useAddresses.js` | `fetch` directo sin token Clerk + endpoint `/users/address` (singular) + sin `updateAddress` | Reescrito con `api` (axios+Clerk) + `/users/addresses` (plural) + `updateMutation` añadida |
| `hooks/useWishlist.js` | `fetch` sin token + GET desde `/users/profile` + toggle con `PUT` | Reescrito con `api` + GET `/users/wishlist` + `addMutation` (POST) y `removeMutation` (DELETE) separados |
| `hooks/useOrders.js` | Sin `useOrderDetail` — backend solo tiene `GET /orders` (lista, no por ID) | Añadido `useOrderDetail(id)` que filtra del array en cliente |

#### Páginas migradas de mocks a hooks reales
| Archivo | Antes | Después |
|---|---|---|
| `pages/profile/Profile.jsx` | `addressServiceMock` (estado local) | `useAddresses()` con React Query |
| `pages/profile/Orders.jsx` | `orderServiceMock.getUserOrders()` | `useOrders()` con loading state |
| `pages/profile/OrderDetail.jsx` | `orderServiceMock.getOrderById()` | `useOrderDetail(id)` + normalización campos backend/mock |

#### Archivos eliminados (código muerto)
- `services/userService.js` — duplicado exacto de `addressService` en `index.js`
- `services/addressService.js` — solo contenía mock nunca importado correctamente
- `services/orderService.js` — solo contenía mock nunca importado correctamente

### ✨ Nueva funcionalidad — Notificación WhatsApp post-checkout
- `pages/checkout/CheckoutSuccess.jsx`: botón verde "Confirmar por WhatsApp" abre `wa.me/573148702078` con mensaje pre-llenado (número de pedido + total + método de pago)
- `pages/checkout/Checkout.jsx`: pasa `total` y `paymentMethod` en `navigate` (Stripe y métodos directos)

### 🐛 Bugs corregidos
| Archivo | Problema | Solución |
|---|---|---|
| `pages/checkout/Checkout.jsx` | `couponService.validate()` daba error genérico cuando backend responde 404 (endpoint no existe) | Detecta 404/sin respuesta y muestra "Cupones no disponibles por el momento" |

---

## [22-02-2026] — Sesión 2

### 🐛 Bugs corregidos

| Archivo | Problema | Solución |
|---|---|---|
| `Home.jsx`, `Catalog.jsx` | `font-sanstext-3xl` era una clase inválida (font-sans y text-3xl pegados) — los títulos no tenían tamaño de fuente en móvil | Separado en `font-sans text-3xl` |
| `components/common/Badge.jsx` | El prop `onClick` no se aceptaba ni se pasaba al `<span>` — los chips de categoría del catálogo no filtraban al hacer clic | Añadido `onClick` a props y al elemento |
| `components/common/Badge.jsx` | `bg-primary` y `bg-secondary` usaban variables DaisyUI genéricas en lugar de los colores del proyecto | Cambiado a `bg-brand-primary` y `bg-brand-secondary` |
| `components/common/Badge.jsx` | Variant `'outline'` no existía — los chips del catálogo no tenían estilo de contorno | Añadido variant `outline` con borde y hover |
| `pages/auth/Register.jsx` | Logo fuera del card de Clerk (contenedor externo visible separado) | Reescrito con `appearance.layout.logoImageUrl` — logo dentro del card nativo de Clerk |

### ✨ Mejoras visuales

#### Home (`pages/Home.jsx`)
- Títulos **Nuestros Favoritos** y **Encuéntranos**: tamaño `md:text-4xl` para igualar a "Nuestro Catálogo"
- Sección de promociones convertida en **cinta deslizante (marquee)**
  - Texto reformateado: *"Usa el código [CÓDIGO] y obtén [descripción]."*
  - Ícono `IoPricetag` de `react-icons/io5`
  - Fuente `text-base font-medium` (igual a links de navbar)
  - Badge del código: `text-sm`
  - Animación 28s, pausa al hacer hover
- Reducido el espaciado entre botón "Ver Todo el Catálogo" y sección "Encuéntranos" (eliminado `pt-16` duplicado)

#### Navbar (`components/layout/Navbar.jsx`)
- Logo: `h-14` → `h-16`
- Links centrados con `absolute left-1/2 -translate-x-1/2` (independiente del tamaño del logo/botón)
- Icono carrito: `h-5 w-5` → `h-7 w-7`
- Botón "Iniciar Sesión": eliminado `size="sm"`, usa tamaño por defecto `md`

#### Footer (`components/layout/Footer.jsx`)
- Logo: `h-14` → `h-16` (igual al de la navbar)
- Grid del contenido: añadido `max-w-6xl mx-auto` para evitar que se estire en pantallas anchas
- Textos de copyright: `flex-col items-center text-center` (uno encima del otro, centrados)

#### Sobre Nosotros (`pages/info/About.jsx`)
- CTA "¿Listo para probar?": cambiado de `bg-gradient-to-r from-brand-primary to-brand-accent` (muy rojo) a `gradient-primary` (terracota → marrón oscuro, consistente con el hero)
- Textos de párrafos: `[&_p]:text-justify` (excepto títulos)
- Párrafo del CTA: `!text-center` para no heredar el justify

#### Páginas legales (`pages/info/Terms.jsx`, `Privacy.jsx`, `Cookies.jsx`)
- Todos los párrafos: `[&_p]:text-justify` en el contenedor `prose` (títulos no afectados)

#### Glassmorphism navbar (`styles/globals.css`)
- `.backdrop-blur-nav`: opacidad reducida `0.75` → `0.55` (más transparente, mejor efecto blur)

### 🆕 Nuevos estilos (`styles/globals.css`)
- `@keyframes marquee` + `.animate-marquee` + `.animate-marquee:hover` para la cinta de promociones

---

## [14-02-2026] — Sesión 1

### 🐛 Bugs corregidos

| Archivo | Problema | Solución |
|---|---|---|
| `services/api.js` | `getToken({ template: 'web-app-token' })` — plantilla JWT no existe en el dashboard de Clerk de los compañeros | Eliminado el parámetro `template` |
| `web/.env` | `VITE_CLERK_PUBLISHABLE_KEY` apuntaba a la app personal de Jair en vez de la app compartida del equipo | Actualizada la key a `pk_test_ZGlyZWN0LWJsdWVqYXktODUu...` |
| `pages/Home.jsx` | `variant="outline"` en `<Button>` es inválido — `outline` es un prop booleano separado | Cambiado a `variant="primary" outline` |
| `contexts/CartContext.jsx` | Al iniciar sesión, los ítems del carrito local (invitado) se perdían al cambiar al `ServerCartProvider` | Implementado `localItemsRef` para transferir ítems pendientes al servidor al autenticarse |

### ✨ Mejoras y configuración

#### App (`App.jsx`)
- Añadidas flags futuras de React Router v7: `v7_startTransition`, `v7_relativeSplatPath` (elimina warnings de consola)
- `ClerkProvider`: añadida prop `localization` con textos en español para subtítulos y links de login/registro

#### Login (`pages/auth/Login.jsx`)
- Reescrito para usar `appearance.layout.logoImageUrl` con el logo importado de Vite
- Logo integrado dentro del card nativo de Clerk (sin contenedor externo)
- `headerTitle` oculto; `logoBox` y `logoImage` dimensionados a 120px

### 🔧 Pendientes identificados (para próxima reunión con compañeros)
- [ ] Activar **Email + Password** en Clerk dashboard (Configure → User & Authentication → Email, Phone, Username)
- [ ] Configurar **ngrok** para exponer el backend y que Clerk envíe el webhook `user.created` a Inngest → crea el usuario en MongoDB
- [ ] Actualizar `STRIPE_WEBHOOK_SECRET` en el `.env` del backend con el valor actual del Stripe CLI

---

## 📌 Convención de tipos de cambio

| Emoji | Tipo |
|---|---|
| 🐛 | Bug fix |
| ✨ | Mejora visual / UX |
| 🆕 | Nuevo archivo o funcionalidad |
| 🔧 | Configuración / pendiente técnico |
| ♻️ | Refactor |
| 📝 | Solo documentación |

---

*Mantenido por: Jair González Buelvas — DarkerJB*
*Última actualización: 25 de febrero de 2026 — Sesión 10*
