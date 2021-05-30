module.exports = {
  purge: { content: ["./public/**/*.html", "./src/**/*.vue"] },
  darkMode: false,
  theme: {
    extend: {
      minWidth: {
        120: "120px",
        400: "400px",
      },
      animation: {
        popin: "popin 0.3s ease-in-out",
      },
      keyframes: {
        popin: {
          "0%": { opacity: 0, transform: "scale(0.8)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
      backgroundColor: ["responsive", "hover", "focus", "active", "disabled"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
