# Contexto Completo - Proyecto Don Palito Jr

## 📋 Información General del Proyecto

**Nombre:** Don Palito Jr - Sistema de Comercio Electrónico  
**Tipo:** Aplicación web y móvil para cafetería  
**Estado:** En desarrollo activo  
**Cliente:** Rosiris Buelvas Pedroza y Luis Eduardo Muñoz (Propietarios Cafetería Don Palito Junior)  
**Equipo de Desarrollo:** Andrea Arcila Cano, Jair González Buelvas, Maicol Estiven Córdoba  
**Institución:** SENA - Tecnología en Análisis y Desarrollo de Software  
**Ubicación del Negocio:** Cra 47 76D Sur - 37, Sabaneta, Antioquia

---

## 🎯 Objetivo del Proyecto

Desarrollar un sistema integral de comercio electrónico para la Cafetería Don Palito Junior que permita:
- Modernizar la experiencia del cliente mediante una plataforma digital
- Optimizar la gestión interna del negocio
- Expandir el alcance comercial más allá del público local
- Fortalecer la presencia digital manteniendo la esencia tradicional
- Automatizar procesos operativos y reducir errores
- Fomentar la fidelización mediante promociones y sistema de reseñas

---

## 🏪 Sobre el Negocio

**Don Palito Junior** es una cafetería tradicional colombiana especializada en:
- Buñuelos
- Palitos de queso
- Café y bebidas
- Productos típicos colombianos

**Desafío:** El negocio necesita adaptarse a las nuevas tendencias digitales donde los clientes esperan realizar compras desde dispositivos móviles, pagar digitalmente y tener una experiencia personalizada.

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico Completo

#### Frontend Web
- **Lenguajes:** HTML5, CSS3, JavaScript (ES6+)
- **Framework:** Vanilla JavaScript (posteriormente React)
- **Diseño Responsivo:** CSS Grid, Flexbox
- **Interactividad:** DOM Manipulation, Fetch API
- **Conexión:** REST API

#### Frontend Mobile
- **Framework:** React Native / Android nativo
- **Lenguaje:** JavaScript/JSX
- **Gestión de Estado:** React Hooks, Context API
- **Navegación:** React Navigation

#### Backend
- **Entorno:** Node.js
- **Framework:** Express.js
- **Lenguaje:** JavaScript
- **Arquitectura:** MVC (Modelo-Vista-Controlador)
- **API:** REST con documentación Swagger
- **Autenticación:** JWT (JSON Web Tokens)
- **Validación:** Express Validator

#### Base de Datos
- **Motor:** MongoDB
- **ODM:** Mongoose
- **Tipo:** NoSQL orientada a documentos
- **Hosting:** MongoDB Atlas (Cloud)

#### Herramientas de Desarrollo y Diseño
- **Diseño UX/UI:** Figma
- **Diagramación:** PlantUML, Markdown
- **Testing:** Postman, Swagger
- **Control de Versiones:** Git, GitHub (repositorio privado)
- **Metodología:** Scrum (sprints de desarrollo)

#### Infraestructura y Despliegue
- **Hosting:** Servicio Cloud (por definir)
- **Dominio:** Registro web personalizado
- **Integración:** API REST documentada
- **Ambiente:** Desarrollo, Staging, Producción

---

## 📦 Estructura del Proyecto

```
don-palito-jr/
├── client-web/              # Frontend Web
│   ├── index.html
│   ├── css/
│   │   ├── styles.css
│   │   ├── responsive.css
│   │   └── components/
│   ├── js/
│   │   ├── app.js
│   │   ├── api/             # Llamadas a API
│   │   ├── components/      # Componentes JS
│   │   ├── utils/           # Utilidades
│   │   └── config.js
│   └── assets/
│       ├── images/
│       └── icons/
│
├── client-mobile/           # Frontend Mobile (React/Android)
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/        # API calls
│   │   ├── context/
│   │   └── utils/
│   └── package.json
│
├── server/                  # Backend Node.js/Express
│   ├── src/
│   │   ├── models/          # Modelos Mongoose
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── Review.js
│   │   │   └── Promotion.js
│   │   ├── routes/          # Rutas API
│   │   │   ├── auth.routes.js
│   │   │   ├── products.routes.js
│   │   │   ├── orders.routes.js
│   │   │   ├── reviews.routes.js
│   │   │   └── admin.routes.js
│   │   ├── controllers/     # Controladores
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   └── adminController.js
│   │   ├── middleware/      # Middlewares
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── jwt.js
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── docs/                    # Documentación
│   ├── propuesta-tecnica.docx
│   ├── diagramas/
│   │   ├── arquitectura.png
│   │   ├── paquetes.png
│   │   ├── casos-uso.puml
│   │   ├── clases.puml
│   │   └── secuencia.puml
│   ├── manuales/
│   │   ├── manual-usuario.md
│   │   └── manual-tecnico.md
│   └── api/
│       └── swagger.yaml
│
├── scripts/                 # Scripts de utilidad
├── .gitignore
└── README.md
```

