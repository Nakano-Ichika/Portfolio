/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Toss-inspired design tokens
        brand: {
          50:  "#EFF6FF",
          100: "#DBEAFE",
          500: "#3182F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        surface: "#F4F6F8",
        card:    "#FFFFFF",
        border:  "#E5E8EB",
        ink: {
          primary:   "#191F28",
          secondary: "#8B95A1",
          tertiary:  "#B0B8C1",
        },
        positive: "#00C471",
        negative: "#F04452",
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans JP", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-md": "0 4px 12px 0 rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
