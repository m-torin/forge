#!/usr/bin/env node
/**
 * Verification script for Cloudflare Image Workers
 * Checks configuration consistency between services and Terraform
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const WORKERS_DIR = 'services/cf-workers';
const TERRAFORM_DIR = 'infra/modules/cloudflare/image-workers';

const workers = ['image-processor', 'image-transformer', 'nextjs-image-optimizer'];

console.log('🔍 Verifying Cloudflare Image Workers Configuration...\n');

// Check 1: Worker source files exist
console.log('📁 Checking worker source files...');
for (const worker of workers) {
  const srcFile = join(WORKERS_DIR, worker, 'src', 'index.ts');
  if (existsSync(srcFile)) {
    console.log(`  ✅ ${worker}/src/index.ts exists`);
  } else {
    console.log(`  ❌ ${worker}/src/index.ts missing`);
  }
}

// Check 2: Package.json consistency
console.log('\n📦 Checking package.json consistency...');
for (const worker of workers) {
  const pkgFile = join(WORKERS_DIR, worker, 'package.json');
  if (existsSync(pkgFile)) {
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'));

    // Check for required scripts
    const requiredScripts = ['build', 'dev', 'deploy'];
    const hasAllScripts = requiredScripts.every(script => pkg.scripts?.[script]);

    if (hasAllScripts) {
      console.log(`  ✅ ${worker} has all required scripts`);
    } else {
      console.log(`  ❌ ${worker} missing required scripts`);
    }

    // Check for unused dependencies
    if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
      console.log(`  ⚠️  ${worker} has dependencies (should be empty for workers)`);
    } else {
      console.log(`  ✅ ${worker} has no dependencies`);
    }
  }
}

// Check 3: TypeScript configuration
console.log('\n🔧 Checking TypeScript configuration...');
for (const worker of workers) {
  const tsconfigFile = join(WORKERS_DIR, worker, 'tsconfig.json');
  if (existsSync(tsconfigFile)) {
    const tsconfig = JSON.parse(readFileSync(tsconfigFile, 'utf8'));

    if (tsconfig.compilerOptions?.target === 'ES2022') {
      console.log(`  ✅ ${worker} has correct TypeScript target`);
    } else {
      console.log(`  ❌ ${worker} has incorrect TypeScript target`);
    }
  }
}

// Check 4: Wrangler configuration
console.log('\n⚙️  Checking wrangler.toml configuration...');
for (const worker of workers) {
  const wranglerFile = join(WORKERS_DIR, worker, 'wrangler.toml');
  if (existsSync(wranglerFile)) {
    const wranglerContent = readFileSync(wranglerFile, 'utf8');

    if (wranglerContent.includes('pnpm build')) {
      console.log(`  ✅ ${worker} uses pnpm build`);
    } else {
      console.log(`  ❌ ${worker} doesn't use pnpm build`);
    }

    if (wranglerContent.includes('SIGNING_KEY')) {
      console.log(`  ✅ ${worker} has SIGNING_KEY configured`);
    } else {
      console.log(`  ❌ ${worker} missing SIGNING_KEY`);
    }
  }
}

// Check 5: Terraform configuration
console.log('\n🏗️  Checking Terraform configuration...');
const terraformFile = join(TERRAFORM_DIR, 'main.tf');
if (existsSync(terraformFile)) {
  const terraformContent = readFileSync(terraformFile, 'utf8');

  // Check for all workers
  for (const worker of workers) {
    const scriptName = worker.replace('-', '_');
    if (terraformContent.includes(`"${worker}"`)) {
      console.log(`  ✅ ${worker} defined in Terraform`);
    } else {
      console.log(`  ❌ ${worker} missing from Terraform`);
    }
  }

  // Check for required bindings
  const requiredBindings = ['IMAGES', 'SIGNING_KEY', 'IMAGE_METADATA'];
  for (const binding of requiredBindings) {
    if (terraformContent.includes(binding)) {
      console.log(`  ✅ ${binding} binding configured`);
    } else {
      console.log(`  ❌ ${binding} binding missing`);
    }
  }

  // Check for AI binding (image-processor only)
  if (terraformContent.includes('ai_binding')) {
    console.log(`  ✅ AI binding configured for image-processor`);
  } else {
    console.log(`  ❌ AI binding missing`);
  }
}

// Check 6: Environment variable consistency
console.log('\n🔗 Checking environment variable consistency...');
const expectedEnvVars = {
  'image-processor': ['IMAGES', 'SIGNING_KEY', 'IMAGE_METADATA', 'AI'],
  'image-transformer': ['IMAGES', 'SIGNING_KEY', 'IMAGE_METADATA'],
  'nextjs-image-optimizer': ['IMAGES', 'SIGNING_KEY', 'IMAGE_METADATA'],
};

for (const [worker, expectedVars] of Object.entries(expectedEnvVars)) {
  const srcFile = join(WORKERS_DIR, worker, 'src', 'index.ts');
  if (existsSync(srcFile)) {
    const srcContent = readFileSync(srcFile, 'utf8');

    for (const envVar of expectedVars) {
      if (srcContent.includes(envVar)) {
        console.log(`  ✅ ${worker} expects ${envVar}`);
      } else {
        console.log(`  ❌ ${worker} missing ${envVar}`);
      }
    }
  }
}

// Check 7: Route configuration
console.log('\n🛣️  Checking route configuration...');
const expectedRoutes = {
  'image-processor': ['/process', '/metadata/*'],
  'image-transformer': ['/cdn-cgi/image/*', '/images/*'],
  'nextjs-image-optimizer': ['/api/_next/image'],
};

if (existsSync(terraformFile)) {
  const terraformContent = readFileSync(terraformFile, 'utf8');

  for (const [worker, routes] of Object.entries(expectedRoutes)) {
    for (const route of routes) {
      if (terraformContent.includes(route)) {
        console.log(`  ✅ ${worker} route ${route} configured`);
      } else {
        console.log(`  ❌ ${worker} route ${route} missing`);
      }
    }
  }
}

console.log('\n✨ Verification complete!');
console.log('\n📋 Next steps:');
console.log('1. Run `pnpm install` in each worker directory');
console.log('2. Run `terraform init` in the environment directory');
console.log('3. Run `terraform plan` to verify configuration');
console.log('4. Deploy with `terraform apply`');
console.log('5. Test workers with the provided curl commands');
