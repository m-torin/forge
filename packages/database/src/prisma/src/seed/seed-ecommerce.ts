import {
  BrandType,
  ContentStatus,
  MediaType,
  OrderStatus,
  PaymentStatus,
  type Prisma,
  PrismaClient,
  ProductType,
  RegistryType,
  RegistryUserRole,
  TransactionStatus,
  TransactionType,
  VoteType,
} from '../../../../prisma-generated/client';
import {
  webappBlogPosts,
  webappCart,
  webappCollections,
  webappGroupCollections,
  webappNavigation,
  webappOrders,
  webappProducts,
  webappReviews,
} from './data/webapp-data';
import {
  createBrandFromVendor,
  createRetailerBrand,
  RETAILER_BRANDS,
} from './mappers/brand-mapper';
import { extractCartItems, mapWebappCartToPrisma } from './mappers/cart-mapper';
import { extractCollectionMedia, mapWebappCollectionToPrisma } from './mappers/collection-mapper';
import {
  createCast,
  createFandom,
  createSeries,
  createStory,
  SEED_CAST,
  SEED_FANDOMS,
  SEED_SERIES,
  SEED_STORIES,
} from './mappers/entertainment-mapper';
import {
  createGroupCollectionHierarchy,
  mapWebappGroupCollectionToPrisma,
} from './mappers/group-collection-mapper';
import {
  createInventoryRecord,
  generateInventoryHistory,
  generateStockLevels,
} from './mappers/inventory-mapper';
import { createLocation, SEED_LOCATIONS } from './mappers/location-mapper';
import {
  extractOrderAddress,
  extractOrderItems,
  mapWebappOrderToPrisma,
} from './mappers/order-mapper';
import {
  createPdpJoin,
  generateProductRetailerDistribution,
  shouldIncludeBrandDirectSale,
} from './mappers/pdp-join-mapper';
import { generatePdpUrls } from './mappers/pdp-url-mapper';
import { generateProductIdentifiers } from './mappers/product-identifiers-mapper';
import { mapWebappReviewToPrisma } from './mappers/review-mapper';
import { getAllTaxonomies, getStatusTaxonomy } from './mappers/taxonomy-mapper';

const prisma = new PrismaClient();

// Configuration
const SEED_COUNT = {
  USERS: 25, // Increased to have more diverse customers for orders, registries, etc.
  REGISTRIES: 8, // Increased for better distribution
  VOTES: 50, // For review votes
};

// Helper function to generate realistic article content
function generateArticleContent(blogPost: any): Prisma.JsonValue {
  return {
    title: blogPost.title,
    excerpt: blogPost.excerpt,
    readingTime: parseInt(blogPost.timeToRead) || 3,
    blocks: [
      {
        type: 'paragraph',
        content: blogPost.excerpt,
      },
      {
        type: 'image',
        url: blogPost.featuredImage.src,
        caption: blogPost.featuredImage.alt,
      },
      {
        type: 'paragraph',
        content:
          'Fashion is constantly evolving, and staying on top of the latest trends is essential for anyone who wants to make a statement with their style.',
      },
      {
        type: 'paragraph',
        content:
          'In this guide, we explore the key elements that define modern fashion and how you can incorporate them into your wardrobe.',
      },
    ],
    metadata: {
      author: blogPost.author.name,
      publishedAt: blogPost.datetime,
      tags: ['fashion', 'style', 'trends', blogPost.category.title.toLowerCase()],
      readTime: blogPost.timeToRead,
      category: blogPost.category.title,
      featuredImage: blogPost.featuredImage.src,
    },
  };
}

async function seedUsers() {
  console.log('👤 Seeding users...');

  // Create specific users for reviews (with last name "Seed")
  const reviewAuthors = [
    { original: 'S. Walkinshaw', name: 'S. Walkinshaw Seed' },
    { original: 'Risako M', name: 'Risako M Seed' },
    { original: 'Eden Birch', name: 'Eden Birch Seed' },
    { original: 'Jonathan Edwards', name: 'Jonathan Edwards Seed' },
  ];

  for (const author of reviewAuthors) {
    const email = `${author.original.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email,
          name: author.name,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Created user: ${author.name}`);
    }
  }

  // Create additional demo users (with last name "Seed")
  const customerNames = [
    'Emma',
    'Liam',
    'Olivia',
    'Noah',
    'Ava',
    'Ethan',
    'Sophia',
    'Mason',
    'Isabella',
    'William',
    'Mia',
    'James',
    'Charlotte',
    'Benjamin',
    'Amelia',
    'Lucas',
    'Harper',
    'Henry',
    'Evelyn',
    'Alexander',
    'Abigail',
  ];

  for (let i = 1; i <= SEED_COUNT.USERS - reviewAuthors.length; i++) {
    const email = `customer${i}@example.com`;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      const firstName = customerNames[(i - 1) % customerNames.length];
      await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email,
          name: `${firstName} Seed`,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log(`✅ Seeded ${SEED_COUNT.USERS} users`);
}

async function seedBrands() {
  console.log('🏢 Seeding brands...');

  const uniqueVendors = [...new Set(webappProducts.map(p => p.vendor))];

  for (const vendor of uniqueVendors) {
    const existingBrand = await prisma.brand.findUnique({
      where: { slug: vendor.toLowerCase().replace(/\s+/g, '-') },
    });

    if (!existingBrand) {
      const brandData = createBrandFromVendor(vendor);
      await prisma.brand.create({ data: brandData });
      console.log(`✅ Created brand: ${vendor}`);
    }
  }

  console.log(`✅ Seeded ${uniqueVendors.length} manufacturer brands`);
}

async function seedRetailers() {
  console.log('🛒 Seeding retailer/marketplace brands...');

  for (const retailerConfig of RETAILER_BRANDS) {
    const existingBrand = await prisma.brand.findUnique({
      where: { slug: retailerConfig.slug },
    });

    if (!existingBrand) {
      const brandData = createRetailerBrand(retailerConfig);
      await prisma.brand.create({ data: brandData });
      console.log(`✅ Created ${retailerConfig.type} brand: ${retailerConfig.name}`);
    }
  }

  console.log(`✅ Seeded ${RETAILER_BRANDS.length} retailer/marketplace brands`);
}

