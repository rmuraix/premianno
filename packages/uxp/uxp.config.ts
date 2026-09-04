import type {
  UXP_Config,
  UXP_Config_Extra,
  UXP_Manifest,
} from "vite-uxp-plugin";
import { version } from "./package.json";

// The packaged plugin id doubles as the key of the UXP data folder that holds
// the annotations, so it must stay identical between the development build and
// the released package. `uniqueIds` would append the host app name to the id
// when packaging, which only matters for multi-host plugins.
const extraPrefs: UXP_Config_Extra = {
  hotReloadPort: 8080,
  webviewUi: false,
  webviewReloadPort: 8081,
  copyZipAssets: [],
  uniqueIds: false,
  debugger: "udt",
};

// The hot reload socket is only needed by builds that are loaded through the
// UXP Developer Tool, so it is kept out of the distributed manifest.
const isPackagedBuild =
  process.env.MODE === "package" || process.env.MODE === "zip";

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
  requiredPermissions: {
    // Annotation data lives in the plugin data folder, and import/export use
    // the host file pickers.
    localFileSystem: "request",
    ...(isPackagedBuild
      ? {}
      : {
          network: {
            domains: [`ws://localhost:${extraPrefs.hotReloadPort}`],
          },
        }),
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
