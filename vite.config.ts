import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Встановлення базового шляху для GitHub Pages
  base: "/vite-react-ts-1/",
});
