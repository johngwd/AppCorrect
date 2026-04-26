/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        page: '0 16px 40px rgba(15, 23, 42, 0.08)',
        soft: '0 20px 60px rgba(37, 99, 235, 0.12)',
        glow: '0 16px 40px rgba(59, 130, 246, 0.18)',
      },
    },
  },
  plugins: [],
}
