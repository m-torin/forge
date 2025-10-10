import { PrismaClient } from '../generated/client/client.js';
import { postgresSearch } from '../src/types.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
        name: 'John Doe',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        name: 'Jane Smith',
      },
    }),
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Johnson',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create posts with search-optimized content
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Getting Started with PostgreSQL and Prisma',
        content:
          'This comprehensive guide covers PostgreSQL setup, Prisma ORM integration, and best practices for modern database development.',
        published: true,
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Advanced Prisma Query Techniques',
        content:
          'Explore advanced Prisma features including relationJoins, fullTextSearch, and driver adapters for optimal performance.',
        published: true,
        authorId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Database Performance Optimization',
        content:
          'Learn how to optimize PostgreSQL queries, implement proper indexing, and use connection pooling for scalable applications.',
        published: false,
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Modern Full-Text Search with PostgreSQL',
        content:
          'Implementing full-text search using PostgreSQL native capabilities, search operators, and Prisma integration.',
        published: true,
        authorId: users[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${posts.length} posts`);

  // Test search functionality (PostgreSQL only)
  try {
    const searchResults = await prisma.post.findMany({
      where: {
        content: {
          search: postgresSearch.and(['postgresql', 'prisma']),
        },
      },
      orderBy: { createdAt: 'desc' }, // postgresSearch.relevance(['title', 'content'], 'postgresql') - requires fullTextSearchPostgres preview
      include: {
        author: true,
      },
    });

    console.log(`🔍 Found ${searchResults.length} posts matching search criteria`);
    searchResults.forEach(post => {
      console.log(`   - "${post.title}" by ${post.author?.name || 'Unknown'}`);
    });
  } catch (error) {
    console.log(
      'ℹ️ Full-text search test skipped (requires PostgreSQL with fullTextSearchPostgres preview)',
    );
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
