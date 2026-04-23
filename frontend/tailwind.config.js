/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
          secondary: "#4B5563",
          tertiary:  "#9CA3AF",
        },
        positive: "#00C471",
        negative: "#F04452",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        display:  ["4rem",     { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        headline: ["2rem",     { lineHeight: "1.25", letterSpacing: "-0.01em"  }],
        reading:  ["1.0625rem",{ lineHeight: "1.8"                             }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card:     "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-md":"0 4px 12px 0 rgba(0,0,0,0.08)",
        panel:    "-8px 0 32px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
