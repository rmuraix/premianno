import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import { runAction, uxp } from "vite-uxp-plugin";

import { config } from "./uxp.config";

const action = process.env.BOLT_ACTION;
const mode = process.env.MODE;
process.env.VITE_BOLT_MODE = mode;

if (action) runAction(config, action);

export default defineConfig({
  // vite-uxp-plugin ships Vite 5 types, so its plugin object needs a cast to
  // satisfy the Vite 7 types used here.
  plugins: [uxp(config, mode) as unknown as PluginOption, react()],
  build: {
    sourcemap: mode && ["dev", "build"].includes(mode) ? "inline" : false,
    minify: false,
    rollupOptions: {
      // Modules provided by the UXP runtime.
      external: ["premierepro", "uxp", "fs", "os", "path", "process", "shell"],
      output: {
        format: "iife",
      },
    },
  },
  publicDir: "public",
});
