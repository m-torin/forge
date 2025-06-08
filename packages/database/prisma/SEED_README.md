# Database Seeding Guide

This guide explains how to seed your database with test data for development and testing.

## Prerequisites

1. **Database Connection**: Ensure your database is running and accessible
2. **Environment Variables**: Set up your `.env.local` file with `DATABASE_URL`
3. **Better Auth**: The backstage app must be running for user creation

## Seeding Process

### Step 1: Create the Default Organization

```bash
# With Doppler
pnpm seed

# Without Doppler (local)
pnpm seed:local
```

This creates the basic structure including a default organization.

### Step 2: Create Users

Users must be created through Better Auth to ensure proper password hashing:

#### Option A: Manual Sign-up (Recommended)

1. Start backstage: `pnpm dev --filter=backstage`
2. Go to http://localhost:3300/sign-up
3. Create an admin account:
   - Email: `admin@example.com`
   - Password: `admin123`
4. Update the user role in the database:
   ```sql
   UPDATE "user" SET role = 'super-admin' WHERE email = 'admin@example.com';
   ```

#### Option B: Automated User Creation

```bash
# Make sure backstage is running first!
pnpm --filter @repo/database create-users
```

This creates:

- Admin user: `admin@example.com` / `admin123`
- Test users: `test1@example.com` through `test5@example.com` / `password123`

### Step 3: Seed Product Data

#### Basic Products Only

```bash
# Creates 5 sample products with barcodes
pnpm --filter @repo/database seed:products
```

#### Full E-commerce Data

```bash
# Creates comprehensive e-commerce data
pnpm --filter @repo/database seed:ecommerce
```

This creates:

- 30 brands (with hierarchy)
- 20 product categories (with hierarchy)
- 25 taxonomies
- 15 collections
- 100 products (with variants)
- 40 articles
- 200 reviews
- 30 registries (wishlists, gift registries)
- User favorites
- Media assets
- And more...

#### All Seeds at Once

```bash
# Runs all seeds in sequence
pnpm --filter @repo/database seed:all
```

## Seed Data Details

### Users

- Enhanced with e-commerce fields:
  - Bio and expertise
  - Author verification status
  - User preferences
  - Suspension details (5% of users)

### Products

- Hierarchical structure (parent/child products)
- Multiple barcodes (UPC-A, EAN-13)
- Rich metadata and attributes
- AI generation flags
- Soft delete support

### Brands

- Hierarchical structure
- Various types (manufacturer, retailer, marketplace)
- Contact and social information
- SEO metadata

### Collections

- Multiple types (seasonal, thematic, featured)
- User-created and system collections
- Display options and SEO metadata

### Reviews

- User-generated and imported reviews
- Helpfulness voting
- Verification status
- Media attachments

### Registries

- Multiple types (wishlist, wedding, baby, gift)
- Public/private visibility
- Purchase tracking
- Thank you note system

## Development Tips

1. **Reset Database**: To start fresh, drop all tables and re-run migrations:

   ```bash
   pnpm migrate reset
   ```

2. **Custom Seed Count**: Edit the `SEED_COUNT` object in `seed-ecommerce.ts` to adjust the number
   of records created

3. **Selective Seeding**: Comment out sections in the seed files to only seed specific data

4. **Performance**: The full e-commerce seed creates thousands of records. On slower systems, reduce
   the counts or seed incrementally.

## Troubleshooting

### "No users found" Error

- Ensure you've created users through Better Auth first
- Check that backstage is running on port 3300

### Unique Constraint Violations

- These are expected for favorites and registry items
- The seed script skips duplicates automatically

### Memory Issues

- Reduce `SEED_COUNT` values
- Run seeds individually instead of `seed:all`

### Connection Errors

- Verify `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Check database permissions

## Data Relationships

The seed creates realistic relationships:

- Products belong to brands, categories, collections, and taxonomies
- Users have favorites, reviews, and registries
- Registries contain products and collections
- Reviews have votes from other users
- Media assets are attached to various entities

This creates a rich, interconnected dataset perfect for testing e-commerce functionality.
