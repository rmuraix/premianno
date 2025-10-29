import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { runAction, uxp } from "vite-uxp-plugin";

import { config } from "./uxp.config";

const action = process.env.BOLT_ACTION;
const mode = process.env.MODE;

if (action) runAction(config, action);

const shouldNotEmptyDir =
  mode === "dev" && config.manifest.requiredPermissions?.enableAddon;

export default defineConfig({
  plugins: [uxp(config, mode), react(), tailwindcss()],
  build: {
    sourcemap: !!(mode && ["dev", "build"].includes(mode)),
    minify: false,
    emptyOutDir: !shouldNotEmptyDir,
    rollupOptions: {
      external: ["premierepro", "uxp", "fs", "os", "path", "process", "shell"],
      output: {
        format: "cjs",
      },
    },
  },
  publicDir: "public",
});
