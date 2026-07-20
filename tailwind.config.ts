import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#f2ecdf", dark: "#1a1a1d" },
        card: { DEFAULT: "#fffdf8", dark: "#252527" },
        ink: { DEFAULT: "#26301f", dim: "#7c8267", light: "#f2ecdf" },
        line: { DEFAULT: "#ddd4bd", dark: "#333230" },
        green: { DEFAULT: "#3c4a2e", soft: "#e2e6d8", light: "#5a6b47", dark: "#2a3420" },
        rust: { DEFAULT: "#a8562e", soft: "#f2ddc9", light: "#c47044", dark: "#8a4424" },
        bone: { 50: "#faf8f5", 100: "#f5f0ea", 200: "#e8dfd3", 300: "#d4c4ae", 400: "#bfa588", 500: "#af8d6a", 600: "#9d7756", 700: "#826148", 800: "#6b4f3e", 900: "#5a4335", 950: "#30221b" },
        clay: { 50: "#faf6f3", 100: "#f3ece5", 200: "#e5d6c8", 300: "#d3bba4", 400: "#be9a7b", 500: "#af8360", 600: "#a27255", 700: "#875d49", 800: "#6f4c3e", 900: "#5c4035", 950: "#301f1a" },
        sage: { 50: "#f4f7f3", 100: "#e3ebe0", 200: "#c7d7c1", 300: "#a1bb98", 400: "#7a9b70", 500: "#5c7e53", 600: "#486441", 700: "#3a5035", 800: "#30412d", 900: "#293628", 950: "#131e13" },
        charcoal: { 50: "#f5f5f6", 100: "#e6e6e8", 200: "#cfcfd3", 300: "#aeadb4", 400: "#888790", 500: "#6d6c76", 600: "#5d5c65", 700: "#4f4e55", 800: "#454449", 900: "#3c3b3f", 950: "#1a1a1d" },
      },
      fontFamily: {
        display: ["Bodoni Moda", "Fraunces", "Georgia", "serif"],
        sans: ["IBM Plex Sans", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["IBM Plex Mono", "SF Mono", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43,40,34,0.06), 0 4px 14px rgba(43,40,34,0.06)",
        "card-hover": "0 2px 4px rgba(43,40,34,0.08), 0 8px 24px rgba(43,40,34,0.09)",
        float: "0 4px 12px rgba(43,40,34,0.08), 0 16px 40px rgba(43,40,34,0.12)",
        "card-drag": "0 8px 24px rgba(43,40,34,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
