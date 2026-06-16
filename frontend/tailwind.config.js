/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        admin: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        'admin-accent': '#1e5eff',
        'admin-accent-hover': '#1a56e6',
        'admin-hover': '#f0f5ff',
        'admin-ink': '#334155',
        'admin-surface': '#f4f6f9',
      },
    },
  },
};

export default config;
