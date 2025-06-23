import { faker } from '@faker-js/faker';

import {
  BrandType,
  CollectionType,
  ContentStatus,
  MediaType,
  type Prisma,
  PrismaClient,
  ProductStatus,
  ProductType,
  PurchaseStatus,
  RegistryType,
  RegistryUserRole,
  ReviewType,
  TaxonomyType,
  VoteType,
} from '../../../../prisma-generated/client';

const prisma = new PrismaClient();

// Configuration
const SEED_COUNT = {
  ARTICLES: 40,
  BRANDS: 30,
  COLLECTIONS: 15,
  PRODUCT_CATEGORIES: 20,
  PRODUCTS: 100,
  REGISTRIES: 30,
  REVIEWS: 200,
  TAXONOMIES: 25,
  USERS: 50,
};

// Helper function to maybe return a value (with 50% probability)
function maybe<T>(value: T): null | T {
  return Math.random() > 0.5 ? value : null;
}

// Helper function to generate JSON content for articles
function generateArticleContent(): Prisma.JsonValue {
  const paragraphs = Array.from({ length: faker.number.int({ max: 8, min: 3 }) }, () => ({
    content: faker.lorem.paragraph(),
    type: 'paragraph',
  }));

  const images = Array.from({ length: faker.number.int({ max: 3, min: 0 }) }, () => ({
    caption: faker.lorem.sentence(),
    type: 'image',
    url: faker.image.url(),
  }));

  return {
    blocks: [...paragraphs, ...images],
    metadata: {
      author: faker.person.fullName(),
      publishedAt: faker.date.past().toISOString(),
      tags: Array.from({ length: faker.number.int({ max: 5, min: 1 }) }, () => faker.word.sample()),
    },
    title: faker.lorem.sentence(),
  };
}

// Helper function to generate JSON content for brands
function generateBrandContent(): Prisma.JsonValue {
  return {
    contact: {
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
    },
    description: faker.company.catchPhrase(),
    history: faker.company.buzzPhrase(),
    mission: faker.company.catchPhrase(),
    seo: {
      keywords: Array.from({ length: faker.number.int({ max: 8, min: 3 }) }, () =>
        faker.company.buzzAdjective(),
      ),
      metaDescription: faker.company.catchPhrase(),
      metaTitle: faker.company.name(),
    },
    social: {
      facebook: `https://facebook.com/${faker.internet.userName()}`,
      instagram: `https://instagram.com/${faker.internet.userName()}`,
      twitter: `https://twitter.com/${faker.internet.userName()}`,
      website: faker.internet.url(),
    },
    values: Array.from({ length: faker.number.int({ max: 5, min: 3 }) }, () =>
      faker.company.buzzNoun(),
    ),
  };
}

// Helper function to generate JSON content for category
function generateCategoryContent(): Prisma.JsonValue {
  return {
    description: faker.lorem.paragraph(),
    displayOptions: {
      featuredProducts: Math.random() > 0.5,
      showInFooter: Math.random() > 0.7,
      showInNavigation: Math.random() > 0.3,
      showInSitemap: true,
    },
    seo: {
      keywords: Array.from({ length: faker.number.int({ max: 8, min: 3 }) }, () =>
        faker.commerce.productAdjective(),
      ),
      metaDescription: faker.lorem.paragraph(),
      metaTitle: faker.commerce.department(),
    },
  };
}

// Helper function to generate JSON content for collections
function generateCollectionContent(): Prisma.JsonValue {
  return {
    displayOptions: {
      itemsPerPage: faker.number.int({ max: 24, min: 8 }),
      layout: randomEnum({ GRID: 'GRID', LIST: 'LIST', MASONRY: 'MASONRY' }),
      sortOptions: ['newest', 'price-low-high', 'price-high-low', 'popular'],
    },
    featured: Math.random() > 0.7,
    seasonal:
      Math.random() > 0.7
        ? {
            endDate: faker.date.future().toISOString(),
            season: randomEnum({
              FALL: 'FALL',
              HOLIDAY: 'HOLIDAY',
              SPRING: 'SPRING',
              SUMMER: 'SUMMER',
              WINTER: 'WINTER',
            }),
            startDate: faker.date.future().toISOString(),
          }
        : null,
    seo: {
      keywords: Array.from({ length: faker.number.int({ max: 8, min: 3 }) }, () =>
        faker.commerce.productAdjective(),
      ),
      metaDescription: faker.lorem.paragraph(),
      metaTitle: faker.commerce.department(),
    },
    shortDescription: faker.lorem.sentence(),
  };
}

