/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // blue-600
        secondary: '#6b7280', // gray-500
        accent: '#f59e0b', // amber-500
        background: '#f9fafb', // gray-50
        dark: '#111827', // gray-900
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        card: '0 4px 6px rgba(0,0,0,0.1)',
        button: '0 2px 4px rgba(0,0,0,0.15)',
      },
      animation: {
        spinSlow: 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};