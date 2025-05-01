/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      colors: {
        "main-bg": "#111827",     // background
        "menu-active-bg": "#302d57", // background of active menu item
        "sub-bg": "#18212f", //main div background
        "primary-text": "#fbfbfb", // text color of main text
        "secondary-text": "#727986", // text color of subtext
        "tertiary-text": "#a186e7", // text of menu items when active
        "cards-bg": "#283141", // background of sub cards
        "logo-blue": "#5695E1",
        "main-purple": "#7c3bf1",
        "logout-red": "#572d2d",      // background
        "logout-text": "#e78686", 
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