async function seedCollections() {
  console.log('📦 Seeding collections...');

  for (const collection of webappCollections) {
    const existingCollection = await prisma.collection.findUnique({
      where: { slug: collection.handle },
    });

    if (!existingCollection) {
      const collectionData = mapWebappCollectionToPrisma(collection);
      const created = await prisma.collection.create({ data: collectionData });

      // Add media if available
      const mediaData = extractCollectionMedia(collection, created.id);
      if (mediaData) {
        await prisma.media.create({ data: mediaData });
      }

      console.log(`✅ Created collection: ${collection.title}`);
    }
  }

  console.log(`✅ Seeded ${webappCollections.length} collections`);
}

async function seedProductCategories() {
  console.log('🏷️ Seeding product categories...');

  const categories = webappNavigation.categories;

  for (const category of categories) {
    const slug = category.handle.split('/').pop() || category.handle;
    const existingCategory = await prisma.productCategory.findUnique({
      where: { slug },
    });

    if (!existingCategory) {
      await prisma.productCategory.create({
        data: {
          name: category.name,
          slug,
          status: ContentStatus.PUBLISHED,
          copy: {
            description: category.description,
          },
        },
      });
      console.log(`✅ Created category: ${category.name}`);
    }
  }

  console.log(`✅ Seeded ${categories.length} product categories`);
}

async function seedTaxonomies() {
  console.log('🏷️ Seeding taxonomies...');

  // Get all taxonomies from mapper (status, color, size)
  const taxonomies = getAllTaxonomies();

  for (const taxonomy of taxonomies) {
    const existing = await prisma.taxonomy.findUnique({
      where: { slug: taxonomy.slug },
    });

    if (!existing) {
      await prisma.taxonomy.create({
        data: taxonomy,
      });
      console.log(`✅ Created ${taxonomy.type} taxonomy: ${taxonomy.name}`);
    }
  }

  console.log(`✅ Seeded ${taxonomies.length} taxonomies`);
}

async function linkProductsToTaxonomies() {
  console.log('🔗 Linking products to taxonomies...');

  const products = await prisma.product.findMany({
    where: { type: ProductType.PHYSICAL },
  });

  const allTaxonomies = await prisma.taxonomy.findMany();
  const taxonomyMap = new Map(allTaxonomies.map(t => [t.slug, t]));

  // Link status taxonomies
  for (const webappProduct of webappProducts) {
    const product = products.find(p => p.slug === webappProduct.handle);
    if (!product) continue;

    const statusSlug = getStatusTaxonomy(webappProduct.status);
    if (statusSlug && taxonomyMap.has(statusSlug)) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          taxonomies: {
            connect: { id: taxonomyMap.get(statusSlug)?.id || '' },
          },
        },
      });
    }
  }

  // Link color taxonomies based on product options
  for (const product of products) {
    // Extract colors from product attributes or name
    const colorKeywords = ['black', 'white', 'red', 'blue', 'green', 'brown', 'navy', 'gray'];
    const productText = `${product.name} ${JSON.stringify(product.attributes)}`.toLowerCase();

    for (const color of colorKeywords) {
      if (productText.includes(color)) {
        const colorTaxonomy = taxonomyMap.get(`color-${color}`);
        if (colorTaxonomy) {
          try {
            await prisma.product.update({
              where: { id: product.id },
              data: {
                taxonomies: {
                  connect: { id: colorTaxonomy.id },
                },
              },
            });
          } catch (_error) {
            // Ignore if already connected
          }
        }
      }
    }
  }

  console.log('✅ Linked products to taxonomies');
}

async function seedArticles() {
  console.log('📝 Seeding articles...');

  const users = await prisma.user.findMany({ take: 3 });

  for (const post of webappBlogPosts) {
    const existingArticle = await prisma.article.findUnique({
      where: { slug: post.handle },
    });

    if (!existingArticle) {
      const author = users.find(u => u.name === post.author.name) || users[0];

      const article = await prisma.article.create({
        data: {
          title: post.title,
          slug: post.handle,
          content: generateArticleContent(post) as Prisma.InputJsonValue,
          status: ContentStatus.PUBLISHED,
          userId: author?.id || users[0].id,
        },
      });

      // Add featured image as media
      await prisma.media.create({
        data: {
          url: post.featuredImage.src,
          altText: post.featuredImage.alt,
          type: MediaType.IMAGE,
          articleId: article.id,
          copy: {},
        },
      });

      console.log(`✅ Created article: ${post.title}`);
    }
  }

  console.log(`✅ Seeded ${webappBlogPosts.length} articles`);
}

