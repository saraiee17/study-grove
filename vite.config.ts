import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    port: 3000,
    strictPort: false,  // Will try next available port if 3000 is taken
    open: true,         // Opens browser automatically
    host: true          // Makes the server accessible from other devices on your network
  }
});
