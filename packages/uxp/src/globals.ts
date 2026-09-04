import type { premierepro as premiereproTypes } from "@adobe/premierepro";

if (typeof require === "undefined") {
  // Keeps the module importable outside of the UXP runtime (e.g. unit tests).
  //@ts-expect-error
  window.require = (_moduleName: string) => {
    return {};
  };
}

export const uxp = require("uxp") as typeof import("uxp");
// biome-ignore lint/style/useNodejsImportProtocol: "os" here is the UXP module, not the Node.js builtin
export const os = require("os") as typeof import("os");

const hostName = uxp?.host?.name?.toLowerCase();

export const premierepro = (
  hostName === "premierepro" ? require("premierepro") : {}
) as premiereproTypes;