---

## 🗃️ Modelo de Datos (MongoDB)

### Colecciones Principales

#### 1. **Usuarios (Users)**
```javascript
{
  _id: ObjectId,
  nombre: String,
  apellido: String,
  email: String (único, requerido),
  password: String (hasheado con bcrypt),
  telefono: String,
  direccion: {
    calle: String,
    ciudad: String,
    departamento: String,
    codigoPostal: String
  },
  rol: String, // 'cliente', 'admin'
  fechaRegistro: Date,
  activo: Boolean,
  preguntasSeguridad: [{
    pregunta: String,
    respuesta: String (hasheada)
  }],
  ultimoAcceso: Date,
  intentosFallidos: Number,
  bloqueado: Boolean
}
```

#### 2. **Productos (Products)**
```javascript
{
  _id: ObjectId,
  nombre: String (requerido),
  descripcion: String,
  categoria: String, // 'buñuelos', 'palitos', 'cafe', 'bebidas', 'otros'
  precio: Number (requerido),
  precioAnterior: Number, // para mostrar descuentos
  stock: Number,
  disponible: Boolean,
  imagenes: [String], // URLs de imágenes
  promocion: {
    activa: Boolean,
    descuento: Number, // porcentaje
    fechaInicio: Date,
    fechaFin: Date
  },
  valoraciones: [{
    usuarioId: ObjectId,
    calificacion: Number, // 1-5 estrellas
    comentario: String,
    fecha: Date
  }],
  promedioCalificacion: Number,
  totalReseñas: Number,
  fechaCreacion: Date,
  fechaActualizacion: Date
}
```

#### 3. **Pedidos (Orders)**
```javascript
{
  _id: ObjectId,
  clienteId: ObjectId (ref: 'Users'),
  items: [{
    productoId: ObjectId (ref: 'Products'),
    nombre: String,
    cantidad: Number,
    precioUnitario: Number,
    subtotal: Number
  }],
  subtotal: Number,
  descuentos: Number,
  total: Number,
  estado: String, // 'pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'cancelado'
  metodoPago: String, // 'qr', 'efectivo', 'transferencia'
  comprobantePago: String, // URL del QR o comprobante
  fechaPedido: Date,
  fechaEntrega: Date,
  direccionEntrega: Object,
  notas: String,
  historialEstados: [{
    estado: String,
    fecha: Date,
    comentario: String
  }]
}
```

#### 4. **Reseñas (Reviews)**
```javascript
{
  _id: ObjectId,
  usuarioId: ObjectId (ref: 'Users'),
  productoId: ObjectId (ref: 'Products'),
  calificacion: Number, // 1-5
  titulo: String,
  comentario: String,
  verificado: Boolean, // si compró el producto
  util: Number, // votos de utilidad
  respuestaAdmin: {
    texto: String,
    fecha: Date,
    adminId: ObjectId
  },
  fecha: Date,
  visible: Boolean
}
```

#### 5. **Promociones (Promotions)**
```javascript
{
  _id: ObjectId,
  titulo: String,
  descripcion: String,
  tipoDescuento: String, // 'porcentaje', 'monto_fijo', '2x1', 'envio_gratis'
  valor: Number,
  productosAplicables: [ObjectId], // refs a Products
  categoriaAplicable: String,
  codigoPromocional: String (único),
  fechaInicio: Date,
  fechaFin: Date,
  activa: Boolean,
  usosMaximos: Number,
  usosActuales: Number,
  restricciones: {
    montoMinimo: Number,
    soloNuevosClientes: Boolean,
    limiteUsosPorCliente: Number
  }
}
```

#### 6. **Inventario (Inventory)**
```javascript
{
  _id: ObjectId,
  productoId: ObjectId (ref: 'Products'),
  stockActual: Number,
  stockMinimo: Number, // alerta de reabastecimiento
  ultimaActualizacion: Date,
  movimientos: [{
    tipo: String, // 'entrada', 'salida', 'ajuste'
    cantidad: Number,
    motivo: String,
    fecha: Date,
    usuarioId: ObjectId
  }]
}
```

