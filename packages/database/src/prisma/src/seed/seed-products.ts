import { PrismaClient } from '../../../../prisma-generated/client';
import { webappProducts } from './data/webapp-data';
import {
  extractProductMedia,
  extractProductVariants,
  mapWebappProductToPrisma,
} from './mappers/product-mapper';

const prisma = new PrismaClient();

async function main() {
  try {
    await seedProducts();
  } catch (error: any) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

export async function seedProducts() {
  console.log('🌱 Seeding webapp products...');

  // First, ensure we have the brands created
  const uniqueVendors = [...new Set(webappProducts.map(p => p.vendor))];
  console.log(`📦 Creating ${uniqueVendors.length} brands...`);

  for (const vendor of uniqueVendors) {
    const existingBrand = await prisma.brand.findUnique({
      where: { slug: vendor.toLowerCase().replace(/\s+/g, '-') },
    });

    if (!existingBrand) {
      await prisma.brand.create({
        data: {
          name: vendor,
          slug: vendor.toLowerCase().replace(/\s+/g, '-'),
          type: 'LABEL',
          status: 'PUBLISHED',
          copy: {
            description: `${vendor} is a premium fashion brand.`,
          },
        },
      });
      console.log(`✅ Created brand: ${vendor}`);
    }
  }

  // Now create products with their variants and media
  for (const webappProduct of webappProducts) {
    try {
      // Check if product already exists
      const existingProduct = await prisma.product.findUnique({
        where: { slug: webappProduct.handle },
      });

      if (existingProduct) {
        console.log(`ℹ️  Product already exists: ${webappProduct.title}`);
        continue;
      }

      // Create the parent product
      const productData = mapWebappProductToPrisma(webappProduct);
      const product = await prisma.product.create({
        data: productData,
      });

      console.log(`✅ Created product: ${product.name}`);

      // Create variants
      const variants = extractProductVariants(webappProduct, product.id);
      if (variants.length > 0) {
        for (const variantData of variants) {
          await prisma.product.create({
            data: variantData,
          });
        }
        console.log(`   ✅ Created ${variants.length} variants`);
      }

      // Create media
      const mediaItems = extractProductMedia(webappProduct, product.id);
      if (mediaItems.length > 0) {
        await prisma.media.createMany({
          data: mediaItems,
        });
        console.log(`   ✅ Created ${mediaItems.length} media items`);
      }

      // Also create media for the first variant (featured image)
      if (variants.length > 0) {
        const firstVariant = await prisma.product.findFirst({
          where: {
            parentId: product.id,
            isDefault: true,
          },
        });

        if (firstVariant && webappProduct.images[0]) {
          await prisma.media.create({
            data: {
              url: webappProduct.images[0].src,
              altText: webappProduct.images[0].alt || webappProduct.title,
              type: 'IMAGE',
              width: 800,
              height: 1200,
              size: 288000, // ~280KB for main product image
              mimeType: 'image/jpeg',
              sortOrder: 0,
              productId: firstVariant.id,
              copy: {},
            },
          });
        }
      }
    } catch (error: any) {
      console.error(`❌ Failed to create product ${webappProduct.title}:`, error.message);
    }
  }

  console.log('🎉 Webapp product seeding completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
