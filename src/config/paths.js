import { dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * @file Path configuration module
 * @module config/paths
 * @description Centralized directory path configuration for the application
 *
 * Dynamically calculates and exposes essential directory paths based on the
 * current module's location. Ensures consistent path resolution across the project.
 */

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(currentDir, "../..");
const srcDir = join(rootDir, "src");

export const paths = {
  root: rootDir,
  src: srcDir,
  views: join(srcDir, "views"),
  public: join(srcDir, "public"),
  layouts: join(srcDir, "views/layouts"),
  pages: join(srcDir, "views/pages"),
  partials: join(srcDir, "views/partials"),
};
