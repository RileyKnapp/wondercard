export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        holiday: ['"Mountains of Christmas"', 'cursive'],
        body: ['"Lato"', 'sans-serif'],
      },
      colors: {
        holiday: {
          red: '#D42426',
          green: '#165B33',
          gold: '#F8B229',
          cream: '#FBF6F3',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    }
  },
  plugins: [],
}
