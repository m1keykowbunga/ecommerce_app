# 🚀 Guía de Setup Inicial - Don Palito Jr Web

## 📦 Archivos Generados

He creado una estructura completa y profesional para iniciar tu proyecto. Aquí está todo lo que tienes:

### 📁 Estructura de Archivos Creados

```
don-palito-jr-web/
├── setup/
│   ├── package.json              ✅ Dependencias completas
│   ├── vite.config.js            ✅ Configuración de Vite con alias
│   ├── tailwind.config.js        ✅ Tailwind + DaisyUI personalizado
│   ├── .eslintrc.cjs             ✅ Linting configurado
│   ├── .env.example              ✅ Variables de entorno
│   └── .gitignore                ✅ Git ignore completo
│
└── src/
    ├── services/
    │   ├── api.js                ✅ Axios configurado con interceptores
    │   ├── authService.js        ✅ Servicio de autenticación
    │   └── productService.js     ✅ Servicio de productos
    │
    ├── utils/
    │   ├── formatters.js         ✅ 20+ funciones de formateo
    │   └── constants.js          ✅ Constantes de la app
    │
    └── components/
        └── common/
            ├── Button.jsx        ✅ Botón reutilizable
            └── Input.jsx         ✅ Input con validación
```

---

## 🎯 Paso 1: Crear Proyecto Base

```bash
# 1. Crear proyecto con Vite
npm create vite@latest don-palito-jr-web -- --template react

# 2. Entrar al directorio
cd don-palito-jr-web

# 3. Instalar dependencias base
npm install
```

---

## 📦 Paso 2: Instalar Todas las Dependencias

Reemplaza el `package.json` generado por Vite con el que te proporcioné, luego:

```bash
# Instalar todas las dependencias
npm install

# Esto instalará:
# - React 18.2
# - React Router v6
# - Axios
# - React Hook Form + Yup
# - Tailwind CSS + DaisyUI
# - React Icons
# - React Toastify
# - Moment.js
# - Y todas las dev dependencies
```

---

## ⚙️ Paso 3: Configurar Archivos

### A. Copiar archivos de configuración

Copia los siguientes archivos del folder `setup/` a la raíz de tu proyecto:

```bash
# En la raíz del proyecto
cp setup/vite.config.js .
cp setup/tailwind.config.js .
cp setup/.eslintrc.cjs .
cp setup/.gitignore .
cp setup/.env.example .env
```

### B. Crear `postcss.config.js`

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### C. Actualizar `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Fuentes personalizadas */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700;800&display=swap');

/* Estilos base */
body {
  font-family: 'Inter', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', sans-serif;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #F59E0B;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #D97706;
}

/* Animaciones personalizadas */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-in-out;
}
```

---

## 📝 Paso 4: Configurar Variables de Entorno

Edita el archivo `.env` con tus valores:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Google Maps API (obtener en https://console.cloud.google.com)
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# WhatsApp
VITE_WHATSAPP_NUMBER=573148702078

# App Configuration
VITE_APP_NAME=Don Palito Jr
VITE_APP_VERSION=1.0.0

# Pagination
VITE_ITEMS_PER_PAGE=12
```

---

## 🔧 Paso 5: Copiar Archivos de src/

### A. Crear estructura de carpetas

```bash
# Desde la raíz del proyecto
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/components/common
mkdir -p src/components/layout
mkdir -p src/components/products
mkdir -p src/components/cart
mkdir -p src/components/checkout
mkdir -p src/components/reviews
mkdir -p src/components/home
mkdir -p src/pages/auth
mkdir -p src/pages/profile
mkdir -p src/pages/legal
mkdir -p src/context
mkdir -p src/hooks
mkdir -p src/assets/images
mkdir -p src/styles
```

### B. Copiar archivos

Copia todos los archivos del folder `src/` proporcionado a tu proyecto:

- `src/services/` → Todos los archivos .js
- `src/utils/` → Todos los archivos .js
- `src/components/common/` → Button.jsx e Input.jsx

---

## 🎨 Paso 6: Actualizar main.jsx

```javascript
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  </React.StrictMode>,
)
```

---

## 🚦 Paso 7: Crear App.jsx Básico

