/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        "marquee-reverse": "marquee-reverse 25s linear infinite",
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],

};
