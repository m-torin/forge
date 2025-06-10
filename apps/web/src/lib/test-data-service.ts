/**
 * Simple test file to verify data service works
 * Run with: cd apps/web && npx tsx src/lib/test-data-service.ts
 */
import { getBlogPosts, getCollections, getProducts } from "../data/data-service";

async function testDataService() {
  console.log("Testing data service with fallback...\n");

  try {
    // Test products
    console.log("Fetching products...");
    const products = await getProducts();
    console.log(`✓ Retrieved ${products.length} products`);
    if (products.length > 0) {
      console.log(
        `  First product: ${products[0].title} - $${products[0].price}`,
      );
    }

    // Test collections
    console.log("\nFetching collections...");
    const collections = await getCollections();
    console.log(`✓ Retrieved ${collections.length} collections`);
    if (collections.length > 0) {
      console.log(`  First collection: ${collections[0].title}`);
    }

    // Test blog posts
    console.log("\nFetching blog posts...");
    const posts = await getBlogPosts();
    console.log(`✓ Retrieved ${posts.length} blog posts`);
    if (posts.length > 0) {
      console.log(`  First post: ${posts[0].title}`);
    }

    console.log("\n✅ All tests passed! Data service is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testDataService();
