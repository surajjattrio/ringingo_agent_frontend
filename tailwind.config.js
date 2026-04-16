/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#342df2",
          v10: "#FBE8E3",
        },
        "primary-green": {
          DEFAULT: "green",
          success: "#16D86D",
          v10: "#E6FFF4",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          v10: "#E4E6F6",
        },
        notification: {
          DEFAULT: "#2C99FE",
        },
        heading: {
          DEFAULT: "#13151F",
          yellow: "#FFF2B8",
          yellow2: "#F5C61D",
          "yellow-v10": "#FFFCEC",
        },
        error: {
          DEFAULT: "#E7515A",
          shadow: "#f0d5d7",
        },
        success: {
          DEFAULT: "blue",
        },
        layout: {
          DEFAULT: "#F2F2F2",
        },
        table: {
          header: "#F4F7FE",
        },
        dark: {
          400: "#646567",
          500: "#A5A6A8",
          600: "#B8B8B8",
          700: "#D8D8D8",
          800: "#EDEDED",
          950: "#F9F9F9",
        },
        white: "#FFFFFF",
        "txt-primary": "#646567",
        "txt-secondary": "#B2B3B5",
        ...colors, // HERE: spreading the default tailwind colors at the end
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        // sans: ["var(--font-noto)", ...fontFamily.sans],
        lexend: ["Lexend", "sans-serif"],
      },
      boxShadow: {
        box: "0 -1px 2px 0px rgba(0, 0, 0, 0.1)",
        top: "15px 10px 10px 10px rgba(0, 0, 0, 0.3)",
      },
    },
    screens: {
      smd: { min: "0px", max: "820px" },
      sm: { min: "0px", max: "480px" },
      md: { min: "481px", max: "768px" },
      "2md": { min: "769px", max: "820px" },
      lg: { min: "821px", max: "976px" },
      "2lg": { min: "977px", max: "1140px" },
      xl: { min: "1141px", max: "1190px" },
      "2xl": { min: "1191px", max: "1400px" },
      "3xl": { min: "1401px" },
      "4xl": { min: "1501px", max: "1700px" },
      "5xl": { min: "1701px" },
      tmd: { min: "821px", max: "1140px" },
      tlg: { min: "1141px", max: "1300px" },
      "2tlg": { min: "1301px", max: "1500px" },
    },
    colors: {
      primary: {
        DEFAULT: "#342df2",
        v10: "#FBE8E3",
      },
      "primary-green": {
        DEFAULT: "green",
        success: "#16D86D",
        v10: "#E6FFF4",
      },
      secondary: {
        // DEFAULT: "#313349",
        DEFAULT: "#FFFFFF",

        v10: "#E4E6F6",
      },
      notification: {
        DEFAULT: "#2C99FE",
      },
      heading: {
        DEFAULT: "#13151F",
        yellow: "#FFF2B8",
        yellow2: "#F5C61D",
        "yellow-v10": "#FFFCEC",
      },
      error: {
        DEFAULT: "#E7515A",
        shadow: "#f0d5d7",
      },
      success: {
        DEFAULT: "blue",
      },
      layout: {
        DEFAULT: "#F2F2F2",
      },
      table: {
        header: "#F4F7FE",
        data: "#eff6ff",
      },
      button: {
        background: "#322996",
      },
      dark: {
        400: "#646567",
        500: "#A5A6A8",
        600: "#B8B8B8",
        700: "#D8D8D8",
        800: "#EDEDED",
        950: "#F9F9F9",
      },
      white: "#FFFFFF",
      "txt-primary": "#646567",
      "txt-secondary": "#B2B3B5",
      ...colors,
    },
  },
  boxShadow: {
    top: "15px 10px 10px 10px rgba(0, 0, 0, 0.3)",
    // top: "15px 10px 10px 10px rgba(255, 255,255, 1)",
  },
  plugins: [],
};