```javascript
// src/App.jsx
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-base-100">
        <header className="navbar bg-primary text-primary-content">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold">Don Palito Jr</h1>
          </div>
        </header>

        <main className="container mx-auto py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¡Bienvenido a Don Palito Jr! 🥐
            </h2>
            <p className="text-lg">
              Tu aplicación web está configurada y lista para empezar
            </p>
            
            {/* Test de componentes */}
            <div className="mt-8 space-x-4">
              <button className="btn btn-primary">Primary</button>
              <button className="btn btn-secondary">Secondary</button>
              <button className="btn btn-accent">Accent</button>
            </div>
          </div>
        </main>

        <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-auto">
          <div>
            <p>Copyright © 2025 - Don Palito Jr</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
```

---

## ✅ Paso 8: Probar que Todo Funciona

```bash
# Iniciar servidor de desarrollo
npm run dev

# Deberías ver algo como:
# VITE v5.0.8  ready in 500 ms
# ➜  Local:   http://localhost:5173/
```

Abre http://localhost:5173 en tu navegador y deberías ver:
- ✅ Header con "Don Palito Jr"
- ✅ Mensaje de bienvenida
- ✅ Botones con estilos de DaisyUI
- ✅ Footer

---

## 🧪 Paso 9: Verificar Configuración

### Test 1: Verificar Tailwind
```javascript
// Agregar en App.jsx
<div className="bg-primary text-white p-4 rounded-lg">
  Tailwind funciona ✅
</div>
```

### Test 2: Verificar DaisyUI
```javascript
// Agregar en App.jsx
<button className="btn btn-primary">DaisyUI funciona ✅</button>
```

### Test 3: Verificar Componentes Custom
```javascript
// Importar y usar tus componentes
import Button from './components/common/Button';
import Input from './components/common/Input';

<Button variant="primary">Mi Botón Custom ✅</Button>
<Input label="Email" placeholder="test@email.com" />
```

### Test 4: Verificar Servicios
```javascript
// En consola del navegador
import { formatCurrency } from './utils/formatters';
console.log(formatCurrency(15000)); // Debería mostrar: $15.000
```

---

## 📋 Checklist de Verificación

- [ ] Proyecto creado con Vite
- [ ] Dependencias instaladas
- [ ] Archivos de configuración copiados
- [ ] Variables de entorno configuradas
- [ ] Estructura de carpetas creada
- [ ] Servicios copiados
- [ ] Utilidades copiadas
- [ ] Componentes base copiados
- [ ] main.jsx actualizado
- [ ] App.jsx creado
- [ ] Servidor de desarrollo corriendo
- [ ] Página carga sin errores
- [ ] Tailwind funciona
- [ ] DaisyUI funciona
- [ ] Componentes custom funcionan
- [ ] Git inicializado
- [ ] Primer commit realizado

---

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. **Crear Context de Autenticación**
   - `src/context/AuthContext.jsx`
   - `src/hooks/useAuth.js`

2. **Crear Layout Principal**
   - `src/components/layout/Header.jsx`
   - `src/components/layout/Footer.jsx`
   - `src/components/layout/Layout.jsx`

3. **Crear Páginas de Autenticación**
   - `src/pages/auth/Login.jsx`
   - `src/pages/auth/Register.jsx`

4. **Configurar React Router**
   - Definir todas las rutas
   - Proteger rutas privadas

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot find module 'daisyui'"
```bash
npm install -D daisyui
```

### Error: Tailwind no funciona
```bash
# Verificar que existe postcss.config.js
# Reiniciar servidor
npm run dev
```

### Error: Axios no está definido
```bash
npm install axios
```

### Error: Variables de entorno no funcionan
- Asegúrate que empiecen con `VITE_`
- Reinicia el servidor después de cambiar .env

---

## 📚 Recursos Útiles

- [Documentación Vite](https://vitejs.dev/)
- [Documentación React](https://react.dev/)
- [Documentación Tailwind](https://tailwindcss.com/)
- [Documentación DaisyUI](https://daisyui.com/)
- [Documentación React Router](https://reactrouter.com/)
- [Documentación Axios](https://axios-http.com/)

---

## 💬 ¿Necesitas Ayuda?

Si encuentras algún problema:
1. Verifica que seguiste todos los pasos
2. Revisa la consola del navegador para errores
3. Revisa la terminal para errores de Node
4. Verifica que todas las dependencias estén instaladas

---

**¡Todo listo para empezar a desarrollar! 🚀**

Siguiente paso: Crear el AuthContext y las páginas de Login/Register
