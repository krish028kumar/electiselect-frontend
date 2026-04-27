/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        success: '#16A34A',
        warning: '#EA580C',
        error: '#DC2626',
        purple: '#7C3AED',
        background: '#F8FAFC',
        card: '#FFFFFF',
        sidebar: '#FFFFFF',
      },
      textColor: {
        primary: '#1E293B',
        secondary: '#64748B'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
