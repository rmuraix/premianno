// vite-uxp-plugin names its archives after the plugin id (`<id>_<host>.ccx`)
// and the panel label (`<name>_<version>.zip`), which are neither consistent
// with each other nor with how the plugin is distributed. Both are renamed to
// the product name so the release assets stay predictable; the version lives in
// the release tag, as it did for the CEP builds.
import { existsSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const PRODUCT_NAME = "premianno";

const renameArtifact = (dir, extension) => {
  if (!existsSync(dir)) return;

  const target = `${PRODUCT_NAME}${extension}`;
  const candidates = readdirSync(dir).filter(
    (file) => file.endsWith(extension) && file !== target,
  );

  if (candidates.length > 1) {
    throw new Error(
      `Expected at most one ${extension} in ${dir}/, found: ${candidates.join(", ")}`,
    );
  }

  for (const file of candidates) {
    renameSync(join(dir, file), join(dir, target));
    console.log(`renamed ${dir}/${file} → ${dir}/${target}`);
  }
};

renameArtifact("ccx", ".ccx");
renameArtifact("zip", ".zip");
