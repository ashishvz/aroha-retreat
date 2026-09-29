import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // run `python3 server/app.py` alongside `npm run dev`
  server: { proxy: { "/api": "http://localhost:8088" } },
});
