# Changelog — Don Palito Jr. (Frontend Web)

Registro de cambios del frontend (`donpalitojrweb/web`).
Formato: **fecha · archivo(s) · tipo · descripción**

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
*Última actualización: 22 de febrero de 2026*
