/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Override Tailwind's default blue scale to a muted teal-green palette
        // to replace the AI-ish blue-purple across the app without renaming classes.
        blue: {
          50: '#f1f8f6',
          100: '#dcede8',
          200: '#b9ddd4',
          300: '#8ec4b8',
          400: '#5ea698',
          500: '#3d8a7e',
          600: '#2e7066',
          700: '#235a52',
          800: '#1e4a43',
          900: '#193e39',
          950: '#0d2523',
        },
        // Override purple to a warm gold accent used for reference tags and highlights.
        purple: {
          50: '#fbf9f4',
          100: '#f3eedf',
          200: '#e7dec3',
          300: '#d8c89e',
          400: '#c6ab72',
          500: '#b39455',
          600: '#9a7d48',
          700: '#7f653c',
          800: '#685234',
          900: '#57432e',
          950: '#332b1a',
        },
        surface: '#f7f6f2',
        ink: '#1e293b',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
