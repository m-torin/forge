# Database Seeding Guide

This guide explains how to seed your database with test data for development and testing.

## Prerequisites

1. **Database Connection**: Ensure your database is running and accessible
2. **Environment Variables**: Set up your `.env.local` file with `DATABASE_URL`
3. **Better Auth**: The backstage app must be running for user creation

## Seeding Process

### Step 1: Create Organizations

```bash
# With Doppler
pnpm seed

# Without Doppler (local)
pnpm seed:local
```

This creates the basic structure including:

- **Default Organization**: `default-org` for general development
- **Test Organization**: `test-org` for API testing and development

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

- **Admin user**: `admin@example.com` / `admin123` (role: `super-admin`)
- **Test user**: `user@example.com` / `user1234` (role: `user`)

Both users are automatically added to the test organization.

### Step 3: Create API Keys

Once users exist, running the seed script again will automatically create test API keys:

```bash
# This will now also create API keys since users exist
pnpm seed:local
```

**Created API Keys:**

1. **Admin API Key**
   - Name: `Test Admin Key`
   - Prefix: `forge_adm_`
   - Permissions: `admin:*`, `api:*`, `users:*`, `organizations:*`
   - Rate limit: 100 requests/minute
   - User: `admin@example.com`

2. **User API Key**
   - Name: `Test User Key`
   - Prefix: `forge_usr_`
   - Permissions: `read:*`, `user:profile`
   - Rate limit: 50 requests/minute
   - User: `user@example.com`

3. **Service API Key**
   - Name: `Test Service Key`
   - Prefix: `forge_svc_`
   - Permissions: `service:*`, `api:*`
   - Rate limit: 1000 requests/minute
   - Service ID: `test-service`

The actual API key values will be displayed in the console when created.

### Step 4: Seed Product Data

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

## API Key Testing

The seeded API keys can be used to test the authentication system:

### Testing with cURL

```bash
# Test admin key
curl -H "Authorization: Bearer YOUR_ADMIN_KEY" \
     -H "Content-Type: application/json" \
     http://localhost:3300/api/admin/users

# Test user key
curl -H "x-api-key: YOUR_USER_KEY" \
     -H "Content-Type: application/json" \
     http://localhost:3300/api/user/profile

# Test service key
curl -H "Authorization: Bearer YOUR_SERVICE_KEY" \
     -H "Content-Type: application/json" \
     http://localhost:3300/api/service/status
```

### Using in Better Auth

The API keys are compatible with better-auth's API key system and can be verified using:

- `auth.api.verifyApiKey()` for validation
- Rate limiting based on the key's settings
- Permission checking against the key's permission array

### Key Rotation

For testing key rotation and lifecycle management:

1. Create new keys via the API
2. Update existing keys' permissions
3. Disable/enable keys
4. Test expiration (set short expiry times)

## Data Relationships

The seed creates realistic relationships:

- **Users**: Belong to organizations with different roles
- **API Keys**: Tied to users and organizations with specific permissions
- **Products**: Belong to brands, categories, collections, and taxonomies
- **Reviews**: Created by users with helpfulness votes
- **Registries**: User-created with products and collections
- **Organizations**: Contain members and API keys for testing

This creates a rich, interconnected dataset perfect for testing e-commerce functionality and API
authentication.