async function seedReviews() {
  console.log('⭐ Seeding reviews...');

  const products = await prisma.product.findMany({
    where: { type: ProductType.PHYSICAL },
    take: 4, // We have 4 reviews in the data
  });

  for (let i = 0; i < webappReviews.length && i < products.length; i++) {
    const review = webappReviews[i];
    const product = products[i];

    // Find the user by name
    const authorEmail = `${review.author.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const user = await prisma.user.findUnique({ where: { email: authorEmail } });

    if (!user) {
      console.log(`⚠️  Skipping review - user not found: ${review.author}`);
      continue;
    }

    const reviewData = mapWebappReviewToPrisma(review, product.id, user.id);
    const created = await prisma.review.create({ data: reviewData });

    console.log(`✅ Created review: "${review.title}" for ${product.name}`);

    // Add some votes to make reviews look authentic
    const allVoters = await prisma.user.findMany({
      where: { email: { contains: 'customer' } },
      take: 15,
    });
    const numVoters = Math.floor(Math.random() * 5) + 2; // 2-6 voters per review
    const shuffledVoters = allVoters.sort(() => 0.5 - Math.random()).slice(0, numVoters);

    let helpfulCount = 0;
    let totalVotes = 0;

    for (const voter of shuffledVoters) {
      const isHelpful = Math.random() > 0.3;
      await prisma.reviewVoteJoin.create({
        data: {
          voteType: isHelpful ? VoteType.HELPFUL : VoteType.NOT_HELPFUL,
          userId: voter.id,
          reviewId: created.id,
        },
      });

      if (isHelpful) helpfulCount++;
      totalVotes++;
    }

    // Update review with vote counts
    await prisma.review.update({
      where: { id: created.id },
      data: {
        helpfulCount,
        totalVotes,
      },
    });

    console.log(`   ✅ Added ${totalVotes} votes (${helpfulCount} helpful)`);
  }

  console.log(`✅ Seeded ${webappReviews.length} reviews`);
}

async function seedRegistries() {
  console.log('🎁 Seeding registries...');

  // Get different sets of users for registry owners and buyers
  const allUsers = await prisma.user.findMany({
    where: { email: { contains: 'customer' } },
    take: 20,
  });
  const registryOwners = allUsers.slice(0, SEED_COUNT.REGISTRIES);
  const potentialBuyers = allUsers.slice(SEED_COUNT.REGISTRIES); // Different users as buyers

  const registryTypes = [
    {
      type: RegistryType.WEDDING,
      title: 'Wedding Registry',
      description: 'Help us celebrate our special day!',
    },
    {
      type: RegistryType.BABY,
      title: 'Baby Registry',
      description: 'Welcome our little bundle of joy!',
    },
    {
      type: RegistryType.BIRTHDAY,
      title: 'Birthday Registry',
      description: 'Make my birthday extra special!',
    },
    {
      type: RegistryType.HOLIDAY,
      title: 'Holiday Registry',
      description: 'Holiday wishes and dreams!',
    },
  ];

  for (let i = 0; i < registryOwners.length && i < SEED_COUNT.REGISTRIES; i++) {
    const user = registryOwners[i];
    const registryTypeInfo = registryTypes[i % registryTypes.length];

    const registry = await prisma.registry.create({
      data: {
        title: `${user.name}'s ${registryTypeInfo.title}`,
        description: registryTypeInfo.description,
        type: registryTypeInfo.type,
        eventDate: new Date(Date.now() + (30 + i * 15) * 24 * 60 * 60 * 1000), // Varied dates
        isPublic: true,
        createdByUserId: user.id,
      },
    });

    // Add user to registry as owner
    await prisma.registryUserJoin.create({
      data: {
        registryId: registry.id,
        userId: user.id,
        role: RegistryUserRole.OWNER,
      },
    });

    // Add some products to registry
    const products = await prisma.product.findMany({
      where: { type: ProductType.PHYSICAL },
      skip: i * 2, // Different products for each registry
      take: 4,
    });

    for (const product of products) {
      const registryItem = await prisma.registryItem.create({
        data: {
          registryId: registry.id,
          productId: product.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          priority: Math.floor(Math.random() * 3) + 1,
          notes: 'Would love this in any color!',
          purchased: Math.random() > 0.7, // 30% chance already purchased
        },
      });

      // If purchased, create a purchase record with a different user
      if (registryItem.purchased && potentialBuyers.length > 0) {
        const buyer = potentialBuyers[Math.floor(Math.random() * potentialBuyers.length)];
        await prisma.registryPurchaseJoin.create({
          data: {
            registryItemId: registryItem.id,
            purchaserId: buyer.id,
            quantity: registryItem.quantity,
            purchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within last 30 days
          },
        });
        console.log(`   ✅ ${buyer.name} purchased ${product.name} for ${user.name}'s registry`);
      }
    }

    console.log(`✅ Created registry: ${registry.title}`);
  }

  console.log(`✅ Seeded ${SEED_COUNT.REGISTRIES} registries with buyers`);
}

async function seedOrders() {
  console.log('📦 Seeding orders...');

  // Get users to assign orders to
  const users = await prisma.user.findMany({
    where: { email: { contains: 'customer' } },
    take: 10, // Get more users for order distribution
  });

  if (users.length < 2) {
    console.log('⚠️  Not enough customer users found for orders. Creating additional users...');
    return;
  }

  // Create a map of product handles to product IDs for order items
  const products = await prisma.product.findMany({
    where: { type: ProductType.PHYSICAL },
    select: { id: true, slug: true },
  });
  const productMap = new Map(products.map(p => [p.slug, p.id]));

  for (let i = 0; i < webappOrders.length; i++) {
    const webappOrder = webappOrders[i];
    const user = users[i % users.length]; // Cycle through available users

    // Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: webappOrder.number },
    });

    if (existingOrder) {
      console.log(`ℹ️  Order ${webappOrder.number} already exists`);
      continue;
    }

    try {
      // Create address for this order
      const addressData = extractOrderAddress(webappOrder, user.id);
      const address = await prisma.address.create({ data: addressData });

      // Create the order
      const orderData = mapWebappOrderToPrisma(webappOrder, user.id, address.id);
      const order = await prisma.order.create({ data: orderData });

      console.log(`✅ Created order: ${order.orderNumber} for ${user.name}`);

      // Create order items
      const orderItems = extractOrderItems(webappOrder, order.id, productMap);
      for (const itemData of orderItems) {
        await prisma.orderItem.create({ data: itemData });
      }

      console.log(`   ✅ Created ${orderItems.length} order items`);

      // Create transaction for paid orders
      if (order.paymentStatus === PaymentStatus.PAID) {
        const paymentMethods = [
          { method: 'Visa', last4: '4242' },
          { method: 'Mastercard', last4: '5555' },
          { method: 'Amex', last4: '3782' },
          { method: 'Discover', last4: '6011' },
        ];
        const selectedPayment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        await prisma.transaction.create({
          data: {
            orderId: order.id,
            type: TransactionType.PAYMENT,
            status: TransactionStatus.SUCCESS,
            amount: order.total,
            currency: order.currency,
            gateway: 'stripe',
            gatewayId: `pi_${Math.random().toString(36).substring(2, 15)}`,
            paymentMethod: selectedPayment.method,
            last4: selectedPayment.last4,
            processedAt: new Date(webappOrder.date),
            gatewayResponse: {
              status: 'succeeded',
              risk_level: 'normal',
              outcome: {
                network_status: 'approved_by_network',
                risk_score: 32,
                type: 'authorized',
              },
            },
          },
        });

        console.log(`   ✅ Created payment transaction`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to create order ${webappOrder.number}:`, error.message);
    }
  }

  console.log(`✅ Seeded ${webappOrders.length} orders`);

  // Create some refund transactions for delivered orders
  await seedRefundTransactions();
}

async function seedRefundTransactions() {
  console.log('💸 Creating refund transactions...');

  // Get some delivered orders that have payment transactions
  const deliveredOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      transactions: {
        some: {
          type: TransactionType.PAYMENT,
          status: TransactionStatus.SUCCESS,
        },
      },
    },
    take: 3, // Create refunds for 3 orders
    include: {
      transactions: {
        where: {
          type: TransactionType.PAYMENT,
          status: TransactionStatus.SUCCESS,
        },
      },
    },
  });

  for (const order of deliveredOrders) {
    const paymentTransaction = order.transactions[0];
    if (!paymentTransaction) continue;

    // Create a full refund for the first order, partial refunds for others
    const isFullRefund = deliveredOrders.indexOf(order) === 0;
    const totalAsNumber = parseFloat(order.total.toString());
    const refundAmount = isFullRefund
      ? totalAsNumber
      : parseFloat((totalAsNumber * 0.3).toFixed(2)); // 30% refund

    await prisma.transaction.create({
      data: {
        orderId: order.id,
        type: isFullRefund ? TransactionType.REFUND : TransactionType.PARTIAL_REFUND,
        status: TransactionStatus.SUCCESS,
        amount: refundAmount,
        currency: order.currency,
        gateway: 'stripe',
        gatewayId: `re_${Math.random().toString(36).substring(2, 15)}`,
        parentTransactionId: paymentTransaction.id,
        paymentMethod: paymentTransaction.paymentMethod,
        last4: paymentTransaction.last4,
        processedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last 7 days
        gatewayResponse: {
          status: 'succeeded',
          reason: isFullRefund ? 'requested_by_customer' : 'defective_product',
          receipt_url: `https://stripe.com/receipts/${Math.random().toString(36).substring(2, 15)}`,
        },
      },
    });

    // Update order payment status if full refund
    if (isFullRefund) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.REFUNDED,
          metadata: {
            ...(order.metadata && typeof order.metadata === 'object' ? order.metadata : {}),
            refundReason: 'Customer requested refund',
            refundedAt: new Date().toISOString(),
          },
        },
      });
    }

    console.log(
      `✅ Created ${isFullRefund ? 'full' : 'partial'} refund for order ${order.orderNumber}`,
    );
  }

  console.log('✅ Created refund transactions');
}

