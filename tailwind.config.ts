import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "system-ui"],
      },

      colors: {
        brand: {
          DEFAULT: "#065ca2", //main brand navbar
          50: "#f5fbfd", //Card Gradient color
          100: "#a4e0ef", //Card border color
          200: "#8bcfe9",
          300: "#73bde2",
          400: "#51a2ff", //Icons
          500: "#4596cf", //Label
          600: "#2b7fff",
          700: "#1a6fb3",
          800: "#065ca2",
          900: "#044378",
          button: "#1a6fb3", //Buttons
          header: "#d2e9f2bd", //Headers
        },
      },

      // ----------------------------Set:- 2--------------------------------
      //  colors: {
      //     brand: {
      //       DEFAULT: "#a20606", //main brand navbar
      //       50: "#fdf5f5", //Card Gradient color
      //       100: "#efa4a4", //Card border Color
      //       200: "#e98b8b",
      //       300: "#e27373",
      //       400: "#ff5151",
      //       500: "#cf4545", // Icon
      //       600: "#ff2b2b",
      //       700: "#b31a1a",
      //       800: "#a20606",
      //       900: "#780404",
      //       button:"#b31a1a", //Buttons
      //       header:"#f2d2d2bd", //Header

      //     },

      // },

      //------------------------------------- Set :- 3---------------------------
      //  colors: {
      //         brand: {
      //           DEFAULT: "#10a206", //main brand navbar
      //           50: "#f5fdf6", //Card Gradient color
      //           100: "#a4efad", //Card border Color
      //           200: "#a1e98b",
      //           300: "#89e273",
      //           400: "#51ff51",
      //           500: "#45cf5e", // Icon
      //           600: "#4eff2b",
      //           700: "#2cb31a",
      //           800: "#0ea206",
      //           900: "#1b7804",
      //           button:"#1db31a", //Buttons
      //           header:"#d2f2d2bd", //Header

      //         },

      //     },

      //------------------------------------- Set :- 4-----------------------------
      //  colors: {
      //         brand: {
      //           DEFAULT: "#a29d06", //main brand navbar
      //           50: "#fcfdf5", //Card Gradient color
      //           100: "#efeea4", //Card border Color
      //           200: "#e8e98b",
      //           300: "#e2e073",
      //           400: "#ffff51",
      //           500: "#cfcd45", // Icon
      //           600: "#f4ff2b",
      //           700: "#b3ab1a",
      //           800: "#9da206",
      //           900: "#787804",
      //           button:"#b3ab1a", //Buttons
      //           header:"#f2f2d2bd", //Header

      //         },

      //     },
    },
  },
  plugins: [],
};

export const App_config = {
  brandname: "AOA Doctor",
    // BRAND_LOGO: "https://orthodonticproductsonline.com/wp-content/uploads/2013/03/com_form2content_p3_f13871_77.jpg", // We can change brand logo from here
BRAND_LOGO:"https://static.vecteezy.com/system/resources/previews/034/899/022/non_2x/dental-clinic-logo-design-dentist-logo-vector.jpg"

};

export default config;
