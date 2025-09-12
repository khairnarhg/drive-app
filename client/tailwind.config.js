/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'mac-sidebar': '#f0f0f0',
        'mac-sidebar-dark': '#2e2e2e',
        'mac-header': 'rgba(255, 255, 255, 0.8)',
        'mac-header-dark': 'rgba(34, 34, 34, 0.8)',
        'mac-selection': '#0a7aff',
      },
      boxShadow: {
        'header': '0 1px 1px rgba(0, 0, 0, 0.05)',
        'header-dark': '0 1px 1px rgba(0, 0, 0, 0.2)',
      },
      keyframes: {
        'context-menu-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'dialog-in': {
          '0%': { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        }
      },
      animation: {
        'context-menu-in': 'context-menu-in 0.1s ease-out',
        'dialog-in': 'dialog-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}