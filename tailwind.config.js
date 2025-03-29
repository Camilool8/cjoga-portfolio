/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // This enables dark mode with the 'dark' class
  theme: {
    extend: {
      colors: {
        // Light Theme Colors
        light: {
          primary: "#ffffff",
          secondary: "#f3f4f6",
          accent: "#0ea5e9",
          text: {
            primary: "#111827",
            secondary: "#4b5563",
          },
        },
        // Dark Theme Colors
        dark: {
          primary: "#0a192f",
          secondary: "#112240",
          accent: "#64ffda",
          text: {
            primary: "#ccd6f6",
            secondary: "#8892b0",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "Calibre",
          "San Francisco",
          "SF Pro Text",
          "-apple-system",
          "system-ui",
          "sans-serif",
        ],
        mono: ["Fira Mono", "SF Mono", "monospace"],
      },
      boxShadow: {
        "custom-light": "0 10px 30px -15px rgba(0, 0, 0, 0.1)",
        "custom-dark": "0 10px 30px -15px rgba(2, 12, 27, 0.7)",
      },
    },
  },
  plugins: [],
};
