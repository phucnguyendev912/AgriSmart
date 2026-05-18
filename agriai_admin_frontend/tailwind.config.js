/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
          "primary-fixed-dim": "#5adf82",
          "secondary-fixed": "#ffdf90",
          "primary": "#006b32",
          "surface-variant": "#e1e3e4",
          "primary-container": "#008740",
          "outline-variant": "#bccabb",
          "on-background": "#191c1d",
          "tertiary-fixed": "#cce5ff",
          "on-error": "#ffffff",
          "secondary": "#755b00",
          "error-container": "#ffdad6",
          "secondary-container": "#fccc38",
          "background": "#f8f9fa",
          "on-secondary-fixed": "#241a00",
          "on-secondary": "#ffffff",
          "surface-container-low": "#f3f4f5",
          "surface-bright": "#f8f9fa",
          "on-primary-fixed": "#00210b",
          "primary-fixed": "#78fc9c",
          "surface-container-high": "#e7e8e9",
          "outline": "#6d7b6d",
          "on-surface": "#191c1d",
          "inverse-surface": "#2e3132",
          "surface-container": "#edeeef",
          "tertiary": "#006194",
          "surface": "#f8f9fa",
          "surface-tint": "#006d33",
          "on-primary-fixed-variant": "#005225",
          "on-tertiary-container": "#fdfcff",
          "on-tertiary-fixed-variant": "#004b73",
          "on-secondary-fixed-variant": "#584400",
          "tertiary-fixed-dim": "#92ccff",
          "on-primary": "#ffffff",
          "inverse-on-surface": "#f0f1f2",
          "on-tertiary": "#ffffff",
          "tertiary-container": "#007bb9",
          "on-primary-container": "#f7fff3",
          "inverse-primary": "#5adf82",
          "surface-container-highest": "#e1e3e4",
          "on-surface-variant": "#3d4a3e",
          "surface-dim": "#d9dadb",
          "on-error-container": "#93000a",
          "on-tertiary-fixed": "#001d31",
          "surface-container-lowest": "#ffffff",
          "error": "#ba1a1a",
          "secondary-fixed-dim": "#f0c12c",
          "on-secondary-container": "#6f5600"
      },
      "borderRadius": {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
      },
      "fontFamily": {
          "headline": ["Inter", "sans-serif"],
          "body": ["Inter", "sans-serif"],
          "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
