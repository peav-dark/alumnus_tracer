/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './templates/**/*.twig',
    './assets/**/*.js',
    './src/**/*.php',
  ],
  theme: {
    extend: {
      colors: {
        norsu: {
          DEFAULT: '#1E40AF',
          dark: '#1E3A8A',
          light: '#3B82F6',
          50: '#EFF6FF',
        },
        accent: '#06B6D4',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