async function seedCarts() {
  console.log('🛒 Seeding carts...');

  // Get several customers for multiple carts
  const allCustomers = await prisma.user.findMany({
    where: { email: { contains: 'customer' } },
    take: 15,
  });

  if (allCustomers.length === 0) {
    console.log('⚠️  No customer users found for carts');
    return;
  }

  // Create a map of product handles to product IDs
  const products = await prisma.product.findMany({
    where: { type: ProductType.PHYSICAL },
    select: { id: true, slug: true },
  });
  const productMap = new Map(products.map(p => [p.slug, p.id]));

  // Create 3-5 different carts with different users
  const numCarts = Math.min(5, allCustomers.length);
  const shuffledCustomers = allCustomers.sort(() => 0.5 - Math.random());

  for (let i = 0; i < numCarts; i++) {
    const user = shuffledCustomers[i];

    // Check if user already has a cart
    const existingCart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (existingCart) {
      console.log(`ℹ️  User ${user.name} already has a cart`);
      continue;
    }

    try {
      // Create cart (for the first one use the webapp cart data, others get random items)
      const cartData =
        i === 0
          ? mapWebappCartToPrisma(webappCart, user.id)
          : {
              status: 'ACTIVE' as const,
              currency: 'USD',
              notes: `${user.name}'s shopping cart`,
              user: { connect: { id: user.id } },
            };

      const cart = await prisma.cart.create({ data: cartData });
      console.log(`✅ Created cart for ${user.name}`);

      // Create cart items
      if (i === 0) {
        // Use webapp cart items for first cart
        const cartItems = extractCartItems(webappCart, cart.id, productMap);
        for (const itemData of cartItems) {
          await prisma.cartItem.create({ data: itemData });
        }
        console.log(`   ✅ Created ${cartItems.length} cart items from webapp data`);
      } else {
        // Create random cart items for other carts
        const randomProducts = products
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 4) + 1);
        for (const product of randomProducts) {
          await prisma.cartItem.create({
            data: {
              quantity: Math.floor(Math.random() * 3) + 1,
              price: Math.floor(Math.random() * 200) + 20, // Random price between $20-220
              cart: { connect: { id: cart.id } },
              product: { connect: { id: product.id } },
            },
          });
        }
        console.log(`   ✅ Created ${randomProducts.length} random cart items`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to create cart for ${user.name}:`, error.message);
    }
  }

  console.log(`✅ Seeded ${numCarts} carts`);
}

async function seedGroupCollections() {
  console.log('👥 Seeding group collections...');

  // Get existing collections to link to groups
  const existingCollections = await prisma.collection.findMany({
    where: { parentId: null }, // Don't include child collections
  });

  for (const groupCollection of webappGroupCollections) {
    // Check if group collection already exists
    const existingGroup = await prisma.collection.findUnique({
      where: { slug: groupCollection.handle },
    });

    if (existingGroup) {
      console.log(`ℹ️  Group collection ${groupCollection.title} already exists`);
      continue;
    }

    try {
      // Create the group collection
      const groupData = mapWebappGroupCollectionToPrisma(groupCollection);
      const group = await prisma.collection.create({ data: groupData });

      console.log(`✅ Created group collection: ${group.name}`);

      // Create relationships between group and child collections
      const relationships = createGroupCollectionHierarchy(
        groupCollection,
        group.id,
        existingCollections,
      );

      // Update child collections to point to parent
      for (const relationship of relationships) {
        await prisma.collection.update({
          where: { id: relationship.collectionId },
          data: { parentId: relationship.parentCollectionId },
        });
      }

      console.log(`   ✅ Linked ${relationships.length} child collections`);
    } catch (error: any) {
      console.error(
        `❌ Failed to create group collection ${groupCollection.title}:`,
        error.message,
      );
    }
  }

  console.log(`✅ Seeded ${webappGroupCollections.length} group collections`);
}

async function linkProductsToCategories() {
  console.log('🔗 Linking products to categories...');

  const categories = await prisma.productCategory.findMany();
  const products = await prisma.product.findMany({ where: { type: ProductType.PHYSICAL } });

  // Map products to categories based on keywords
  const categoryMappings = [
    {
      categorySlug: 'clothing',
      keywords: ['dress', 'shirt', 'jacket', 'coat', 'blazer', 'sweater', 'skirt'],
    },
    { categorySlug: 'accessories', keywords: ['bag', 'tote', 'belt', 'scarf', 'hat'] },
    { categorySlug: 'shoes', keywords: ['shoe', 'sneaker', 'boot', 'sandal'] },
    { categorySlug: 'jewelry', keywords: ['necklace', 'bracelet', 'ring', 'earring'] },
  ];

  for (const mapping of categoryMappings) {
    const category = categories.find(c => c.slug === mapping.categorySlug);
    if (!category) continue;

    const matchingProducts = products.filter(p =>
      mapping.keywords.some(keyword => p.name.toLowerCase().includes(keyword)),
    );

    for (const product of matchingProducts) {
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            categories: {
              connect: { id: category.id },
            },
          },
        });
      } catch (_error) {
        // Ignore if already connected
      }
    }

    if (matchingProducts.length > 0) {
      console.log(`✅ Linked ${matchingProducts.length} products to ${category.name} category`);
    }
  }
}

async function linkProductsToCollections() {
  console.log('🔗 Linking products to collections...');

  const collections = await prisma.collection.findMany();
  const products = await prisma.product.findMany({ where: { type: ProductType.PHYSICAL } });

  // Enhanced mapping with specific product assignments
  const productCollectionMap: Record<string, string[]> = {
    'leather-tote-bag': ['bags', 'accessories', 'explore-new-arrivals'],
    'silk-midi-dress': ['sale-collection', 'explore-new-arrivals'],
    'denim-jacket': ['jackets', 'explore-new-arrivals'],
    'cashmere-sweater': ['explore-new-arrivals'],
    'linen-blazer': ['jackets'],
    'velvet-skirt': ['sale-collection'],
    'wool-trench-coat': ['coats', 'jackets'],
    'cotton-shirt': ['t-shirts'],
  };

  // Also do keyword-based mapping for any products not explicitly mapped
  const keywordMappings = [
    { collectionSlug: 'jackets', keywords: ['jacket', 'blazer'] },
    { collectionSlug: 't-shirts', keywords: ['shirt', 'tee', 't-shirt'] },
    { collectionSlug: 'jeans', keywords: ['jean', 'denim'] },
    { collectionSlug: 'coats', keywords: ['coat', 'trench'] },
    { collectionSlug: 'accessories', keywords: ['bag', 'tote', 'belt', 'scarf'] },
    { collectionSlug: 'bags', keywords: ['bag', 'tote', 'clutch'] },
  ];

  // Process explicit mappings first
  for (const [productSlug, collectionSlugs] of Object.entries(productCollectionMap)) {
    const product = products.find(p => p.slug === productSlug);
    if (!product) continue;

    for (const collectionSlug of collectionSlugs) {
      const collection = collections.find(c => c.slug === collectionSlug);
      if (!collection) continue;

      try {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            collections: {
              connect: { id: collection.id },
            },
          },
        });
        console.log(`✅ Linked ${product.name} to ${collection.name}`);
      } catch (_error) {
        // Ignore if already connected
      }
    }
  }

  // Process keyword mappings for any remaining products
  for (const mapping of keywordMappings) {
    const collection = collections.find(c => c.slug === mapping.collectionSlug);
    if (!collection) continue;

    const matchingProducts = products.filter(p => {
      // Skip if already explicitly mapped
      if (productCollectionMap[p.slug]) return false;
      return mapping.keywords.some(keyword => p.name.toLowerCase().includes(keyword));
    });

    for (const product of matchingProducts) {
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            collections: {
              connect: { id: collection.id },
            },
          },
        });
      } catch (_error) {
        // Ignore if already connected
      }
    }

    if (matchingProducts.length > 0) {
      console.log(`✅ Linked ${matchingProducts.length} additional products to ${collection.name}`);
    }
  }
}

async function seedPdpJoins() {
  console.log('🔗 Seeding PdpJoins (product-retailer relationships)...');

  // Get all products and retailer brands
  const products = await prisma.product.findMany({
    where: { type: ProductType.PHYSICAL },
    select: { id: true, slug: true, brand: true },
  });

  const retailerBrands = await prisma.brand.findMany({
    where: {
      OR: [{ type: BrandType.RETAILER }, { type: BrandType.MARKETPLACE }],
    },
  });

  const manufacturerBrands = await prisma.brand.findMany({
    where: { type: BrandType.LABEL },
  });

  // Create a map for quick lookup
  const retailerMap = new Map(retailerBrands.map(b => [b.slug, b]));
  const manufacturerMap = new Map(manufacturerBrands.map(b => [b.slug, b.id]));

  // Generate distribution strategy
  const productSlugs = products.map(p => p.slug);
  const distribution = generateProductRetailerDistribution(productSlugs);

  let totalCreated = 0;

  for (const dist of distribution) {
    const product = products.find(p => p.slug === dist.productSlug);
    if (!product) continue;

    // Create PdpJoin entries for each retailer
    for (const retailerSlug of dist.retailers) {
      const retailer = retailerMap.get(retailerSlug);
      if (!retailer) continue;

      // Check if PdpJoin already exists
      const existingJoin = await prisma.pdpJoin.findUnique({
        where: {
          productId_brandId: {
            productId: product.id,
            brandId: retailer.id,
          },
        },
      });

      if (!existingJoin) {
        const pdpJoinData = createPdpJoin({
          productId: product.id,
          brandId: retailer.id,
          productSlug: product.slug,
          retailerSlug: retailer.slug,
          baseUrl: retailer.baseUrl || `https://www.${retailer.slug}.com`,
        });

        const created = await prisma.pdpJoin.create({ data: pdpJoinData });

        // If product has a manufacturer brand, link it
        if (product.brand) {
          const brandSlug = product.brand.toLowerCase().replace(/\s+/g, '-');
          const manufacturerId = manufacturerMap.get(brandSlug);

          if (manufacturerId) {
            await prisma.pdpJoin.update({
              where: { id: created.id },
              data: {
                manufacturerBrands: {
                  connect: { id: manufacturerId },
                },
              },
            });
          }
        }

        totalCreated++;
        console.log(`✅ Created PdpJoin: ${product.slug} at ${retailer.name}`);
      }
    }

    // Check if brand sells directly
    if (product.brand) {
      const brandSlug = product.brand.toLowerCase().replace(/\s+/g, '-');
      if (shouldIncludeBrandDirectSale(brandSlug)) {
        const brand = manufacturerBrands.find(b => b.slug === brandSlug);
        if (brand) {
          const existingDirectJoin = await prisma.pdpJoin.findUnique({
            where: {
              productId_brandId: {
                productId: product.id,
                brandId: brand.id,
              },
            },
          });

          if (!existingDirectJoin) {
            const directSaleData = createPdpJoin({
              productId: product.id,
              brandId: brand.id,
              productSlug: product.slug,
              retailerSlug: brand.slug,
              baseUrl: brand.baseUrl || `https://www.${brand.slug}.com`,
            });

            await prisma.pdpJoin.create({ data: directSaleData });
            totalCreated++;
            console.log(`✅ Created direct sale PdpJoin: ${product.slug} at ${brand.name}.com`);
          }
        }
      }
    }
  }

  console.log(`✅ Seeded ${totalCreated} PdpJoin entries`);
}

