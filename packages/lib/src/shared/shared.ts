import { version as packageVersion } from "../../package.json";
import {
  extensionCompany,
  extensionDisplayName,
  extensionId,
} from "./extensionMeta";

// Keep runtime constants free from Node-only config fields (e.g. process.env).
// This file is consumed by ExtendScript bundles.
export const ns = extensionId;
export const company = extensionCompany;
export const displayName = extensionDisplayName;
export const version = packageVersion;
