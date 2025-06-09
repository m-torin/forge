# Demo Mode

This application supports a **Demo Mode** that allows you to run the app without a database connection by using hardcoded demo data.

## How to Enable Demo Mode

Set the `DEMO_MODE` environment variable to `"true"` in your `.env.local` file:

```env
DEMO_MODE="true"
```

## How It Works

When `DEMO_MODE="true"`:

- **Prisma is never imported** - avoiding any database connection errors
- Database URLs are optional in `.env.local`
- All data fetching functions will skip database queries entirely
- Hardcoded demo data from `@repo/design-system/mantine-ciseco` will be used instead
- Console logs will indicate when demo mode is active
- Perfect for running without PostgreSQL installed

When `DEMO_MODE="false"` or not set:

- Prisma is dynamically imported only when needed
- Data is fetched from the Prisma database first
- If the database is empty or unavailable, it automatically:
  - Switches to demo mode
  - Falls back to hardcoded data
  - Shows a warning in the console
- This is the default production behavior

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Demo Mode?    │ NO  │ Database Query  │ NO  │ Hardcoded Data  │
│  DEMO_MODE=true ├────►│   Has Data?     ├────►│   (Fallback)    │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │ YES                   │ YES
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Hardcoded Data  │     │  Database Data  │
│   (Direct)      │     │   (Transform)   │
└─────────────────┘     └─────────────────┘
```

## Testing Demo Mode

Run the test script to verify demo mode is working:

```bash
cd apps/web
npx tsx src/lib/test-demo-mode.ts
```

## Use Cases

1. **Development without database**: Run the app locally without PostgreSQL setup
2. **Demos and presentations**: Show the app with consistent demo data
3. **Testing**: Run tests with predictable data
4. **Quick prototyping**: Build features without database schema changes

## Available Pages

All pages are accessible through the navigation menu, with a comprehensive sitemap available at `/sitemap` that lists:

- Main pages (Home, About, Contact)
- Shop pages (Collections, Search, Cart, Checkout)
- Account pages (Login, Signup, Account Dashboard)
- Dynamic content (Products, Collections, Blog posts)
- Special pages (Brands, Events, Locations)
- Test & Demo pages

## Console Output

When demo mode is active, you'll see messages like:

```
Demo mode enabled - using hardcoded products
Demo mode enabled - using hardcoded collections
```

## Switching Modes

To switch between modes:

1. **Enable Demo Mode**: Set `DEMO_MODE="true"` in `.env.local`
2. **Disable Demo Mode**: Set `DEMO_MODE="false"` or remove the variable
3. **Restart the Next.js dev server** for changes to take effect

## Example .env.local Configurations

### Demo Mode (no database required):

```env
# Demo Mode - no database needed!
DEMO_MODE="true"

# Better Auth
BETTER_AUTH_SECRET="your-secret-here-min-32-chars-long"
BETTER_AUTH_URL="http://localhost:3200"
BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:3200"

# Public
NEXT_PUBLIC_APP_URL="http://localhost:3200"
```

### Production Mode (database required):

```env
# Demo Mode disabled - database required
DEMO_MODE="false"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/forge"
DIRECT_DATABASE_URL="postgresql://user:password@localhost:5432/forge"

# Better Auth
BETTER_AUTH_SECRET="your-secret-here-min-32-chars-long"
BETTER_AUTH_URL="http://localhost:3200"
BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:3200"

# Public
NEXT_PUBLIC_APP_URL="http://localhost:3200"
```
