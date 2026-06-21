/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B2838",
          light: "#2D3E50",
          dark: "#0F1923",
        },
        accent: {
          DEFAULT: "#D4A853",
          light: "#E8C97A",
          dark: "#B8923E",
        },
        success: "#2ECC71",
        danger: "#E74C3C",
        warning: "#F39C12",
        surface: {
          DEFAULT: "#243447",
          light: "#2D3E50",
          dark: "#1B2838",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
