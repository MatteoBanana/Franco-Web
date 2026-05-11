/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  '#E0F2F1',
          100: '#B2DFDB',
          200: '#80CBC4',
          300: '#4DB6AC',
          400: '#26A69A',
          500: '#00796B',
          600: '#00695C',
          700: '#004D40',
          800: '#00352B',
          900: '#001F18',
        },
        mustard: {
          50:  '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF176',
          300: '#FFEE58',
          400: '#EAC435',
          500: '#D4AE2A',
          600: '#B8961E',
          700: '#9A7D14',
          800: '#7C640C',
          900: '#5E4B06',
        },
        terracotta: {
          50:  '#FBE9E7',
          100: '#FFCCBC',
          200: '#FFAB91',
          300: '#FF8A65',
          400: '#FF7043',
          500: '#D35400',
          600: '#BF4B00',
          700: '#A84000',
          800: '#8D3400',
          900: '#6D2800',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
