#!/usr/bin/env node

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../");

const args = process.argv.slice(2);

try {
  execSync(`prettier ${args.join(" ")}`, {
    stdio: "inherit",
    cwd: rootDir,
  });
} catch (error) {
  process.exit(1);
}
