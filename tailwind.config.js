module.exports = {
  purge: {
    enabled: true, // set true to purge
    content: [
      './views/*.hbs',
      './views/layouts/*.hbs',
      './views/partials/*.hbs'
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '0.5rem',
        sm: '0.75rem',
        lg: '1rem',
      },
    },
    screens: {
      // Removed 2xl
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    minHeight: {
      '14': '56px',
    },
    extend: {},
  },
  variants: {
    extend: {
      backgroundColor: ['even', 'odd']
    },
  },
  plugins: [],
}