async function seedFavorites() {
  console.log('❤️ Seeding user favorites...');

  // Get users and items to favorite
  const users = await prisma.user.findMany({
    where: { email: { contains: 'customer' } },
    take: 15,
  });

  const products = await prisma.product.findMany({
    where: { type: ProductType.PHYSICAL },
    take: 20,
  });

  const collections = await prisma.collection.findMany({
    take: 10,
  });

  let totalCreated = 0;

  // Each user favorites 2-5 products and 1-2 collections
  for (const user of users) {
    // Favorite products
    const numProductFavorites = Math.floor(Math.random() * 4) + 2; // 2-5 products
    const shuffledProducts = products.sort(() => 0.5 - Math.random());
    const favoriteProducts = shuffledProducts.slice(0, numProductFavorites);

    for (const product of favoriteProducts) {
      const existingFavorite = await prisma.favoriteJoin.findFirst({
        where: {
          userId: user.id,
          productId: product.id,
          collectionId: null,
        },
      });

      if (!existingFavorite) {
        await prisma.favoriteJoin.create({
          data: {
            userId: user.id,
            productId: product.id,
          },
        });
        totalCreated++;
      }
    }

    // Favorite collections
    const numCollectionFavorites = Math.floor(Math.random() * 2) + 1; // 1-2 collections
    const shuffledCollections = collections.sort(() => 0.5 - Math.random());
    const favoriteCollections = shuffledCollections.slice(0, numCollectionFavorites);

    for (const collection of favoriteCollections) {
      const existingFavorite = await prisma.favoriteJoin.findFirst({
        where: {
          userId: user.id,
          productId: null,
          collectionId: collection.id,
        },
      });

      if (!existingFavorite) {
        await prisma.favoriteJoin.create({
          data: {
            userId: user.id,
            collectionId: collection.id,
          },
        });
        totalCreated++;
      }
    }
  }

  console.log(`✅ Seeded ${totalCreated} user favorites`);
}