#### 7. **Reportes/Estadísticas (Analytics)**
```javascript
{
  _id: ObjectId,
  tipo: String, // 'ventas_diarias', 'productos_populares', 'clientes_activos'
  fecha: Date,
  datos: Object, // estructura flexible según el tipo de reporte
  generadoPor: ObjectId (ref: 'Users'),
  fechaGeneracion: Date
}
```

---

## 🔑 Funcionalidades Principales

### Sistema para Clientes

#### Catálogo de Productos
- ✅ Visualización de productos con imágenes
- ✅ Precios y disponibilidad en tiempo real
- ✅ Filtrado por categoría
- ✅ Búsqueda de productos
- ✅ Vista detallada de producto

#### Carrito de Compras
- ✅ Agregar/eliminar productos
- ✅ Modificar cantidades
- ✅ Calcular subtotales y total
- ✅ Aplicar promociones y descuentos
- ✅ Persistencia del carrito

#### Gestión de Cuenta
- ✅ Registro de nuevos clientes
- ✅ Inicio de sesión seguro
- ✅ Recuperación de cuenta con preguntas de seguridad
- ✅ Actualización de perfil
- ✅ Historial de pedidos

#### Sistema de Pagos
- ✅ Pago mediante código QR
- ✅ Confirmación de pago
- ✅ Generación de comprobante

#### Promociones y Descuentos
- ✅ Visualización de promociones activas
- ✅ Aplicación automática de descuentos
- ✅ Códigos promocionales
- ✅ Ofertas por tiempo limitado

#### Sistema de Reseñas
- ✅ Calificación de productos (1-5 estrellas)
- ✅ Comentarios y opiniones
- ✅ Visualización de reseñas de otros clientes
- ✅ Promedio de calificaciones

### Sistema para Administradores

#### Gestión de Inventario
- ✅ Alta/baja/modificación de productos
- ✅ Control de stock
- ✅ Alertas de inventario bajo
- ✅ Actualización de precios
- ✅ Gestión de imágenes

#### Gestión de Pedidos
- ✅ Visualización de pedidos en tiempo real
- ✅ Cambio de estado de pedidos
- ✅ Historial completo de pedidos
- ✅ Filtrado y búsqueda
- ✅ Notificaciones de nuevos pedidos

#### Gestión de Promociones
- ✅ Creación de promociones
- ✅ Configuración de descuentos
- ✅ Activación/desactivación
- ✅ Seguimiento de uso
- ✅ Análisis de efectividad

#### Gestión de Usuarios
- ✅ Listado de clientes
- ✅ Gestión de cuentas administrativas
- ✅ Asignación de roles y permisos
- ✅ Bloqueo/desbloqueo de usuarios
- ✅ Registro de actividad

#### Sistema de Reportes
- ✅ Ventas por período (día/semana/mes)
- ✅ Productos más vendidos
- ✅ Análisis de reseñas
- ✅ Estadísticas de clientes
- ✅ Reportes de inventario
- ✅ Gráficos visuales
- ✅ Exportación a CSV/PDF

#### Panel de Control (Dashboard)
- ✅ Métricas clave en tiempo real
- ✅ Gráficos de ventas
- ✅ Alertas y notificaciones
- ✅ Resumen de actividad

### Servicios de Seguridad

#### Autenticación
- ✅ Registro seguro con validación
- ✅ Login con JWT
- ✅ Tokens de acceso y refresh
- ✅ Recuperación de contraseña
- ✅ Preguntas de seguridad

#### Autorización
- ✅ Control de acceso basado en roles
- ✅ Validación de permisos
- ✅ Rutas protegidas
- ✅ Middleware de autenticación

#### Protección
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ Validación de datos de entrada
- ✅ Prevención de inyecciones SQL/NoSQL
- ✅ Rate limiting
- ✅ Bloqueo por intentos fallidos
- ✅ Registro de actividad sospechosa

---

## 🔐 Seguridad

### Autenticación y Autorización
- **JWT:** Tokens firmados con expiración configurable
- **Roles:** Cliente, Administrador
- **Bcrypt:** Hash de contraseñas con salt rounds
- **Recuperación:** Sistema de preguntas de seguridad

### Validación y Sanitización
- **Frontend:** Validación en tiempo real
- **Backend:** Express Validator para todas las entradas
- **Sanitización:** Limpieza de datos para prevenir XSS
- **CORS:** Configuración restrictiva

