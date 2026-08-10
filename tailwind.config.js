/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d1117',
        surface: '#161b22',
        primary: '#58a6ff',
        secondary: '#3081f7',
        text: '#c9d1d9',
        subtle: '#8b949e',
        border: '#30363d',
        success: '#3FB950',
        danger: '#F85149',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
};
