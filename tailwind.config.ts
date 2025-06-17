import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Chomp', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config; 