### Protección de Datos
- **Variables de entorno:** Configuración sensible en .env
- **Conexión DB:** Credenciales encriptadas
- **HTTPS:** Comunicación segura en producción
- **Rate Limiting:** Protección contra ataques de fuerza bruta

---

## 🚀 Decisiones Técnicas Importantes

### ¿Por qué MongoDB?
- Flexibilidad para esquemas que evolucionan (productos, promociones)
- Excelente rendimiento con documentos anidados (pedidos con items, reseñas)
- Escalabilidad horizontal para crecimiento futuro
- MongoDB Atlas ofrece hosting gratuito para comenzar
- Integración natural con Node.js y Mongoose
- Permite consultas complejas y agregaciones

### ¿Por qué Node.js/Express?
- JavaScript en frontend y backend (mismo lenguaje)
- Excelente rendimiento para aplicaciones I/O intensivas
- Ecosistema npm robusto
- Express es minimalista y flexible
- Fácil creación de APIs REST
- Gran comunidad y documentación

### ¿Por qué React para Mobile?
- Componentes reutilizables entre web y móvil
- React Native permite desarrollo multiplataforma
- Gran ecosistema de librerías
- Hot reload para desarrollo rápido
- Performance nativo en dispositivos móviles

### ¿Por qué Metodología Scrum?
- Entregas incrementales funcionales
- Retroalimentación continua del cliente
- Adaptabilidad a cambios de requisitos
- Transparencia en el progreso
- Equipo de desarrollo está en formación SENA (contexto académico)

### Consideraciones de Negocio
- El sistema debe ser intuitivo para clientes de todas las edades
- La identidad visual debe reflejar la tradición de Don Palito Junior
- Necesidad de trabajar con conexión intermitente (considerar offline mode futuro)
- Facilidad de uso para propietarios con conocimientos técnicos limitados
- Escalabilidad para agregar múltiples sucursales en el futuro
- Integración con métodos de pago locales (QR, transferencias)

---

## 📊 Estado Actual del Proyecto

### Fase de Análisis y Diseño
- [x] Propuesta técnica elaborada
- [x] Requisitos funcionales definidos
- [x] Modelo de datos diseñado
- [x] Stack tecnológico seleccionado
- [ ] Prototipos en Figma
- [ ] Diagramas UML completos

### En Desarrollo
- [ ] Configuración del entorno de desarrollo
- [ ] Estructura base del proyecto
- [ ] Modelos Mongoose
- [ ] API REST básica
- [ ] Autenticación JWT
- [ ] Frontend web inicial

### Pendiente
- [ ] CRUD completo de productos
- [ ] Sistema de carrito de compras
- [ ] Gestión de pedidos
- [ ] Panel administrativo
- [ ] Sistema de reseñas
- [ ] Reportes y estadísticas
- [ ] Aplicación móvil
- [ ] Testing completo
- [ ] Documentación de API (Swagger)
- [ ] Despliegue en producción

---

## 📅 Cronograma General

**Duración estimada:** 18 semanas

### Sprints Planificados
- **Sprint 1-2:** Análisis, diseño y prototipos
- **Sprint 3-4:** Configuración inicial y autenticación
- **Sprint 5-6:** Módulo de productos y catálogo
- **Sprint 7-8:** Carrito de compras y pedidos
- **Sprint 9-10:** Panel administrativo
- **Sprint 11-12:** Sistema de reseñas y promociones
- **Sprint 13-14:** Reportes y estadísticas
- **Sprint 15-16:** Aplicación móvil
- **Sprint 17:** Testing y correcciones
- **Sprint 18:** Despliegue y capacitación

---

## 💰 Presupuesto

**Inversión Total:** $8.000.000 COP

### Desglose
- **Desarrollo (Personal):** $6.500.000
  - Diseño UX/UI: $1.000.000
  - Frontend Web: $2.000.000
  - Frontend Mobile: $1.500.000
  - Backend y BD: $3.000.000
  - Testing y Documentación: $800.000

- **Infraestructura:** $1.000.000
  - Dominio web
  - Hosting cloud
  - Servidor
  - Herramientas

- **Contingencia:** $500.000
  - Ajustes imprevistos
  - Pruebas adicionales

### Forma de Pago
- 50% al inicio (aprobación y firma)
- 30% a entrega de módulos funcionales
- 20% al finalizar (con documentación y capacitación)

