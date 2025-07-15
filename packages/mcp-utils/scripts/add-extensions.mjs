#!/usr/bin/env node
import { access, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

// Convert .js files to .mjs and add .mjs extensions to imports
async function convertToMjs(dir) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = join(dir, file.name);

    if (file.isDirectory()) {
      await convertToMjs(fullPath);
    } else if (file.name.endsWith('.js') && !file.name.endsWith('.d.ts')) {
      // Rename .js to .mjs
      const mjsPath = fullPath.replace(/\.js$/, '.mjs');

      await rename(fullPath, mjsPath);
      await processFile(mjsPath);
    }
  }
}

async function processFile(filePath) {
  let content = await readFile(filePath, 'utf-8');

  // Match import/export statements with relative paths
  content = content.replace(
    // eslint-disable-next-line security/detect-unsafe-regex
    /(import|export)\s+(.+?\s+from\s+)?(['"])(\.[^'"]+)\3/g,
    (match, keyword, middle, quote, importPath) => {
      // Skip if already has extension
      if (extname(importPath)) {
        return match;
      }

      // Check if it's likely a directory import
      // Common patterns: '../tools', './utils', etc.
      const lastPart = importPath.split('/').pop();
      const isDirectoryImport = ['tools', 'utils', 'types', 'helpers'].includes(
        lastPart,
      );

      const extension = isDirectoryImport ? '/index.mjs' : '.mjs';

      return `${keyword} ${middle || ''}${quote}${importPath}${extension}${quote}`;
    },
  );

  await writeFile(filePath, content);
}

// Run the script
console.log('Converting to .mjs and adding extensions...');
try {
  await access('./dist');
  await convertToMjs('./dist');
  console.log('Done!');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('No dist directory found, skipping conversion.');
  } else {
    throw error;
  }
}