// Helper function to generate JSON content for products
function generateProductContent(): Prisma.JsonValue {
  return {
    features: Array.from({ length: faker.number.int({ max: 8, min: 3 }) }, () =>
      faker.commerce.productAdjective(),
    ),
    pricing: {
      discount: `${faker.number.int({ max: 50, min: 5 })}%`,
      msrp: faker.commerce.price({ max: 1000, min: 10 }),
      salePrice: faker.commerce.price({ max: 900, min: 5 }),
    },
    seo: {
      keywords: Array.from({ length: faker.number.int({ max: 8, min: 3 }) }, () =>
        faker.commerce.productAdjective(),
      ),
      metaDescription: faker.commerce.productDescription(),
      metaTitle: faker.commerce.productName(),
    },
    specifications: {
      color: faker.color.human(),
      dimensions: `${faker.number.int({ max: 100, min: 1 })}x${faker.number.int({ max: 100, min: 1 })}x${faker.number.int({ max: 100, min: 1 })} cm`,
      material: faker.commerce.productMaterial(),
      weight: `${faker.number.float({ fractionDigits: 2, max: 20, min: 0.1 })} kg`,
    },
  };
}

// Helper function to generate suspension details
function generateSuspensionDetails(): Prisma.JsonValue {
  return {
    appealStatus: randomEnum({
      APPROVED: 'APPROVED',
      NONE: 'NONE',
      PENDING: 'PENDING',
      REJECTED: 'REJECTED',
    }),
    notes: faker.lorem.paragraph(),
    reason: faker.lorem.sentence(),
    suspendedAt: faker.date.past().toISOString(),
    suspendedBy: faker.person.fullName(),
    suspendedUntil: faker.date.future().toISOString(),
    warningCount: faker.number.int({ max: 5, min: 1 }),
  };
}

// Helper function to generate JSON content for taxonomies
function generateTaxonomyContent(): Prisma.JsonValue {
  return {
    description: faker.lorem.paragraph(),
    displayOptions: {
      showInFooter: Math.random() > 0.7,
      showInNavigation: Math.random() > 0.3,
      showInSitemap: true,
    },
    seo: {
      keywords: Array.from({ length: faker.number.int({ max: 8, min: 3 }) }, () =>
        faker.commerce.productAdjective(),
      ),
      metaDescription: faker.lorem.paragraph(),
      metaTitle: faker.commerce.department(),
    },
  };
}

// Helper function to generate user preferences
function generateUserPreferences(): Prisma.JsonValue {
  return {
    display: {
      defaultSort: randomEnum({
        NEWEST: 'NEWEST',
        POPULAR: 'POPULAR',
        PRICE_ASC: 'PRICE_ASC',
        PRICE_DESC: 'PRICE_DESC',
      }),
      productsPerPage: faker.number.int({ max: 48, min: 12 }),
    },
    notifications: {
      email: Math.random() > 0.3,
      push: Math.random() > 0.5,
      sms: Math.random() > 0.7,
    },
    privacy: {
      marketingEmails: Math.random() > 0.6,
      shareData: Math.random() > 0.5,
    },
    theme: randomEnum({ DARK: 'DARK', LIGHT: 'LIGHT', SYSTEM: 'SYSTEM' }),
  };
}

// Helper function to pick random items from an array
function pickRandom<T>(array: T[], count = 1): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to generate random enum values
function randomEnum<T extends object>(enumObj: T): T[keyof T] {
  const values = Object.values(enumObj);
  const randomIndex = Math.floor(Math.random() * values.length) as number as number;
  return values[randomIndex];
}