---

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: Migración de Tecnologías
**Descripción:** Cambio inicial de Python/PostgreSQL a JavaScript/MongoDB  
**Razón:** Unificación del lenguaje en todo el stack, mejor integración  
**Estado:** ✅ Resuelto (nueva arquitectura definida)

### Problema 2: [Por documentar según surjan]
**Descripción:**  
**Solución:**  
**Estado:**

---

## 📝 Convenciones de Código

### JavaScript/Node.js
- **Estilo:** ESLint con configuración Airbnb
- **Nomenclatura:**
  - Variables y funciones: camelCase
  - Constantes: UPPER_SNAKE_CASE
  - Clases y componentes: PascalCase
- **Idioma:** Nombres en español para entidades de negocio
- **Comentarios:** En español para lógica de negocio
- **Async/Await:** Preferir sobre Promises encadenadas

### Estructura de Controladores
```javascript
// controllers/productController.js

const Product = require('../models/Product');

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ disponible: true });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos'
    });
  }
};

module.exports = { getProducts };
```

### Estructura de Modelos Mongoose
```javascript
// models/Product.js

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  categoria: {
    type: String,
    enum: ['buñuelos', 'palitos', 'cafe', 'bebidas', 'otros'],
    required: true
  },
  disponible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Product', ProductSchema);
```

### Estructura de Rutas
```javascript
// routes/products.routes.js

const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router.route('/:id')
  .get(getProduct);

module.exports = router;
```

### React Components (para mobile)
```jsx
// components/ProductCard.jsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ProductCard = ({ product, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(product._id)}
    >
      <Image 
        source={{ uri: product.imagenes[0] }} 
        style={styles.image} 
      />
      <View style={styles.info}>
        <Text style={styles.nombre}>{product.nombre}</Text>
        <Text style={styles.precio}>${product.precio.toLocaleString()}</Text>
        {product.promocion?.activa && (
          <Text style={styles.descuento}>
            {product.promocion.descuento}% OFF
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  info: {
    padding: 12,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  precio: {
    fontSize: 16,
    color: '#2E75B6',
    fontWeight: '600',
  },
  descuento: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
});

export default ProductCard;
```

### Git
- **Commits:** Mensajes descriptivos en español
- **Formato:** `tipo(alcance): descripción`
- **Tipos:** 
  - `feat`: Nueva funcionalidad
  - `fix`: Corrección de bug
  - `docs`: Cambios en documentación
  - `style`: Formato, punto y coma, etc (no afecta código)
  - `refactor`: Refactorización de código
  - `test`: Añadir o modificar tests
  - `chore`: Tareas de mantenimiento

**Ejemplos:**
```bash
git commit -m "feat(productos): añadir endpoint para búsqueda"
git commit -m "fix(auth): corregir validación de token expirado"
git commit -m "docs(api): actualizar documentación de swagger"
```

---

## 🔄 Próximos Pasos Inmediatos

### Semana 1-2
- [ ] Configurar repositorio GitHub
- [ ] Crear estructura de carpetas del proyecto
- [ ] Configurar entorno de desarrollo (Node.js, MongoDB)
- [ ] Inicializar proyecto con npm
- [ ] Crear diseños en Figma
- [ ] Elaborar diagramas UML

### Semana 3-4
- [ ] Configurar Express server básico
- [ ] Conectar a MongoDB Atlas
- [ ] Crear modelos Mongoose iniciales
- [ ] Implementar autenticación JWT
- [ ] Crear rutas de autenticación
- [ ] Frontend: estructura HTML/CSS básica

### Semana 5-6
- [ ] CRUD completo de productos
- [ ] Sistema de imágenes
- [ ] Catálogo de productos (frontend)
- [ ] Filtros y búsqueda
- [ ] Vista detallada de producto

---

## 📚 Referencias y Recursos

