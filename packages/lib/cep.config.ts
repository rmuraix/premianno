import { CEP_Config } from "vite-cep-plugin";
import { version } from "./package.json";
import fs from "fs";
import path from "path";
import {
  extensionCompany,
  extensionDisplayName,
  extensionId,
} from "./src/shared/extensionMeta";

const isZxpPackaging = process.env.ZXP_PACKAGE === "true";

const getDotEnvPassword = () => {
  const envPath = path.resolve(__dirname, ".env");
  if (!fs.existsSync(envPath)) return undefined;

  const source = fs.readFileSync(envPath, "utf8");
  const line = source
    .split(/\r?\n/)
    .find((row) => /^\s*ZXP_PASSWORD\s*=/.test(row));
  if (!line) return undefined;

  const raw = line.replace(/^\s*ZXP_PASSWORD\s*=\s*/, "").trim();
  const unquoted = raw.replace(/^['"]|['"]$/g, "");
  return unquoted.length > 0 ? unquoted : undefined;
};

const zxpPassword = process.env.ZXP_PASSWORD || getDotEnvPassword();

if (isZxpPackaging && (!zxpPassword || zxpPassword.trim().length === 0)) {
  throw new Error(
    "ZXP_PASSWORD is required when ZXP_PACKAGE=true. Set it in your environment before packaging."
  );
}

const config: CEP_Config = {
  version,
  id: extensionId,
  displayName: extensionDisplayName,
  symlink: "local",
  port: 3000,
  servePort: 5000,
  startingDebugPort: 8860,
  extensionManifestVersion: 6.0,
  requiredRuntimeVersion: 9.0,
  hosts: [
    { name: "PPRO", version: "[0.0,99.9]" }, 
  ],

  type: "Panel",
  iconDarkNormal: "./src/assets/light-icon.png",
  iconNormal: "./src/assets/dark-icon.png",
  iconDarkNormalRollOver: "./src/assets/light-icon.png",
  iconNormalRollOver: "./src/assets/dark-icon.png",
  parameters: ["--v=0", "--enable-nodejs", "--mixed-context"],
  width: 500,
  height: 550,

  panels: [
    {
      mainPath: "./main/index.html",
      name: "main",
      panelDisplayName: extensionDisplayName,
      autoVisible: true,
      width: 600,
      height: 650,
    },
  ],
  build: {
    jsxBin: "off",
    sourceMap: true,
  },
  zxp: {
    country: "US",
    province: "CA",
    org: extensionCompany,
    password: zxpPassword,
    tsa: [
      "http://timestamp.digicert.com/", // Windows Only
      "http://timestamp.apple.com/ts01", // MacOS Only
    ],
    allowSkipTSA: false,
    sourceMap: false,
    jsxBin: "off",
  },
  installModules: [],
  copyAssets: [],
  copyZipAssets: [],
};
export default config;
