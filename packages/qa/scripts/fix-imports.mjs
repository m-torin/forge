#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Recursively fix ESM imports in .mjs files to include .mjs extensions
 */
export async function fixEsmImports(dir) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const itemPath = join(dir, item);
    const stat = statSync(itemPath);
    
    if (stat.isDirectory()) {
      await fixEsmImports(itemPath);
    } else if (item.endsWith('.mjs')) {
      console.log(`Fixing imports in: ${itemPath}`);
      
      let content = readFileSync(itemPath, 'utf-8');
      let modified = false;
      
      // Fix relative imports and exports to include .mjs extension
      // Handle both import and export statements
      content = content.replace(
        /(import\s+[^'"]*['"](\.[^'"]+)['"]|export\s+[^'"]*['"](\.[^'"]+)['"])/g,
        (match, fullMatch, importPath, exportPath) => {
          const path = importPath || exportPath;
          
          // Skip if already has extension or is external
          if (path.includes('.mjs') || path.includes('?') || path.startsWith('http')) {
            return match;
          }
          
          modified = true;
          return match.replace(path, `${path}.mjs`);
        }
      );
      
      if (modified) {
        writeFileSync(itemPath, content, 'utf-8');
        console.log(`  ✅ Fixed imports in ${itemPath}`);
      } else {
        console.log(`  ⏭️  No imports to fix in ${itemPath}`);
      }
    }
  }
}

// If run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  const distDir = join(process.cwd(), 'dist');
  console.log('Fixing ESM imports in dist directory...');
  await fixEsmImports(distDir);
  console.log('✅ Finished fixing ESM imports');
}