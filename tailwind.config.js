/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tealbrand: "#0f766e",
        tealbrandDark: "#115e59",
        grayAccent: "#e2e8f0",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.06)"
      },
      borderColor: {
        subtle: "#cbd5e1"
      }
    },
  },
  plugins: [],
}
