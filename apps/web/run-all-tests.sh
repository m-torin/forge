#!/bin/bash

echo "🧪 Running all e2e tests with enhanced parallelism (8 workers)"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run tests by category
echo -e "\n${YELLOW}1. Running Core Tests (app, auth, api)${NC}"
pnpm playwright test e2e/app.spec.ts e2e/auth.spec.ts e2e/api.spec.ts --reporter=list

echo -e "\n${YELLOW}2. Running Navigation & UI Tests${NC}"
pnpm playwright test e2e/navigation.spec.ts e2e/theme.spec.ts e2e/responsive.spec.ts --reporter=list

echo -e "\n${YELLOW}3. Running Error Handling Tests${NC}"
pnpm playwright test e2e/error-handling.spec.ts --reporter=list

echo -e "\n${YELLOW}4. Running Internationalization Tests${NC}"
pnpm playwright test e2e/i18n.spec.ts --reporter=list

echo -e "\n${YELLOW}5. Running SEO & Accessibility Tests${NC}"
pnpm playwright test e2e/seo.spec.ts e2e/accessibility.spec.ts --reporter=list

echo -e "\n${YELLOW}6. Running Page-Specific Tests${NC}"
pnpm playwright test e2e/pages/ --reporter=list

echo -e "\n${YELLOW}7. Running Comprehensive Page Tests${NC}"
echo "   - Authentication pages..."
pnpm playwright test e2e/pages/auth-comprehensive.spec.ts --reporter=list
echo "   - Account pages..."
pnpm playwright test e2e/pages/account-comprehensive.spec.ts --reporter=list
echo "   - Product pages..."
pnpm playwright test e2e/pages/products-comprehensive.spec.ts --reporter=list
echo "   - Collection pages..."
pnpm playwright test e2e/pages/collections-comprehensive.spec.ts --reporter=list
echo "   - E-commerce flow..."
pnpm playwright test e2e/pages/ecommerce-flow-comprehensive.spec.ts --reporter=list
echo "   - Content pages..."
pnpm playwright test e2e/pages/content-comprehensive.spec.ts --reporter=list
echo "   - Discovery pages..."
pnpm playwright test e2e/pages/discovery-comprehensive.spec.ts --reporter=list
echo "   - Special pages..."
pnpm playwright test e2e/pages/special-pages-comprehensive.spec.ts --reporter=list

echo -e "\n${GREEN}✅ All test categories completed!${NC}"
echo "================================================"
echo "Check the output above for any failures."