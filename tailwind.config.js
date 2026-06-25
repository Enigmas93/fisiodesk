/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#0EA5E9',
        'primary-dark': '#0284C7',
        secondary: '#10B981',
        accent: '#6366F1',
        warning: '#F59E0B',
        danger: '#EF4444',
        'neutral-50': '#F8FAFC',
        'neutral-100': '#F1F5F9',
        'neutral-800': '#1E293B',
        'neutral-900': '#0F172A',
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
        xl: '20px',
      }
    },
  },
  plugins: [],
}