### Documentación Oficial
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [React Documentation](https://react.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [JWT.io](https://jwt.io/introduction)

### Tutoriales Recomendados
- [Node.js & Express - Crash Course (Traversy Media)](https://www.youtube.com/watch?v=L72fhGm1tfE)
- [MongoDB in 100 Seconds](https://www.youtube.com/watch?v=-bt_y4Loofg)
- [React Native Tutorial for Beginners](https://www.youtube.com/watch?v=0-S5a0eXPoc)

### Herramientas de Desarrollo
- **Editor:** Visual Studio Code
- **Testing API:** Postman
- **Diseño:** Figma
- **Base de Datos:** MongoDB Compass
- **Control de Versiones:** Git, GitHub
- **Diagramas:** PlantUML, Draw.io

### Librerías y Paquetes Clave

#### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "express-validator": "^7.0.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.7.0",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^4.6.2"
}
```

#### Frontend Mobile
```json
{
  "react": "18.2.0",
  "react-native": "0.72.0",
  "react-navigation": "^6.0.0",
  "axios": "^1.4.0",
  "@react-native-async-storage/async-storage": "^1.18.0"
}
```

---

## 👥 Equipo de Desarrollo

### Desarrolladores
- **Andrea Arcila Cano** - Desarrollo Frontend/UX
- **Jair González Buelvas** - Desarrollo Backend/Base de Datos
- **Maicol Estiven Córdoba** - Desarrollo Mobile/Testing

### Cliente
- **Rosiris Buelvas Pedroza** - Propietaria
- **Luis Eduardo Muñoz** - Propietario
- **Email:** luchodonpalito@gmail.com
- **Teléfono:** 314 870 2078

### Institución
- **SENA** - Servicio Nacional de Aprendizaje
- **Programa:** Tecnología en Análisis y Desarrollo de Software

---

## 📌 Notas Importantes

### Sobre el Proyecto
- Este es un proyecto formativo del SENA con cliente real
- Se debe mantener comunicación constante con los propietarios
- Cada sprint debe incluir demostración al cliente
- La documentación es parte fundamental de la evaluación académica
- El proyecto debe estar completamente funcional al finalizar

### Mejores Prácticas
- Hacer commits pequeños y frecuentes
- Documentar código complejo
- Realizar testing antes de cada merge
- Mantener el README actualizado
- Backup regular de la base de datos
- No subir credenciales al repositorio
- Usar variables de entorno

### Comunicación con el Cliente
- Reuniones quincenales de seguimiento
- Demos al final de cada sprint
- WhatsApp para dudas urgentes
- Email para documentación oficial
- Validación de diseños antes de implementar

---

## 🎯 Criterios de Éxito

El proyecto será considerado exitoso cuando:

### Técnico
- ✅ Sistema web completamente funcional
- ✅ Aplicación móvil operativa
- ✅ API REST documentada
- ✅ Base de datos optimizada
- ✅ Seguridad implementada
- ✅ Testing completo realizado

### Funcional
- ✅ Clientes pueden navegar y comprar productos
- ✅ Administradores pueden gestionar todo el sistema
- ✅ Sistema de pagos operativo
- ✅ Reportes generándose correctamente
- ✅ Reseñas y promociones funcionando

### Negocio
- ✅ Propietarios capacitados en el uso
- ✅ Manual de usuario entregado
- ✅ Sistema desplegado en producción
- ✅ Clientes reales usando la plataforma
- ✅ Incremento medible en ventas

---

**Última actualización:** 14 de febrero de 2026  
**Versión del documento:** 2.0 (Actualizado con stack JavaScript/React/MongoDB)  
**Mantenido por:** Equipo de Desarrollo Don Palito Jr.

---

## 🚀 Comandos Útiles

### Iniciar el proyecto

```bash
# Clonar repositorio
git clone <url-repositorio>
cd don-palito-jr

# Instalar dependencias del backend
cd server
npm install

# Instalar dependencias del frontend web
cd ../client-web
npm install

# Instalar dependencias mobile
cd ../client-mobile
npm install
```

### Desarrollo

```bash
# Iniciar servidor backend (con nodemon)
cd server
npm run dev

# Iniciar frontend web
cd client-web
npm start

# Iniciar app mobile
cd client-mobile
npm run android  # o npm run ios
```

### Base de Datos

```bash
# Conectar a MongoDB local
mongosh

# Importar datos de ejemplo
mongoimport --db donpalito --collection products --file seed/products.json

# Backup de producción
mongodump --uri="mongodb+srv://..." --out=backup/
```

### Testing

```bash
# Tests del backend
cd server
npm test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

---

## 📖 Glosario

- **Sprint:** Iteración de desarrollo de 1-2 semanas
- **JWT:** JSON Web Token - sistema de autenticación
- **CRUD:** Create, Read, Update, Delete
- **API REST:** Interfaz de programación de aplicaciones RESTful
- **ODM:** Object Document Mapper (Mongoose)
- **Middleware:** Función intermedia en el flujo de peticiones
- **Endpoint:** Ruta específica de la API
- **Payload:** Datos enviados en una petición
- **Seed:** Datos iniciales para la base de datos
- **Migration:** Cambio en la estructura de la base de datos
