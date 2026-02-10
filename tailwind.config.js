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
        'pokemon-yellow': '#FFCB05',
        'pokemon-blue': '#3D7DCA',
        'pokemon-red': '#FF0000',
      },
    },
  },
  plugins: [],
};
