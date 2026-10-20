/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8f4',
          100: '#e1efe6',
          200: '#c5e0cf',
          300: '#9bc8b0',
          400: '#6ea98e',
          500: '#488a70',
          600: '#226450', // primary brand
          700: '#1e5343',
          800: '#164839', // primary dark
          900: '#10372b',
          950: '#08211a'
        },
        sage: {
          50: '#f5f7f5',
          100: '#e8ece8',
          200: '#d4ddd4',
          300: '#b4c3b5',
          400: '#90a492',
          500: '#718874',
          600: '#586c5a'
        },
        paper: {
          DEFAULT: '#f8f9f5',
          subtle: '#f1f4ee',
          cream: '#fafbf8'
        },
        warm: {
          50: '#fdfaf7',
          100: '#fae6dc',
          200: '#f4c7b4',
          500: '#df7e64',
          800: '#7b4930'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif']
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px'
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(20, 50, 38, 0.05)',
        'elevated': '0 12px 36px rgba(20, 50, 38, 0.08)',
        'float': '0 24px 60px rgba(18, 48, 36, 0.14)'
      }
    }
  },
  plugins: []
};
