/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        serif: ["'Merriweather'", "Georgia", "serif"],
      },
      colors: {
        // Paleta oficial del proyecto Don Palito Jr
        brand: {
          primary: "#B06A4A",      // Marrón cálido terracota
          secondary: "#5B3A29",    // Café oscuro
          accent: "#C34928",       // Naranja rojizo
        },
        ui: {
          background: "#F3E6D4",   // Crema/beige
          surface: "#FFFFFF",      // Blanco
          border: "#999999",       // Gris
        },
        text: {
          primary: "#333333",      // Casi negro
          secondary: "#666666",    // Gris oscuro
          muted: "#999999",        // Gris claro
          inverse: "#FFFFFF",      // Blanco
        },
        
        // Aliases para compatibilidad con DaisyUI
        primary: {
          DEFAULT: "#B06A4A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#5B3A29",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#C34928",
          foreground: "#FFFFFF",
        },
        background: "#F3E6D4",
        foreground: "#333333",
        
        // Estados
        success: "#36D399",
        warning: "#FBBD23",
        error: "#F87272",
        info: "#3ABFF8",
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in": "slide-in 0.4s ease-out forwards",
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        donpalito: {
          "primary": "#B06A4A",
          "secondary": "#5B3A29",
          "accent": "#C34928",
          "neutral": "#333333",
          "base-100": "#F3E6D4",
          "base-200": "#FFFFFF",
          "base-300": "#E5D8C8",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
    darkTheme: false,
    base: true,
    styled: true,
    utils: true,
  },
}
