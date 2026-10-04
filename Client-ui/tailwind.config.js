/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0099FF',
      },
    },
  },
  corePlugins: {
    preflight: false, // Quan trọng: tránh xung đột style reset của Tailwind với Ant Design v5
  },
  plugins: [],
};

