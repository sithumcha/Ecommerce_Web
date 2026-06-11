/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f6f6f7',
          100: '#e1e2e5',
          200: '#c5c7ce',
          300: '#a1a4b0',
          400: '#797c8c',
          500: '#5c5f6f',
          600: '#484a57',
          700: '#3a3b47',
          800: '#1b1b24',
          900: '#0f0f15',
          950: '#07070a',
        },
        primary: {
          50: '#f0f5ff',
          100: '#e5edff',
          200: '#cddbfe',
          300: '#b4c6fc',
          400: '#8da2fb',
          500: '#687bf7',
          600: '#4f46e5', // Indigo primary
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          400: '#22d3ee', // Vibrant Cyan
          500: '#06b6d4',
          600: '#0891b2',
        },
        fuchsia: {
          400: '#e879f9', // Vibrant Pink/Purple
          500: '#d946ef',
          600: '#c026d3',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
