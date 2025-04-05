#!/usr/bin/env node
import { readFile, writeFile } from "fs/promises";
import { execSync } from "child_process";
import yaml from "js-yaml";

async function main() {
  try {
    console.log("📦 Updating catalog entries in pnpm-workspace.yaml...");

    // Read workspace file
    const workspaceYaml = await readFile("./pnpm-workspace.yaml", "utf8");
    const workspace = yaml.load(workspaceYaml);

    if (!workspace.catalog) {
      console.error("❌ No catalog section found in pnpm-workspace.yaml");
      process.exit(1);
    }

    // Get latest versions for each catalog entry
    const updates = [];
    const catalog = workspace.catalog;

    for (const [pkg, currentVersion] of Object.entries(catalog)) {
      try {
        // Use npm view to get the latest version
        console.log(`Checking ${pkg}...`);
        const latestVersion = execSync(`npm view ${pkg} version`, {
          encoding: "utf8",
        }).trim();

        // Parse current version to keep the same prefix (^ or ~)
        const prefix = currentVersion.startsWith("^")
          ? "^"
          : currentVersion.startsWith("~")
            ? "~"
            : "";
        const currentVersionNumber = currentVersion.replace(/[~^]/, "");

        // If different, update it
        if (latestVersion && latestVersion !== currentVersionNumber) {
          updates.push({
            pkg,
            from: currentVersion,
            to: `${prefix}${latestVersion}`,
          });
          catalog[pkg] = `${prefix}${latestVersion}`;
        }
      } catch (error) {
        console.error(`❌ Error checking ${pkg}: ${error.message}`);
      }
    }

    // Show results
    if (updates.length > 0) {
      console.log("\n📝 Updating catalog entries:");
      updates.forEach(({ pkg, from, to }) => {
        console.log(`  ${pkg}: ${from} → ${to}`);
      });

      // Write updated YAML back to file
      await writeFile(
        "./pnpm-workspace.yaml",
        yaml.dump(workspace, { lineWidth: -1 }),
        "utf8",
      );
      console.log("\n✅ Updated pnpm-workspace.yaml catalog entries");
    } else {
      console.log(
        "\nℹ️ All catalog entries are already at their latest versions",
      );
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
