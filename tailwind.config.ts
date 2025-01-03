import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            a: {
              color: "#2563eb",
              "&:hover": {
                color: "#1d4ed8",
              },
              textDecoration: "none",
            },
            ul: {
              listStyleType: "disc",
              paddingLeft: "1.5rem",
            },
            li: {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
            },
            "li > p": {
              marginTop: "0.25rem",
              marginBottom: "0.25rem",
            },
            strong: {
              fontWeight: "600",
              color: "#1f2937",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
