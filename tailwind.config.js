/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Restrained, athletic accent used sparingly for primary actions and status.
        accent: {
          50: '#fef4ee',
          100: '#fde4d3',
          200: '#fac6a6',
          300: '#f6a06f',
          400: '#f07338',
          500: '#e35313',
          600: '#d4480a',
          700: '#b0370d',
          800: '#8c2d12',
          900: '#712712',
          950: '#3d1206',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        app: '32rem',
      },
      minHeight: {
        touch: '2.75rem',
      },
      minWidth: {
        touch: '2.75rem',
      },
    },
  },
  plugins: [],
};
