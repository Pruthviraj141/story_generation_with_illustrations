// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        story: ["Cormorant Garamond", "Georgia", "serif"],
        ui: ["DM Sans", "system-ui", "sans-serif"]
      },
      colors: {
        bgBase: "#0F0D1A",
        gold: "#E8B86D",
        rose: "#D4A0A0",
        lavender: "#A89BC8",
        textPrimary: "#F5F0E8"
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        pill: "9999px"
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)"
      },
      boxShadow: {
        goldGlow: "0 12px 36px rgba(232, 184, 109, 0.2)"
      },
      backdropBlur: {
        glass: "20px",
        mobileglass: "8px"
      }
    }
  },
  plugins: []
};
