/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        light: {
          primary: "#ffffff",
          secondary: "#f3f4f6",
          accent: "#0284c7",
          text: {
            primary: "#0f172a",
            secondary: "#475569",
          },
        },
        dark: {
          primary: "#0b0f1a",
          secondary: "#111827",
          accent: "#64ffda",
          text: {
            primary: "#e2e8f0",
            secondary: "#8892b0",
          },
        },
        void: "var(--bg-void)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        accent: "var(--accent)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-warm": "var(--accent-warm)",
        "accent-dim": "var(--accent-dim)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
      },
      backgroundColor: {
        void: "var(--bg-void)",
        primary: "var(--bg-primary)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        glass: "var(--bg-glass)",
      },
      borderColor: {
        subtle: "var(--border-subtle)",
        medium: "var(--border-medium)",
        active: "var(--border-active)",
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "-apple-system", "system-ui", "sans-serif"],
        heading: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Mono", "SF Mono", "monospace"],
        body: ["Outfit", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      boxShadow: {
        "custom-light": "0 10px 30px -15px rgba(0, 0, 0, 0.1)",
        "custom-dark": "0 10px 30px -15px rgba(2, 12, 27, 0.7)",
        glow: "0 8px 30px var(--accent-glow)",
      },
      animation: {
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s var(--ease-out-expo) forwards",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.5, transform: "scale(0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeInUp: {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0 },
        },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
