/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  darkMode: "class", // Enable dark mode via class toggle

  theme: {
    extend: {
      // ── Custom Color Palette ───────────────────────────────────────
      colors: {
        primary: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5bafc",
          400: "#8193f8",
          500: "#6366f1", // Main brand color (indigo)
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        accent: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // Accent (orange)
          600: "#ea6c0a",
          700: "#c2510a",
          800: "#9a3f10",
          900: "#7c3512",
        },
        dark: {
          100: "#1e1e2e",
          200: "#181824",
          300: "#12121c",
          400: "#0d0d15",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger:  "#ef4444",
      },

      // ── Custom Font Family ─────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },

      // ── Custom Box Shadows ─────────────────────────────────────────
      boxShadow: {
        "glow":       "0 0 20px rgba(99,102,241,0.35)",
        "glow-sm":    "0 0 10px rgba(99,102,241,0.25)",
        "glow-orange":"0 0 20px rgba(249,115,22,0.35)",
        "card":       "0 4px 24px rgba(0,0,0,0.25)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.40)",
      },

      // ── Custom Border Radius ───────────────────────────────────────
      borderRadius: {
        "xl":  "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },

      // ── Custom Animations ──────────────────────────────────────────
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulse2: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in":       "fadeIn 0.4s ease-out both",
        "slide-in-left": "slideInLeft 0.4s ease-out both",
        "scale-in":      "scaleIn 0.3s ease-out both",
        "shimmer":       "shimmer 1.5s infinite linear",
        "pulse2":        "pulse2 2s ease-in-out infinite",
      },

      // ── Background Size for shimmer ────────────────────────────────
      backgroundSize: {
        "200%": "200%",
      },
    },
  },
  plugins: [],
};
