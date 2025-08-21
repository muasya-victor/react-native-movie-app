/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/(index)/.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#030014",
        secondary: "#151312",
        light: {
          100: "#D6C7FF",
          200: "#A8B5DB",
          300: "#9CA4AB",
        },
        dark: {
          100: "#221F3D",
          200: "#0F0D23",
        },
        accent: "#AB8BFF",
        'app-primary': '#4CAF50',
        'app-primary-dark': '#388E3C', 
        'app-primary-light': '#E8F5E8',
        'app-danger': '#FF5722',
        'app-danger-dark': '#E64A19',
        'app-danger-light': '#FFEBEE',
        'app-accent': '#2196F3',
        'app-accent-dark': '#1976D2',
        'app-accent-light': '#E3F2FD',
        'app-background': '#FFFFFF',
        'app-surface': '#F8F9FA',
        'app-surface-variant': '#F1F3F4',
        'app-pending': '#E8F5E8',
        'app-text-primary': '#212121',
        'app-text-secondary': '#757575', 
        'app-text-tertiary': '#9E9E9E',
        'app-border': '#E0E0E0',
        'app-divider': '#EEEEEE',
      },
      
    },
  },
  plugins: [],
};
