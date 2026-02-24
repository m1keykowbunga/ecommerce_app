# Changelog — Don Palito Jr. (Frontend Web)

Registro de cambios del frontend (`donpalitojrweb/web`).
Formato: **fecha · archivo(s) · tipo · descripción**

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
*Última actualización: 24 de febrero de 2026 — Sesión 6*