// Main seed function
async function seedEcommerce() {
  // eslint-disable-next-line no-console
  console.log('🌱 Starting e-commerce database seeding...');

  try {
    // Get existing users or note that we need to create them
    const existingUsers = await prisma.user.findMany();

    if (existingUsers.length === 0) {
      // eslint-disable-next-line no-console
      console.log('⚠️  No users found! Please run the following commands first:');
      // eslint-disable-next-line no-console
      console.log('1. Start backstage: pnpm dev --filter=backstage');
      // eslint-disable-next-line no-console
      console.log('2. Create users: pnpm --filter @repo/database create-users');
      // eslint-disable-next-line no-console
      console.log('3. Then run this seed again');
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`📊 Found ${existingUsers.length} existing users`);

    // Get default organization
    const defaultOrg = await prisma.organization.findFirst({
      where: { slug: 'default-org' },
    });

    if (!defaultOrg) {
      // eslint-disable-next-line no-console
      console.log('⚠️  Default organization not found! Please run the main seed first.');
      return;
    }

    // 1. Update existing users with e-commerce fields
    // eslint-disable-next-line no-console
    console.log('👤 Updating users with e-commerce fields...');
    const users = await Promise.all(
      existingUsers.map(async (user: any) => {
        const isVerifiedAuthor = Math.random() < 0.2; // 20% of users are verified authors
        const isSuspended = Math.random() < 0.05; // 5% of users are suspended
        const isBanned = Math.random() < 0.02; // 2% of users are banned

        return prisma.user.update({
          data: {
            authorSince: user.authorSince ?? (isVerifiedAuthor ? faker.date.past() : null),
            banExpires: user.banExpires ?? (isBanned ? faker.date.future() : null),
            banned: user.banned ?? isBanned,
            banReason: user.banReason ?? (isBanned ? faker.lorem.sentence() : null),
            bio: user.bio ?? (Math.random() > 0.5 ? faker.person.bio() : null),
            expertise:
              user.expertise.length > 0
                ? user.expertise
                : Math.random() > 0.7
                  ? Array.from({ length: faker.number.int({ max: 4, min: 1 }) }, () =>
                      faker.commerce.department(),
                    )
                  : [],
            isSuspended: user.isSuspended ?? isSuspended,
            isVerifiedAuthor: user.isVerifiedAuthor ?? isVerifiedAuthor,
            phoneNumber: user.phoneNumber ?? (Math.random() > 0.5 ? faker.phone.number() : null),
            preferences: user.preferences ?? (generateUserPreferences() as any),
            suspensionDetails:
              user.suspensionDetails ||
              (isSuspended ? (generateSuspensionDetails() as any) : undefined),
          },
          where: { id: user.id },
        });
      }),
    );

    // 1.5. Create organization memberships for users
    // eslint-disable-next-line no-console
    console.log('🏢 Creating organization memberships...');
    const members = await Promise.all(
      users.map(async (user, index: any) => {
        // Check if member already exists
        const existingMember = await prisma.member.findUnique({
          where: {
            userId_organizationId: {
              organizationId: defaultOrg.id,
              userId: user.id,
            },
          },
        });

        if (!existingMember) {
          // First user is owner, next 2 are admins, rest are members
          const role = index === 0 ? 'owner' : index <= 2 ? 'admin' : 'member';

          return prisma.member.create({
            data: {
              createdAt: new Date(),
              id: crypto.randomUUID(),
              organizationId: defaultOrg.id,
              role,
              userId: user.id,
            },
          });
        }
        return existingMember;
      }),
    );

    // 1.6. Create teams within the organization
    // eslint-disable-next-line no-console
    console.log('👥 Creating teams...');
    const teams = await Promise.all(
      ['Engineering', 'Marketing', 'Sales', 'Support', 'Design'].map(async (teamName: any) => {
        return prisma.team.create({
          data: {
            createdAt: new Date(),
            description: `The ${teamName} team at ${defaultOrg.name}`,
            id: crypto.randomUUID(),
            name: teamName,
            organizationId: defaultOrg.id,
          },
        });
      }),
    );

    // 1.7. Add users to teams
    // eslint-disable-next-line no-console
    console.log('👥 Adding users to teams...');
    for (const team of teams) {
      // Add 3-8 users to each team
      const teamUserCount = faker.number.int({ max: 8, min: 3 });
      const teamUsers = pickRandom(users, Math.min(teamUserCount, users.length));

      for (let i = 0; i < teamUsers.length; i++) {
        const user = teamUsers[i];
        // First user in each team is the lead
        const role = i === 0 ? 'lead' : 'member';

        await prisma.teamMember.create({
          data: {
            role,
            teamId: team.id,
            userId: user.id,
          },
        });
      }
    }

    // 2. Create Brand Hierarchy
    // eslint-disable-next-line no-console
    console.log('🏢 Creating brands...');
    const parentBrands = await Promise.all(
      Array.from({ length: Math.floor(SEED_COUNT.BRANDS * 0.3) }, () => {
        return prisma.brand.create({
          data: {
            baseUrl: faker.internet.url(),
            copy: generateBrandContent() as any,
            displayOrder: faker.number.int({ max: 100, min: 0 }),
            name: faker.company.name(),
            slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
            status: randomEnum(ContentStatus),
            type: randomEnum(BrandType),
          },
        });
      }),
    );

    const childBrands = await Promise.all(
      Array.from({ length: SEED_COUNT.BRANDS - parentBrands.length }, () => {
        const parentBrand = pickRandom(parentBrands)[0];
        return prisma.brand.create({
          data: {
            baseUrl: faker.internet.url(),
            copy: generateBrandContent() as any,
            displayOrder: faker.number.int({ max: 100, min: 0 }),
            name: `${parentBrand.name} ${faker.company.buzzNoun()}`,
            parentId: parentBrand.id,
            slug: faker.helpers
              .slugify(`${parentBrand.name} ${faker.company.buzzNoun()}`)
              .toLowerCase(),
            status: randomEnum(ContentStatus),
            type: randomEnum(BrandType),
          },
        });
      }),
    );

    const brands = [...parentBrands, ...childBrands];

    // 3. Create Product Category Hierarchy
    // eslint-disable-next-line no-console
    console.log('📁 Creating product categories...');
    const parentCategories = await Promise.all(
      Array.from({ length: Math.floor(SEED_COUNT.PRODUCT_CATEGORIES * 0.3) }, () => {
        const name = faker.commerce.department();
        return prisma.productCategory.create({
          data: {
            copy: generateCategoryContent() as any,
            displayOrder: faker.number.int({ max: 100, min: 0 }),
            name,
            slug: faker.helpers.slugify(name).toLowerCase(),
            status: randomEnum(ContentStatus),
          },
        });
      }),
    );

    const childCategories = await Promise.all(
      Array.from({ length: SEED_COUNT.PRODUCT_CATEGORIES - parentCategories.length }, () => {
        const parentCategory = pickRandom(parentCategories)[0];
        const name = `${parentCategory.name} - ${faker.commerce.product()}`;
        return prisma.productCategory.create({
          data: {
            copy: generateCategoryContent() as any,
            displayOrder: faker.number.int({ max: 100, min: 0 }),
            name,
            parentId: parentCategory.id,
            slug: faker.helpers.slugify(name).toLowerCase(),
            status: randomEnum(ContentStatus),
          },
        });
      }),
    );

    const categories = [...parentCategories, ...childCategories];

    // 4. Create Taxonomies
    // eslint-disable-next-line no-console
    console.log('🏷️ Creating taxonomies...');
    const taxonomies = await Promise.all(
      Array.from({ length: SEED_COUNT.TAXONOMIES }, () => {
        const name = faker.commerce.productAdjective();
        return prisma.taxonomy.create({
          data: {
            copy: generateTaxonomyContent() as any,
            name,
            slug: faker.helpers.slugify(name).toLowerCase(),
            status: randomEnum(ContentStatus),
            type: randomEnum(TaxonomyType),
          },
        });
      }),
    );

    // 5. Create Collections
    // eslint-disable-next-line no-console
    console.log('📚 Creating collections...');
    const collections = await Promise.all(
      Array.from({ length: SEED_COUNT.COLLECTIONS }, () => {
        const name = `${faker.commerce.productAdjective()} ${faker.commerce.department()}`;
        const randomUser = Math.random() > 0.7 ? pickRandom(users)[0] : null;

        return prisma.collection.create({
          data: {
            // Connect to random brands
            brands: {
              connect: pickRandom(brands, faker.number.int({ max: 5, min: 1 })).map(
                (brand: any) => ({
                  id: brand.id,
                }),
              ),
            },
            // Connect to random categories
            categories: {
              connect: pickRandom(categories, faker.number.int({ max: 3, min: 0 })).map(
                (category: any) => ({ id: category.id }),
              ),
            },
            copy: generateCollectionContent() as any,
            name,
            slug: faker.helpers.slugify(name).toLowerCase(),
            status: randomEnum(ContentStatus),
            // Connect to random taxonomies
            taxonomies: {
              connect: pickRandom(taxonomies, faker.number.int({ max: 3, min: 0 })).map(
                (taxonomy: any) => ({ id: taxonomy.id }),
              ),
            },
            type: randomEnum(CollectionType),
            userId: randomUser?.id,
          },
        });
      }),
    );

    // 6. Create Products (enhanced with e-commerce fields)
    // eslint-disable-next-line no-console
    console.log('🛍️ Creating products...');

    // Get existing products to enhance them
    const existingProducts = await prisma.product.findMany();

    // Update existing products with e-commerce fields
    for (const product of existingProducts) {
      await prisma.product.update({
        data: {
          brand: product.brand ?? faker.company.name(),
          copy: (product.copy ?? generateProductContent()) as any,
          currency: product.currency ?? 'USD',
          price: product.price ?? parseFloat(faker.commerce.price()),
          type: product.type ?? randomEnum(ProductType),
        },
        where: { id: product.id },
      });
    }

    // Create additional products
    const additionalProductCount = Math.max(0, SEED_COUNT.PRODUCTS - existingProducts.length);
    const parentProducts = await Promise.all(
      Array.from({ length: Math.floor(additionalProductCount * 0.2) }, async () => {
        const name = faker.commerce.productName();
        const sku = faker.string.alphanumeric(8).toUpperCase();
        const randomCategories = pickRandom(categories, faker.number.int({ max: 3, min: 1 }));
        const randomTaxonomies = pickRandom(taxonomies, faker.number.int({ max: 5, min: 0 }));
        const randomCollections = pickRandom(collections, faker.number.int({ max: 3, min: 0 }));

        const isAiGenerated = Math.random() > 0.8; // 20% AI generated

        return prisma.product.create({
          data: {
            aiConfidence: isAiGenerated
              ? faker.number.float({ fractionDigits: 2, max: 0.99, min: 0.7 })
              : undefined,
            aiGenerated: isAiGenerated,
            aiSources: isAiGenerated
              ? Array.from({ length: faker.number.int({ max: 3, min: 1 }) }, () =>
                  faker.internet.url(),
                )
              : [],
            brand: faker.company.name(),
            categories: {
              connect: randomCategories.map((category: any) => ({ id: category.id })),
            },
            category: randomCategories[0].name,
            collections: {
              connect: randomCollections.map((collection: any) => ({ id: collection.id })),
            },
            copy: generateProductContent() as any,
            createdBy: pickRandom(users)[0].id,
            currency: 'USD',

            name,
            slug: faker.helpers.slugify(name).toLowerCase(),
            price: parseFloat(faker.commerce.price()),
            sku,
            status: randomEnum(ProductStatus),
            taxonomies: {
              connect: randomTaxonomies.map((taxonomy: any) => ({ id: taxonomy.id })),
            },
            type: randomEnum(ProductType),
          },
        });
      }),
    );

    const childProducts = await Promise.all(
      Array.from({ length: additionalProductCount - parentProducts.length }, async () => {
        const parentProduct = parentProducts.length > 0 ? pickRandom(parentProducts)[0] : null;
        const baseName = parentProduct ? parentProduct.name : faker.commerce.productName();
        const name = `${baseName} ${faker.commerce.productAdjective()}`;
        const sku = faker.string.alphanumeric(8).toUpperCase();
        const randomCategories = pickRandom(categories, faker.number.int({ max: 3, min: 1 }));
        const randomTaxonomies = pickRandom(taxonomies, faker.number.int({ max: 5, min: 0 }));
        const randomCollections = pickRandom(collections, faker.number.int({ max: 3, min: 0 }));

        const isAiGenerated = Math.random() > 0.8; // 20% AI generated

        return prisma.product.create({
          data: {
            aiConfidence: isAiGenerated
              ? faker.number.float({ fractionDigits: 2, max: 0.99, min: 0.7 })
              : undefined,
            aiGenerated: isAiGenerated,
            aiSources: isAiGenerated
              ? Array.from({ length: faker.number.int({ max: 3, min: 1 }) }, () =>
                  faker.internet.url(),
                )
              : [],
            brand: faker.company.name(),
            categories: {
              connect: randomCategories.map((category: any) => ({ id: category.id })),
            },
            category: randomCategories[0].name,
            collections: {
              connect: randomCollections.map((collection: any) => ({ id: collection.id })),
            },
            copy: generateProductContent() as any,
            createdBy: pickRandom(users)[0].id,
            currency: 'USD',

            name,
            slug: faker.helpers.slugify(name).toLowerCase(),
            price: parseFloat(faker.commerce.price()),
            sku,
            status: randomEnum(ProductStatus),
            taxonomies: {
              connect: randomTaxonomies.map((taxonomy: any) => ({ id: taxonomy.id })),
            },
            type: randomEnum(ProductType),
          },
        });
      }),
    );

    const allProducts = await prisma.product.findMany();
    const products = [...existingProducts, ...parentProducts, ...childProducts];

    // 7. Create PdpJoin (Product-Brand relationships)
    // eslint-disable-next-line no-console
    console.log('🔗 Creating product-brand relationships...');
    for (const product of allProducts) {
      const existingPdpJoin = await prisma.pdpJoin.findFirst({
        where: { productId: product.id },
      });

      if (!existingPdpJoin) {
        const randomBrand = pickRandom(brands)[0];
        await prisma.pdpJoin.create({
          data: {
            brandId: randomBrand.id,
            productId: product.id,
            canonicalUrl: faker.internet.url(),
            copy: {} as any,
          },
        });
      }
    }

    // 8. Create Articles
    // eslint-disable-next-line no-console
    console.log('📝 Creating articles...');
    const articles = await Promise.all(
      Array.from({ length: SEED_COUNT.ARTICLES }, () => {
        const title = faker.lorem.sentence();
        const randomUser = Math.random() > 0.3 ? pickRandom(users)[0] : null;

        return prisma.article.create({
          data: {
            content: generateArticleContent() as any,
            slug: faker.helpers.slugify(title).toLowerCase(),
            status: randomEnum(ContentStatus),
            title,
            userId: randomUser?.id,
          },
        });
      }),
    );

    // 9. Create Reviews
    // eslint-disable-next-line no-console
    console.log('⭐ Creating reviews...');
    const reviews = await Promise.all(
      Array.from({ length: SEED_COUNT.REVIEWS }, () => {
        const randomUser = pickRandom(users)[0];
        const randomProduct = pickRandom(allProducts)[0];
        const isVerified = Math.random() > 0.7;
        const isImported = Math.random() > 0.8;

        return prisma.review.create({
          data: {
            content: faker.lorem.paragraphs(),
            helpfulCount: faker.number.int({ max: 50, min: 0 }),
            productId: randomProduct.id,
            rating: faker.number.int({ max: 5, min: 1 }),
            source: isImported
              ? randomEnum({ AMAZON: 'Amazon', GOOGLE: 'Google', YELP: 'Yelp' })
              : null,
            sourceId: isImported ? faker.string.uuid() : null,
            status: randomEnum(ContentStatus),
            title: Math.random() > 0.3 ? faker.lorem.sentence() : null,
            totalVotes: faker.number.int({ max: 100, min: 0 }),
            type: isImported ? ReviewType.IMPORTED : ReviewType.DEDICATED,
            userId: randomUser.id,
            verified: isVerified,
          },
        });
      }),
    );

    // 10. Create ReviewVoteJoin
    // eslint-disable-next-line no-console
    console.log('👍 Creating review votes...');
    for (const review of reviews.slice(0, 50)) {
      // Limit to first 50 reviews to avoid too many votes
      // Create between 0 and 10 votes for each review
      const voteCount = faker.number.int({ max: 10, min: 0 });
      const randomUsers = pickRandom(users, Math.min(voteCount, users.length));

      for (const user of randomUsers) {
        try {
          await prisma.reviewVoteJoin.create({
            data: {
              reviewId: review.id,
              userId: user.id,
              voteType: randomEnum(VoteType),
            },
          });
        } catch (error) {
          // Skip duplicate votes
        }
      }
    }

    // 11. Create Registries
    // eslint-disable-next-line no-console
    console.log('🎁 Creating registries...');
    const registries = await Promise.all(
      Array.from({ length: SEED_COUNT.REGISTRIES }, () => {
        const randomUser = pickRandom(users)[0];
        const isPublic = Math.random() > 0.3;
        const hasEventDate = Math.random() > 0.5;

        return prisma.registry.create({
          data: {
            createdByUserId: randomUser.id,
            description: Math.random() > 0.3 ? faker.lorem.sentence() : null,
            eventDate: hasEventDate ? faker.date.future() : null,
            isPublic,
            title: faker.lorem.words({ max: 5, min: 2 }),
            type: randomEnum(RegistryType),
          },
        });
      }),
    );

    // 12. Create RegistryUserJoin
    // eslint-disable-next-line no-console
    console.log('👥 Creating registry user relationships...');
    for (const registry of registries) {
      // Always add the creator as an OWNER
      await prisma.registryUserJoin.create({
        data: {
          registryId: registry.id,
          role: RegistryUserRole.OWNER,
          userId: registry.createdByUserId!,
        },
      });

      // Add 0-3 additional users with different roles
      const additionalUserCount = faker.number.int({ max: 3, min: 0 });
      const additionalUsers = pickRandom(
        users.filter((user: any) => user.id !== registry.createdByUserId),
        Math.min(additionalUserCount, users.length - 1),
      );

      for (const user of additionalUsers) {
        await prisma.registryUserJoin.create({
          data: {
            registryId: registry.id,
            role: randomEnum(RegistryUserRole),
            userId: user.id,
          },
        });
      }
    }

    // 13. Create RegistryItems
    // eslint-disable-next-line no-console
    console.log('📋 Creating registry items...');
    const registryItems: any[] = [];
    for (const registry of registries) {
      // Add 1-10 items to each registry
      const itemCount = faker.number.int({ max: 10, min: 1 });

      for (let i = 0; i < itemCount; i++) {
        const isProduct = Math.random() > 0.2; // 80% chance of being a product, 20% a collection
        const item = isProduct ? pickRandom(allProducts)[0] : pickRandom(collections)[0];

        try {
          const registryItem = await prisma.registryItem.create({
            data: {
              collectionId: !isProduct ? item.id : null,
              notes: Math.random() > 0.7 ? faker.lorem.sentence() : null,
              priority: faker.number.int({ max: 10, min: 0 }),
              productId: isProduct ? item.id : null,
              purchased: Math.random() > 0.7,
              quantity: faker.number.int({ max: 5, min: 1 }),
              registryId: registry.id,
            },
          });
          registryItems.push(registryItem);
        } catch (error) {
          // Skip if we have a unique constraint violation (same product/collection in registry)
        }
      }
    }

    // 14. Create RegistryPurchaseJoin
    // eslint-disable-next-line no-console
    console.log('💰 Creating registry purchases...');
    for (const registryItem of registryItems.slice(0, 30)) {
      // Limit to first 30 items
      if (Math.random() > 0.7) {
        // 30% chance of being purchased
        const purchaser = pickRandom(users)[0];
        const isGift = Math.random() > 0.5;

        await prisma.registryPurchaseJoin.create({
          data: {
            actualDelivery: Math.random() > 0.3 ? faker.date.past() : null,
            currency: randomEnum({ EUR: 'EUR', GBP: 'GBP', USD: 'USD' }),
            estimatedDelivery: Math.random() > 0.5 ? faker.date.future() : null,
            giftMessage: isGift && Math.random() > 0.5 ? faker.lorem.sentence() : null,
            giftWrapped: isGift && Math.random() > 0.5,
            isGift,
            notes: Math.random() > 0.8 ? faker.lorem.sentence() : null,
            notifiedDate: Math.random() > 0.5 ? faker.date.past() : null,
            notifiedOwner: Math.random() > 0.5,
            orderNumber: faker.string.alphanumeric(8).toUpperCase(),
            price: parseFloat(faker.commerce.price()),
            purchaseDate: faker.date.past(),
            purchaserId: purchaser.id,
            quantity: faker.number.int({ max: registryItem.quantity, min: 1 }),
            registryItemId: registryItem.id,
            status: randomEnum(PurchaseStatus),
            thankYouMessage: Math.random() > 0.7 ? faker.lorem.paragraph() : null,
            thankYouSent: Math.random() > 0.7,
            thankYouSentAt: Math.random() > 0.7 ? faker.date.past() : null,
            trackingNumber:
              Math.random() > 0.5 ? faker.string.alphanumeric(12).toUpperCase() : null,
            trackingUrl: Math.random() > 0.5 ? faker.internet.url() : null,
            transactionId: faker.string.uuid(),
          },
        });
      }
    }

    // 15. Create FavoriteJoin
    // eslint-disable-next-line no-console
    console.log('❤️ Creating user favorites...');
    for (const user of users.slice(0, 20)) {
      // Limit to first 20 users
      // Each user has 0-10 favorites
      const favoriteCount = faker.number.int({ max: 10, min: 0 });

      for (let i = 0; i < favoriteCount; i++) {
        const isProduct = Math.random() > 0.2; // 80% chance of being a product, 20% a collection
        const item = isProduct ? pickRandom(allProducts)[0] : pickRandom(collections)[0];

        try {
          await prisma.favoriteJoin.create({
            data: {
              collectionId: !isProduct ? item.id : null,
              productId: isProduct ? item.id : null,
              userId: user.id,
            },
          });
        } catch (error) {
          // Skip if we have a unique constraint violation (same product/collection favorited)
        }
      }
    }

    // 16. Create Media
    // eslint-disable-next-line no-console
    console.log('🖼️ Creating media assets...');

    // Create media for products (limit to first 30 products)
    for (const product of allProducts.slice(0, 30)) {
      const mediaCount = faker.number.int({ max: 3, min: 1 });
      for (let i = 0; i < mediaCount; i++) {
        await prisma.media.create({
          data: {
            altText: `${product.name} image ${i + 1}`,
            height: faker.number.int({ max: 1080, min: 600 }),
            mimeType: 'image/jpeg',
            productId: product.id,
            size: faker.number.int({ max: 5000000, min: 50000 }),
            type: MediaType.IMAGE,
            url: faker.image.url(),
            userId: Math.random() > 0.7 ? pickRandom(users)[0].id : null,
            width: faker.number.int({ max: 1920, min: 800 }),
            copy: {} as any,
          },
        });
      }
    }

    // Create media for brands (limit to first 10)
    for (const brand of brands.slice(0, 10)) {
      if (Math.random() > 0.5) {
        // 50% chance of having media
        await prisma.media.create({
          data: {
            altText: `${brand.name} logo`,
            brandId: brand.id,
            height: faker.number.int({ max: 800, min: 200 }),
            mimeType: 'image/png',
            size: faker.number.int({ max: 1000000, min: 10000 }),
            type: MediaType.IMAGE,
            url: faker.image.url(),
            userId: Math.random() > 0.7 ? pickRandom(users)[0].id : null,
            width: faker.number.int({ max: 800, min: 200 }),
            copy: {} as any,
          },
        });
      }
    }

    // Create media for collections
    for (const collection of collections) {
      if (Math.random() > 0.3) {
        // 70% chance of having media
        await prisma.media.create({
          data: {
            altText: `${collection.name} banner`,
            collectionId: collection.id,
            height: faker.number.int({ max: 800, min: 400 }),
            mimeType: 'image/jpeg',
            size: faker.number.int({ max: 3000000, min: 100000 }),
            type: MediaType.IMAGE,
            url: faker.image.url(),
            userId: Math.random() > 0.7 ? pickRandom(users)[0].id : null,
            width: faker.number.int({ max: 2400, min: 1200 }),
            copy: {} as any,
          },
        });
      }
    }

    // Create media for articles (limit to first 10)
    for (const article of articles.slice(0, 10)) {
      const mediaCount = faker.number.int({ max: 2, min: 0 });
      for (let i = 0; i < mediaCount; i++) {
        await prisma.media.create({
          data: {
            altText: `Image for article: ${article.title}`,
            articleId: article.id,
            height: faker.number.int({ max: 1200, min: 600 }),
            mimeType: 'image/jpeg',
            size: faker.number.int({ max: 2000000, min: 50000 }),
            type: MediaType.IMAGE,
            url: faker.image.url(),
            userId: article.userId ?? null,
            width: faker.number.int({ max: 1600, min: 800 }),
            copy: {} as any,
          },
        });
      }
    }

    // Add soft delete to some records
    // eslint-disable-next-line no-console
    console.log('🗑️ Adding soft delete to some records...');

    // Soft delete some products
    for (const product of allProducts) {
      if (Math.random() > 0.95) {
        // 5% chance of being soft deleted
        const deletedByUser = pickRandom(users)[0];
        await prisma.product.update({
          data: {
            deletedAt: faker.date.past(),
            deletedById: deletedByUser.id,
          },
          where: { id: product.id },
        });
      }
    }

    // Soft delete some articles
    for (const article of articles) {
      if (Math.random() > 0.95) {
        // 5% chance of being soft deleted
        const deletedByUser = pickRandom(users)[0];
        await prisma.article.update({
          data: {
            deletedAt: faker.date.past(),
            deletedById: deletedByUser.id,
          },
          where: { id: article.id },
        });
      }
    }

    // 17. Scan history section removed - productBarcode table doesn't exist

    // 18. Create some API keys for power users
    // eslint-disable-next-line no-console
    console.log('🔑 Creating API keys for power users...');
    const apiKeys: any[] = [];
    const powerUsers = users.slice(0, 5); // First 5 users get API keys

    for (const user of powerUsers) {
      if (Math.random() > 0.3) {
        // 70% chance of having API key
        const key = `sk_${faker.string.alphanumeric(32)}`;
        const apiKey = await prisma.apiKey.create({
          data: {
            createdAt: faker.date.past(),
            enabled: Math.random() > 0.1, // 90% enabled
            expiresAt: Math.random() > 0.7 ? faker.date.future() : null,
            id: crypto.randomUUID(),
            key: key,
            keyHash: faker.string.alphanumeric(64), // In real app, this would be hashed
            lastUsedAt: Math.random() > 0.5 ? faker.date.past() : null,
            metadata: {
              environment: randomEnum({
                DEVELOPMENT: 'development',
                PRODUCTION: 'production',
                STAGING: 'staging',
              }),
              version: '1.0.0',
            },
            name: `${user.name}'s API Key`,
            organizationId: defaultOrg.id,
            permissions: JSON.stringify(['read:products', 'write:products', 'read:orders']),
            prefix: key.substring(0, 7),
            rateLimitEnabled: true,
            rateLimitMax: faker.number.int({ max: 1000, min: 100 }),
            rateLimitTimeWindow: 3600, // 1 hour
            requestCount: faker.number.int({ max: 500, min: 0 }),
            start: key.substring(0, 8),
            updatedAt: new Date(),
            userId: user.id,
          },
        });
        apiKeys.push(apiKey);
      }
    }

    // 19. Create some invitations
    // eslint-disable-next-line no-console
    console.log('📨 Creating organization invitations...');
    const invitations: any[] = [];
    for (let i = 0; i < 10; i++) {
      const inviter = pickRandom(
        members.filter((m: any) => m.role === 'owner' || m.role === 'admin'),
      )[0];
      const team = Math.random() > 0.5 ? pickRandom(teams)[0] : null;

      const invitation = await prisma.invitation.create({
        data: {
          createdAt: faker.date.past(),
          email: faker.internet.email().toLowerCase(),
          expiresAt: faker.date.future(),
          id: crypto.randomUUID(),
          invitedById: inviter.userId,
          organizationId: defaultOrg.id,
          role: randomEnum({ ADMIN: 'admin', MEMBER: 'member' }),
          status: randomEnum({
            ACCEPTED: 'accepted',
            EXPIRED: 'expired',
            PENDING: 'pending',
            REJECTED: 'rejected',
          }),
          teamId: team?.id,
        },
      });
      invitations.push(invitation);
    }

    // eslint-disable-next-line no-console
    console.log('✅ E-commerce database seeding completed successfully!');
    // eslint-disable-next-line no-console
    console.log(`Created:
      - Updated ${users.length} users with e-commerce fields
      - ${members.length} organization members
      - ${teams.length} teams with members
      - ${brands.length} brands
      - ${categories.length} product categories
      - ${taxonomies.length} taxonomies
      - ${collections.length} collections
      - ${parentProducts.length + childProducts.length} new products with digital assets
      - ${articles.length} articles
      - ${reviews.length} reviews
      - ${registries.length} registries
      - ${registryItems.length} registry items
      - ${apiKeys.length} API keys
      - ${invitations.length} invitations
      - Media items for products, brands, collections, and articles
    `);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('❌ Error seeding e-commerce data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seed function if called directly
if (require.main === module) {
  seedEcommerce().catch((error: any) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
}

export { seedEcommerce };
