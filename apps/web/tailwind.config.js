import tailwindcssAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        surface: {
          subtle: "var(--surface-subtle)",
          muted: "var(--surface-muted-tint)",
          wash: "var(--surface-tint-wash)",
          dropzone: "var(--surface-dropzone)",
        },
        history: {
          border: "var(--border-history)",
        },
      },
      boxShadow: {
        app: "var(--shadow)",
        "app-modal": "var(--shadow-modal)",
        "app-focus": "var(--shadow-focus-ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "app-md": "var(--radius-md)",
        "app-inner": "var(--radius-inner)",
      },
      spacing: {
        "app-1": "var(--space-1)",
        "app-2": "var(--space-2)",
        "app-3": "var(--space-3)",
        "app-3-5": "var(--space-3-5)",
        "app-4": "var(--space-4)",
        "app-5": "var(--space-5)",
        "app-6": "var(--space-6)",
        "app-7": "var(--space-7)",
        "app-8": "var(--space-8)",
        "app-9": "var(--space-9)",
      },
      fontSize: {
        "app-2xs": [
          "var(--font-size-2xs)",
          { lineHeight: "1.25" },
        ],
        "app-xs": [
          "var(--font-size-xs)",
          { lineHeight: "1.25" },
        ],
        "app-sm": [
          "var(--font-size-sm)",
          { lineHeight: "var(--leading-snug)" },
        ],
        "app-md": [
          "var(--font-size-md)",
          { lineHeight: "1.25" },
        ],
        "app-lg": [
          "var(--font-size-lg)",
          { lineHeight: "1.25" },
        ],
        "app-stat": [
          "var(--font-size-stat)",
          { lineHeight: "1.2" },
        ],
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
