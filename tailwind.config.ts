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
        slideUp: "slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "pulse3dot": "stitch 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
