import { PrismaClient } from '../../../../prisma-generated/client';
import {
  generateProduct,
  generateProductMedia,
  generateProductVariants,
} from './generators/generate-products';
import { generateReview, generateReviewVotes } from './generators/generate-reviews';
import { generateUser, generateUserAddress } from './generators/generate-users';

const prisma = new PrismaClient();

// Configuration
const FAKER_CONFIG = {
  ADDITIONAL_USERS: 30,
  ADDITIONAL_PRODUCTS: 50,
  REVIEWS_PER_PRODUCT: { min: 2, max: 8 },
};

export async function seedFakerExtended() {
  console.log('🎲 Starting faker extended data generation...\n');

  // Generate additional users
  await generateAdditionalUsers();

  // Generate additional products with variants
  await generateAdditionalProducts();

  // Generate reviews for all products
  await generateProductReviews();

  console.log('\n🎉 Faker extended data generation completed!');
}

async function generateAdditionalUsers() {
  console.log('👥 Generating additional users...');

  const users = [];
  for (let i = 0; i < FAKER_CONFIG.ADDITIONAL_USERS; i++) {
    const userData = generateUser();
    try {
      const user = await prisma.user.create({ data: userData });
      users.push(user);

      // Create 1-2 addresses for some users
      if (Math.random() > 0.5) {
        const addressCount = Math.random() > 0.7 ? 2 : 1;
        for (let j = 0; j < addressCount; j++) {
          await prisma.address.create({
            data: generateUserAddress(user.id),
          });
        }
      }
    } catch (_error) {
      // Skip if email already exists
    }
  }

  console.log(`✅ Generated ${users.length} additional users`);
}

async function generateAdditionalProducts() {
  console.log('📦 Generating additional products...');

  // Get existing brands
  const brands = await prisma.brand.findMany();
  if (brands.length === 0) {
    console.log('⚠️  No brands found. Skipping product generation.');
    return;
  }

  // Get existing product categories
  const categories = await prisma.productCategory.findMany();
  const categoryNames = categories.map(c => c.name);

  // Track existing slugs to ensure uniqueness
  const existingProducts = await prisma.product.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existingProducts.map(p => p.slug));

  let productsCreated = 0;
  let variantsCreated = 0;

  for (let i = 0; i < FAKER_CONFIG.ADDITIONAL_PRODUCTS; i++) {
    try {
      // Pick a random category and brand
      const category =
        categoryNames[Math.floor(Math.random() * categoryNames.length)] || 'Clothing';
      const brand = brands[Math.floor(Math.random() * brands.length)];

      // Generate parent product
      const productData = generateProduct(category, brand.id, existingSlugs);
      const product = await prisma.product.create({ data: productData });
      productsCreated++;

      // Generate variants
      const variants = generateProductVariants(product, category);
      for (const variantData of variants) {
        await prisma.product.create({ data: variantData });
        variantsCreated++;
      }

      // Generate media for parent product
      const mediaItems = generateProductMedia(product.id, product.name);
      if (mediaItems.length > 0) {
        await prisma.media.createMany({ data: mediaItems });
      }

      // Also add featured image to first variant
      const firstVariant = await prisma.product.findFirst({
        where: { parentId: product.id, isDefault: true },
      });

      if (firstVariant && mediaItems[0]) {
        await prisma.media.create({
          data: {
            ...mediaItems[0],
            productId: firstVariant.id,
            sortOrder: 0,
          },
        });
      }
    } catch (error: any) {
      console.error(`⚠️  Failed to create product: ${error.message}`);
    }
  }

  console.log(`✅ Generated ${productsCreated} products with ${variantsCreated} variants`);
}

async function generateProductReviews() {
  console.log('⭐ Generating product reviews...');

  // Get all physical products and users
  const products = await prisma.product.findMany({
    where: { type: 'PHYSICAL' },
  });

  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('⚠️  No users found. Skipping review generation.');
    return;
  }

  let reviewsCreated = 0;
  let votesCreated = 0;

  for (const product of products) {
    // Random number of reviews per product
    const reviewCount = Math.floor(
      Math.random() *
        (FAKER_CONFIG.REVIEWS_PER_PRODUCT.max - FAKER_CONFIG.REVIEWS_PER_PRODUCT.min + 1) +
        FAKER_CONFIG.REVIEWS_PER_PRODUCT.min,
    );

    // Select random users for reviews
    const reviewers = [...users].sort(() => 0.5 - Math.random()).slice(0, reviewCount);

    for (const reviewer of reviewers) {
      try {
        // Generate review
        const reviewData = generateReview(
          product.id,
          reviewer.id,
          product.name,
          product.attributes as any,
        );
        const review = await prisma.review.create({ data: reviewData });
        reviewsCreated++;

        // Generate votes for the review
        const otherUsers = users.filter(u => u.id !== reviewer.id);
        const votes = generateReviewVotes(
          review.id,
          otherUsers.map(u => u.id),
          review.rating,
        );

        if (votes.length > 0) {
          await prisma.reviewVoteJoin.createMany({ data: votes });
          votesCreated += votes.length;

          // Update helpful count
          const helpfulVotes = votes.filter(v => v.voteType === 'HELPFUL').length;
          await prisma.review.update({
            where: { id: review.id },
            data: {
              helpfulCount: helpfulVotes,
              totalVotes: votes.length,
            },
          });
        }
      } catch (_error: any) {
        // Skip if review already exists for this user/product
      }
    }
  }

  console.log(`✅ Generated ${reviewsCreated} reviews with ${votesCreated} votes`);
}

async function main() {
  try {
    await seedFakerExtended();
  } catch (error: any) {
    console.error('❌ Faker seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
