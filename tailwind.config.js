/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PaySlab brand colors
        payslab: {
          primary: '#8b61c2',
          'primary-hover': '#7952a8',
          secondary: '#f8f9fa',
          accent: '#008751', // Nigerian green
        },
        // Nigerian flag colors
        nigeria: {
          green: '#008751',
          white: '#ffffff',
        },
      },
      fontFamily: {
        // Add ClashDisplay font
        clash: ['var(--font-clash-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'payslab': '0 4px 6px -1px rgba(139, 97, 194, 0.1), 0 2px 4px -1px rgba(139, 97, 194, 0.06)',
        'payslab-lg': '0 10px 15px -3px rgba(139, 97, 194, 0.1), 0 4px 6px -2px rgba(139, 97, 194, 0.05)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
 
  ],
}