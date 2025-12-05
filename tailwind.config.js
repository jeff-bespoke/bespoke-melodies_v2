/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./templates/**/*.liquid",
        "./sections/**/*.liquid",
        "./snippets/**/*.liquid",
        "./layout/**/*.liquid"
    ],
    theme: {
        extend: {
            colors: {
                'charcoal': '#1a1a1a',
                'charcoal-light': '#2d2d2d',
                'gold': '#D4AF37',
                'gold-hover': '#b5952f',
                'gold-dark': '#9a7b1f',
                'off-white': '#f5f5f5',
                'burgundy': '#5a0e1a',
                'emerald-dark': '#022c22',
                'champagne': '#f3e5ab',
            },
            fontFamily: {
                'serif': ['"Playfair Display"', 'serif'],
                'sans': ['"Inter"', 'sans-serif'],
            }
        }
    },
    plugins: []
}
