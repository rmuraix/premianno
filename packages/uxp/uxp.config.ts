import type {
  UXP_Config,
  UXP_Config_Extra,
  UXP_Manifest,
} from "vite-uxp-plugin";
import { version } from "./package.json";

const extraPrefs: UXP_Config_Extra = {
  hotReloadPort: 8080,
  webviewUi: false,
  webviewReloadPort: 8081,
  copyZipAssets: [],
  uniqueIds: true,
  debugger: "udt",
};

export const id = "com.rmurai.premianno";
const name = "PremiAnno";

const manifest: UXP_Manifest = {
  id,
  name,
  version,
  main: "index.html",
  manifestVersion: 6,
  host: [
    {
      app: "premierepro",
      // UXP plugins are officially supported from Premiere Pro 25.6 onwards.
      minVersion: "25.6",
    },
  ],
  entrypoints: [
    {
      type: "panel",
      id: `${id}.main`,
      label: {
        default: name,
      },
      minimumSize: { width: 300, height: 300 },
      maximumSize: { width: 2000, height: 2000 },
      preferredDockedSize: { width: 320, height: 500 },
      preferredFloatingSize: { width: 600, height: 650 },
      icons: [
        {
          width: 23,
          height: 23,
          path: "icons/dark.png",
          scale: [1, 2],
          theme: ["darkest", "dark", "medium"],
        },
        {
          width: 23,
          height: 23,
          path: "icons/light.png",
          scale: [1, 2],
          theme: ["lightest", "light"],
        },
      ],
    },
  ],
  featureFlags: {
    enableAlerts: true,
  },
  requiredPermissions: {
    // Annotation data lives in the plugin data folder, and import/export use
    // the host file pickers.
    localFileSystem: "request",
    network: {
      domains: [
        `ws://localhost:${extraPrefs.hotReloadPort}`, // Required for hot reload
      ],
    },
    allowCodeGenerationFromStrings: false,
  },
  icons: [
    {
      width: 48,
      height: 48,
      path: "icons/plugin-icon.png",
      scale: [1, 2],
      theme: ["darkest", "dark", "medium", "lightest", "light", "all"],
      species: ["pluginList"],
    },
  ],
};

export const config: UXP_Config = {
  manifest,
  ...extraPrefs,
};
