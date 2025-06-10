/**
 * Test script to verify demo mode functionality
 * Run with: cd apps/web && npx tsx src/lib/test-demo-mode.ts
 */
import { env } from "@/env";

import { getBlogPosts, getCollections, getProducts } from "../data/data-service";

async function testDemoMode() {
  console.log("Testing Demo Mode Configuration...\n");
  console.log(`DEMO_MODE is: ${env.DEMO_MODE ? "ENABLED" : "DISABLED"}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log("-----------------------------------\n");

  // Test products
  console.log("Testing getProducts()...");
  const products = await getProducts();
  console.log(`✓ Retrieved ${products.length} products`);
  if (products.length > 0) {
    console.log(`  Sample: ${products[0].title} - $${products[0].price}`);
  }

  // Test collections
  console.log("\nTesting getCollections()...");
  const collections = await getCollections();
  console.log(`✓ Retrieved ${collections.length} collections`);
  if (collections.length > 0) {
    console.log(`  Sample: ${collections[0].title}`);
  }

  // Test blog posts
  console.log("\nTesting getBlogPosts()...");
  const posts = await getBlogPosts();
  console.log(`✓ Retrieved ${posts.length} blog posts`);
  if (posts.length > 0) {
    console.log(`  Sample: ${posts[0].title}`);
  }

  console.log("\n-----------------------------------");
  console.log(`✅ Demo mode test complete!`);
  console.log(
    `All data fetched from: ${env.DEMO_MODE ? "HARDCODED DATA" : "DATABASE (with fallback)"}`,
  );
}

// Run the test
testDemoMode().catch(console.error);
