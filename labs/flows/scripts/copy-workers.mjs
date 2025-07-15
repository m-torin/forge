// scripts/copy-workers.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Emulate __dirname in ESM
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Define the Monaco worker scripts to copy
const workers = ['ts', 'json', 'css']; // Adjust as needed

// Function to copy worker scripts
const copyWorker = (workerName) => {
    const srcPath = path.join(
        dirname,
        '..',
        'node_modules',
        'monaco-editor',
        'esm',
        'vs',
        'language',
        workerName === 'ts' ? 'typescript' : workerName,
        `${workerName}.worker.js`
    );

    const destDir = path.join(dirname, '..', 'public', 'monaco-workers');
    const destPath = path.join(destDir, `${workerName}.worker.js`);

    // Ensure the destination directory exists
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        console.log(`Created directory: ${destDir}`);
    }

    // Check if the source file exists
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${workerName}.worker.js to public/monaco-workers/`);
    } else {
        console.error(`Source worker not found: ${srcPath}`);
    }
};

// Copy each specified worker
workers.forEach(copyWorker);

// Additionally, copy the general editor worker
const copyEditorWorker = () => {
    const srcPath = path.join(
        dirname,
        '..',
        'node_modules',
        'monaco-editor',
        'esm',
        'vs',
        'editor',
        'editor.worker.js'
    );

    const destDir = path.join(dirname, '..', 'public', 'monaco-workers');
    const destPath = path.join(destDir, 'editor.worker.js');

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied editor.worker.js to public/monaco-workers/`);
    } else {
        console.error(`Source editor worker not found: ${srcPath}`);
    }
};

copyEditorWorker();
