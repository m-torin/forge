#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const GENERATED_DIR = 'src/lib/prisma/generated/schemas';
const TS_NOCHECK_COMMENT = '// @ts-nocheck\n';

async function addTsNoCheckToFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively process subdirectories
        await addTsNoCheckToFiles(fullPath);
      } else if (entry.name.endsWith('.ts')) {
        // Process TypeScript files
        const content = await readFile(fullPath, 'utf-8');

        // Check if @ts-nocheck is already present
        if (!content.startsWith('// @ts-nocheck')) {
          const newContent = TS_NOCHECK_COMMENT + content;
          await writeFile(fullPath, newContent);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error);
  }
}

async function main() {
  console.log('Adding @ts-nocheck to generated Prisma schema files...');

  try {
    await addTsNoCheckToFiles(GENERATED_DIR);
    console.log('✅ Successfully added @ts-nocheck to all generated schema files!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();