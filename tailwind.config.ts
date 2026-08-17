import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Iowan Old Style", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
      colors: {
        indigo: { 50: "#EEF1FF", 100: "#DDE4FF", 200: "#BCCAFF", 300: "#8FA5FF", 400: "#3A5BFF", 500: "#2547EC", 600: "#1434CB", 700: "#1029A4", 800: "#0D227E", 900: "#0A185A", 950: "#070D2D" },
        violet: { 50: "#FFF9E8", 100: "#FFF0BD", 200: "#FFE080", 300: "#FFD047", 400: "#F7B500", 500: "#E6A400", 600: "#C98A00", 700: "#9C6800", 800: "#754E05", 900: "#513707", 950: "#2E1E00" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      boxShadow: { soft: "0 18px 60px -24px rgba(29, 24, 73, .22)", glow: "0 0 50px rgba(99, 102, 241, .2)" },
    },
  },
  plugins: [],
} satisfies Config;
