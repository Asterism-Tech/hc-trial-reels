import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#faf9f7",
        foreground: "#45132c",
        card: "#ffffff",
        border: "#e8d5c4",
        brand: {
          aubergine: "#45132c",
          aubergineTint: "#6b2e4d",
          pink: "#ed4a7e",
          pinkTint: "#f5a3c7",
          natural: "#f5eee4",
          offwhite: "#faf9f7",
        },
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "70%": { transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bellSwing: {
          "0%, 24%, 100%": { transform: "rotate(0deg)" },
          "4%": { transform: "rotate(14deg)" },
          "8%": { transform: "rotate(-12deg)" },
          "12%": { transform: "rotate(8deg)" },
          "16%": { transform: "rotate(-5deg)" },
          "20%": { transform: "rotate(2deg)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        crownTwinkle: {
          "0%, 85%, 100%": { transform: "scale(1) rotate(0deg)" },
          "90%": { transform: "scale(1.25) rotate(-8deg)" },
          "95%": { transform: "scale(1.1) rotate(6deg)" },
        },
        stitch: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        pulse3dot: {
          "0%, 80%, 100%": { opacity: "0.2" },
          "40%": { opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        slideUp: "slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1) both",
        scaleIn: "scaleIn 250ms cubic-bezier(0.4, 0, 0.2, 1) both",
        popIn: "popIn 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        bellSwing: "bellSwing 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
        floaty: "floaty 3.5s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        crownTwinkle: "crownTwinkle 5s ease-in-out infinite",
        "pulse3dot": "stitch 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
