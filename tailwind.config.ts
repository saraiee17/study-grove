import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Comfortaa', 'system-ui', 'sans-serif'],
        title: ['Chewy', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config; 