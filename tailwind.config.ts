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
        background: "#0F0F0F",
        foreground: "#F5F5F5",
        card: "#1A1A1A",
        border: "#2A2A2A",
        brand: {
          purple: "#6B2D8B",
          gold: "#F5B942",
          green: "#22C55E",
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse3dot: {
          "0%, 80%, 100%": { opacity: "0.2" },
          "40%": { opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 150ms ease-out",
        "pulse3dot": "pulse3dot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