async function seedLocations() {
  console.log('📍 Seeding locations...');

  for (const location of SEED_LOCATIONS) {
    const existingLocation = await prisma.location.findUnique({
      where: { slug: location.slug },
    });

    if (!existingLocation) {
      const locationData = createLocation(location);
      await prisma.location.create({ data: locationData });
      console.log(`✅ Created location: ${location.name}`);
    }
  }

  console.log(`✅ Seeded ${SEED_LOCATIONS.length} locations`);
}

async function seedProductIdentifiers() {
  console.log('🏷️ Seeding product identifiers...');

  // Get all products to generate identifiers
  const products = await prisma.product.findMany({
    where: { type: ProductType.PHYSICAL },
  });

  let totalCreated = 0;

  for (const product of products) {
    // Check if identifiers already exist
    const existingIdentifiers = await prisma.productIdentifiers.findFirst({
      where: { productId: product.id },
    });

    if (!existingIdentifiers && product.brand) {
      const identifierData = generateProductIdentifiers({
        productId: product.id,
        productName: product.name,
        brandName: product.brand,
        category: product.category || 'General',
      });

      await prisma.productIdentifiers.create({ data: identifierData });
      totalCreated++;
      console.log(`✅ Created identifiers for: ${product.name}`);
    }
  }

  console.log(`✅ Seeded ${totalCreated} product identifiers`);
}

async function seedInventory() {
  console.log('📦 Seeding inventory...');

  // Create warehouse locations first
  const warehouseLocations = [
    { id: 'wh-east', name: 'East Coast Warehouse' },
    { id: 'wh-west', name: 'West Coast Warehouse' },
    { id: 'wh-central', name: 'Central Distribution Center' },
  ];

  // Get all products and variants
  const products = await prisma.product.findMany({
    where: { type: ProductType.PHYSICAL },
  });

  const variants = await prisma.product.findMany({
    where: { type: ProductType.VARIANT },
  });

  let inventoryCount = 0;
  let transactionCount = 0;

  // Create inventory for each product/variant at each location
  for (const location of warehouseLocations) {
    // Products
    for (const product of products) {
      const attributes = product.attributes as { statusLabel?: string } | null;
      const stockLevels = generateStockLevels(attributes?.statusLabel || 'standard');

      const inventoryData = createInventoryRecord({
        productId: product.id,
        locationId: location.id,
        locationName: location.name,
        ...stockLevels,
      });

      const inventory = await prisma.inventory.create({ data: inventoryData });
      inventoryCount++;

      // Generate historical transactions
      const transactions = generateInventoryHistory(inventory.id);
      if (transactions.length > 0) {
        await prisma.inventoryTransaction.createMany({ data: transactions });
        transactionCount += transactions.length;
      }
    }

    // Variants (only at main warehouse)
    if (location.id === 'wh-central') {
      for (const variant of variants.slice(0, 20)) {
        // Limit to first 20 variants
        const stockLevels = generateStockLevels('standard');

        const inventoryData = createInventoryRecord({
          variantId: variant.id,
          locationId: location.id,
          locationName: location.name,
          ...stockLevels,
        });

        await prisma.inventory.create({ data: inventoryData });
        inventoryCount++;
      }
    }
  }

  console.log(
    `✅ Seeded ${inventoryCount} inventory records with ${transactionCount} transactions`,
  );
}

