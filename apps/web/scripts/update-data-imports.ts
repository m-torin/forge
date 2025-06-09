/**
 * Script to help identify files that need to be updated to use the new data service
 * Run with: cd apps/web && npx tsx scripts/update-data-imports.ts
 */

const filesToUpdate = [
  // Header components
  "src/components/InteractiveHeader2.tsx",
  "src/components/ServerHeader.tsx",

  // Product pages
  "src/app/[locale]/(shop)/(other-pages)/products/[handle]/page.tsx",
  "src/app/[locale]/(shop)/(other-pages)/products/page-style-2/[handle]/page.tsx",
  "src/app/[locale]/(shop)/(other-pages)/products/unified/[handle]/page.tsx",

  // Collection pages
  "src/app/[locale]/(shop)/(other-pages)/collections/[handle]/page.tsx",
  "src/app/[locale]/(shop)/(other-pages)/collections/[handle]/layout.tsx",
  "src/app/[locale]/(shop)/(other-pages)/collections/page-style-2/[handle]/page.tsx",
  "src/app/[locale]/(shop)/(other-pages)/collections/page-style-2/[handle]/layout.tsx",

  // Blog pages
  "src/app/[locale]/(shop)/(other-pages)/blog/page.tsx",
  "src/app/[locale]/(shop)/(other-pages)/blog/[handle]/page.tsx",

  // Other pages
  "src/app/[locale]/(shop)/(home)/page.tsx",
  "src/app/[locale]/(shop)/(home-2)/home-2/page.tsx",
  "src/app/[locale]/(accounts)/account-wishlists/page.tsx",
  "src/app/[locale]/(shop)/(other-pages)/search/page.tsx",
  "src/app/[locale]/(shop)/(other-pages)/brands/[slug]/page.tsx",
  "src/app/[locale]/(shop)/(other-pages)/events/[slug]/page.tsx",
  "src/app/[locale]/(shop)/(other-pages)/locations/[slug]/page.tsx",
  "src/app/sitemap.ts",

  // Test pages
  "src/app/[locale]/(shop)/(other-pages)/test-drawers/page.tsx",
  "src/app/[locale]/(shop)/(other-pages)/test-drawers-manual/page.tsx",
];

console.log(`Files that need to be updated to use @/lib/data-service:\n`);

filesToUpdate.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`);
});

console.log(`\nTotal files to update: ${filesToUpdate.length}`);

console.log(`\nUpdate pattern:`);
console.log(
  `FROM: import { getProducts, getCollections, ... } from "@repo/design-system/mantine-ciseco"`,
);
console.log(
  `TO:   import { getProducts, getCollections, ... } from "@/lib/data-service"`,
);

console.log(
  `\nNote: Keep all other imports from @repo/design-system/mantine-ciseco unchanged!`,
);
