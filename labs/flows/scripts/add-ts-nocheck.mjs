#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const GENERATED_DIR = 'src/lib/prisma/generated/schemas';
const TS_NOCHECK_COMMENT = '// @ts-nocheck\n';

/**
 * Fix invalid 'include: ,' syntax generated for models without relations
 * This is a known bug in prisma-zod-generator when isGenerateInclude = true
 */
function fixIncludeSyntaxError(content) {
  // Remove 'include: ,' (invalid empty property)
  // Matches: include: , or include:,
  return content.replace(/include\s*:\s*,/g, '');
}

async function addTsNoCheckToFiles(dir) {
  let filesProcessed = 0;
  let filesFixed = 0;

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively process subdirectories
        const subResults = await addTsNoCheckToFiles(fullPath);
        filesProcessed += subResults.processed;
        filesFixed += subResults.fixed;
      } else if (entry.name.endsWith('.ts')) {
        // Process TypeScript files
        let content = await readFile(fullPath, 'utf-8');
        let modified = false;

        // Fix include syntax errors
        const fixedContent = fixIncludeSyntaxError(content);
        if (fixedContent !== content) {
          content = fixedContent;
          modified = true;
          filesFixed++;
        }

        // Check if @ts-nocheck is already present
        if (!content.startsWith('// @ts-nocheck')) {
          content = TS_NOCHECK_COMMENT + content;
          modified = true;
        }

        if (modified) {
          await writeFile(fullPath, content);
        }

        filesProcessed++;
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error);
  }

  return { processed: filesProcessed, fixed: filesFixed };
}

async function main() {
  console.log('Processing generated Prisma schema files...');
  console.log('- Adding @ts-nocheck directives');
  console.log('- Fixing include syntax errors for models without relations');

  try {
    const { processed, fixed } = await addTsNoCheckToFiles(GENERATED_DIR);
    console.log(`✅ Processed ${processed} files`);
    if (fixed > 0) {
      console.log(`🔧 Fixed include syntax errors in ${fixed} files`);
    }
    console.log('✅ All schema files ready!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();