async function seedPdpUrls() {
  console.log('🔗 Seeding PDP URLs...');

  // Get all PdpJoin entries with their related data
  const pdpJoins = await prisma.pdpJoin.findMany({
    include: {
      product: true,
      brand: true,
    },
    take: 100, // Limit for performance
  });

  let totalCreated = 0;

  for (const pdpJoin of pdpJoins) {
    if (!pdpJoin.brand.baseUrl) continue;

    const urls = generatePdpUrls({
      pdpJoinId: pdpJoin.id,
      productSlug: pdpJoin.product.slug,
      retailerSlug: pdpJoin.brand.slug,
      baseUrl: pdpJoin.brand.baseUrl,
    });

    if (urls.length > 0) {
      await prisma.pdpUrl.createMany({ data: urls });
      totalCreated += urls.length;
    }
  }

  console.log(`✅ Seeded ${totalCreated} PDP URLs`);
}

async function seedEntertainment() {
  console.log('🎬 Seeding entertainment data...');

  // 1. Seed Fandoms
  console.log('  📚 Creating fandoms...');
  const fandomMap = new Map<string, string>();

  for (const fandom of SEED_FANDOMS) {
    const existingFandom = await prisma.fandom.findUnique({
      where: { slug: fandom.slug },
    });

    if (!existingFandom) {
      const fandomData = createFandom(fandom);
      const created = await prisma.fandom.create({ data: fandomData });
      fandomMap.set(fandom.slug, created.id);
      console.log(`  ✅ Created fandom: ${fandom.name}`);
    } else {
      fandomMap.set(fandom.slug, existingFandom.id);
    }
  }

  // 2. Seed Series
  console.log('  📺 Creating series...');
  const seriesMap = new Map<string, string>();

  for (const series of SEED_SERIES) {
    const existingSeries = await prisma.series.findUnique({
      where: { slug: series.slug },
    });

    if (!existingSeries) {
      const fandomId =
        series.fandomSlug && fandomMap.has(series.fandomSlug)
          ? (fandomMap.get(series.fandomSlug) ?? '')
          : '';
      const seriesData = createSeries(series, fandomId);

      const created = await prisma.series.create({ data: seriesData });
      seriesMap.set(series.slug, created.id);
      console.log(`  ✅ Created series: ${series.name}`);
    } else {
      seriesMap.set(series.slug, existingSeries.id);
    }
  }

  // 3. Seed Cast
  console.log('  🎭 Creating cast members...');
  const castMap = new Map<string, string>();

  for (const cast of SEED_CAST) {
    const existingCast = await prisma.cast.findUnique({
      where: { slug: cast.slug },
    });

    if (!existingCast) {
      const castData = createCast(cast);
      const created = await prisma.cast.create({ data: castData });
      castMap.set(cast.slug, created.id);

      // Note: Cast is connected to series through products, not directly
      // For direct series-cast relationships, need to create a junction table

      console.log(`  ✅ Created cast member: ${cast.name}`);
    }
  }

  // 4. Seed Stories
  console.log('  📖 Creating stories...');

  for (const story of SEED_STORIES) {
    const existingStory = await prisma.story.findUnique({
      where: { slug: story.slug },
    });

    if (!existingStory) {
      const fandomId =
        story.fandomSlug && fandomMap.has(story.fandomSlug)
          ? (fandomMap.get(story.fandomSlug) ?? '')
          : '';
      const storyData = createStory(story, fandomId);

      // Connect to series
      if (story.seriesSlug && seriesMap.has(story.seriesSlug)) {
        storyData.series = {
          connect: { id: seriesMap.get(story.seriesSlug) },
        };
      }

      await prisma.story.create({ data: storyData });
      console.log(`  ✅ Created story: ${story.title}`);
    }
  }

  console.log('✅ Seeded entertainment data');
}

