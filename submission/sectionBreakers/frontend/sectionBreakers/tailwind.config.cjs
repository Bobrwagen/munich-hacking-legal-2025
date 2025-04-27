module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", 
    ],
    theme: {
      extend: {
        fontFamily: {
          roboto: ['Roboto', 'sans-serif'],
        },
        backgroundImage: {
          'soft-gradient': 'radial-gradient(circle at top left, #fdfcbf, #a4d8f0)',
        },
      },
    },
    plugins: [],
  }
  