export async function seedEcommerce() {
  try {
    console.log('🌱 Starting webapp e-commerce seed...\n');

    // 1. Foundation data (no dependencies)
    await seedUsers();
    await seedBrands();
    await seedRetailers(); // New: Create retailer/marketplace brands
    await seedCollections();
    await seedProductCategories();
    await seedTaxonomies();

    // 2. Link products to relationships (Products already exist from seedProducts())
    await linkProductsToCategories();
    await linkProductsToCollections();

    // 3. Content that depends on users but not other relationships
    await seedArticles();

    // 4. Create group collections (depends on existing collections)
    await seedGroupCollections();

    // 5. Data that depends on both users and products
    await seedReviews();
    await seedRegistries();
    await seedOrders();
    await seedCarts();

    // 6. Create PdpJoin entries (depends on products and brands/retailers)
    await seedPdpJoins();

    // 7. Create user favorites (depends on users, products, and collections)
    await seedFavorites();

    // 8. Create supporting data
    await seedLocations();
    await seedProductIdentifiers();
    await seedInventory();
    await seedPdpUrls();
    await seedEntertainment();

    // 9. Link products to all taxonomies (colors, sizes, status)
    await linkProductsToTaxonomies();

    // 10. Create additional relationships
    await linkProductsToEntertainment();
    await createAdditionalMedia();

    console.log('\n🎉 Webapp e-commerce seeding completed!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function linkProductsToEntertainment() {
  console.log('🎬 Linking products to entertainment entities...');

  try {
    // Get all fandoms, series, stories, and cast
    const fandoms = await prisma.fandom.findMany();
    const series = await prisma.series.findMany();
    const stories = await prisma.story.findMany();
    const cast = await prisma.cast.findMany();

    // Get a sample of products to link
    const products = await prisma.product.findMany({
      where: {
        type: 'PHYSICAL',
        parentId: null, // Only parent products
      },
      take: 20, // Link first 20 products
    });

    if (products.length === 0) {
      console.log('  ⚠️  No products found to link to entertainment');
      return;
    }

    // Link some products to fandoms
    const fandomProducts = products.slice(0, 5);
    for (let i = 0; i < fandomProducts.length && i < fandoms.length; i++) {
      await prisma.product.update({
        where: { id: fandomProducts[i].id },
        data: {
          fandoms: {
            connect: { id: fandoms[i].id },
          },
        },
      });
      console.log(`  ✅ Linked product "${fandomProducts[i].name}" to fandom "${fandoms[i].name}"`);
    }

    // Link some products to series
    const seriesProducts = products.slice(5, 10);
    for (let i = 0; i < seriesProducts.length && i < series.length; i++) {
      await prisma.product.update({
        where: { id: seriesProducts[i].id },
        data: {
          series: {
            connect: { id: series[i].id },
          },
        },
      });
      console.log(`  ✅ Linked product "${seriesProducts[i].name}" to series "${series[i].name}"`);
    }

    // Link some products to cast members
    const castProducts = products.slice(10, 15);
    for (let i = 0; i < castProducts.length && i < cast.length; i++) {
      await prisma.product.update({
        where: { id: castProducts[i].id },
        data: {
          casts: {
            connect: { id: cast[i].id },
          },
        },
      });
      console.log(`  ✅ Linked product "${castProducts[i].name}" to cast member "${cast[i].name}"`);
    }

    // Link some products to stories
    const storyProducts = products.slice(15, 20);
    for (let i = 0; i < storyProducts.length && i < stories.length; i++) {
      await prisma.product.update({
        where: { id: storyProducts[i].id },
        data: {
          stories: {
            connect: { id: stories[i].id },
          },
        },
      });
      console.log(`  ✅ Linked product "${storyProducts[i].name}" to story "${stories[i].name}"`);
    }

    console.log('✅ Linked products to entertainment entities');
  } catch (error) {
    console.error('❌ Error linking products to entertainment:', error);
    throw error;
  }
}

async function createAdditionalMedia() {
  console.log('📸 Creating additional media for entities...');

  try {
    // Add media for brands
    const brands = await prisma.brand.findMany({
      where: {
        media: {
          none: {},
        },
      },
      take: 10,
    });

    for (const brand of brands) {
      await prisma.media.create({
        data: {
          url: `https://picsum.photos/seed/${brand.slug}/400/400`,
          altText: `${brand.name} logo`,
          type: 'IMAGE',
          width: 400,
          height: 400,
          size: 120000, // ~117KB for logos
          mimeType: 'image/jpeg',
          sortOrder: 0,
          brandId: brand.id,
          copy: {
            caption: `Official logo of ${brand.name}`,
          },
        },
      });
      console.log(`  ✅ Created logo for brand: ${brand.name}`);
    }

    // Add media for taxonomies (color swatches)
    const colorTaxonomies = await prisma.taxonomy.findMany({
      where: {
        type: 'COLOR',
        media: {
          none: {},
        },
      },
    });

    for (const taxonomy of colorTaxonomies) {
      // Generate color swatch based on the name
      const colorMap: Record<string, string> = {
        Red: '#FF0000',
        Blue: '#0000FF',
        Green: '#00FF00',
        Black: '#000000',
        White: '#FFFFFF',
        Yellow: '#FFFF00',
        Purple: '#800080',
        Orange: '#FFA500',
        Pink: '#FFC0CB',
        Gray: '#808080',
      };

      const colorCode = colorMap[taxonomy.name] || '#CCCCCC';

      await prisma.media.create({
        data: {
          url: `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="${colorCode}"/></svg>`).toString('base64')}`,
          altText: `${taxonomy.name} color swatch`,
          type: 'IMAGE',
          width: 50,
          height: 50,
          size: 500, // Small SVG
          mimeType: 'image/svg+xml',
          sortOrder: 0,
          taxonomyId: taxonomy.id,
          copy: {
            color: colorCode,
          },
        },
      });
      console.log(`  ✅ Created color swatch for taxonomy: ${taxonomy.name}`);
    }

    // Add media for categories
    const categories = await prisma.productCategory.findMany({
      where: {
        media: {
          none: {},
        },
      },
      take: 5,
    });

    for (const category of categories) {
      await prisma.media.create({
        data: {
          url: `https://picsum.photos/seed/${category.slug}/800/600`,
          altText: `${category.name} category banner`,
          type: 'IMAGE',
          width: 800,
          height: 600,
          size: 350000, // ~342KB for category banners
          mimeType: 'image/jpeg',
          sortOrder: 0,
          categoryId: category.id,
          copy: {
            caption: `Shop our ${category.name} collection`,
          },
        },
      });
      console.log(`  ✅ Created banner for category: ${category.name}`);
    }

    // Add hero images for some pdpJoins
    const pdpJoins = await prisma.pdpJoin.findMany({
      where: {
        media: {
          none: {},
        },
      },
      take: 10,
      include: {
        product: true,
        brand: true,
      },
    });

    for (const pdpJoin of pdpJoins) {
      await prisma.media.create({
        data: {
          url: `https://picsum.photos/seed/${pdpJoin.id}/1200/800`,
          altText: `${pdpJoin.product.name} from ${pdpJoin.brand.name}`,
          type: 'IMAGE',
          width: 1200,
          height: 800,
          size: 680000, // ~664KB for hero images
          mimeType: 'image/jpeg',
          sortOrder: 0,
          pdpJoinId: pdpJoin.id,
          copy: {
            caption: `${pdpJoin.product.name} - Available at ${pdpJoin.brand.name}`,
          },
        },
      });
      console.log(
        `  ✅ Created hero image for PDP: ${pdpJoin.product.name} at ${pdpJoin.brand.name}`,
      );
    }

    console.log('✅ Created additional media');
  } catch (error) {
    console.error('❌ Error creating additional media:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedEcommerce();
  } catch (error: any) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
