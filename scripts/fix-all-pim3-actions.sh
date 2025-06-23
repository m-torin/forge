#!/bin/bash

# Comprehensive script to refactor ALL PIM3 action files to use ORM functions

set -e

BASE_DIR="/Users/torin/repos/new--/forge/apps/backstage/src/actions/pim3"

# Function to add ORM imports to a file
add_orm_imports() {
  local file=$1
  local imports=$2
  
  # Check if file already has ORM imports
  if grep -q "Orm}" "$file"; then
    echo "File $file already has ORM imports, skipping import addition"
    return
  fi
  
  # Find the line with prisma import and replace it
  if grep -q "import { prisma" "$file"; then
    sed -i '' "/import { prisma/,/from '@repo\/database\/prisma';/c\\
import { type Prisma } from '@repo/database/prisma';\\
import {\\
$imports\\
} from '@repo/database/prisma';" "$file"
  elif grep -q "import { db" "$file"; then
    sed -i '' "/import { db/,/from '@repo\/database\/prisma';/c\\
import { type Prisma } from '@repo/database/prisma';\\
import {\\
$imports\\
} from '@repo/database/prisma';" "$file"
  fi
}

# Function to replace prisma/db calls
replace_prisma_calls() {
  local file=$1
  local model=$2
  local orm_prefix=$3
  
  # Replace all variations
  sed -i '' "s/prisma\.${model}\.findMany/findMany${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.findMany/findMany${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.findFirst/findFirst${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.findFirst/findFirst${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.findUnique/findUnique${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.findUnique/findUnique${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.create/create${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.create/create${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.update/update${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.update/update${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.updateMany/updateMany${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.updateMany/updateMany${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.delete/delete${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.delete/delete${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.deleteMany/deleteMany${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.deleteMany/deleteMany${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.count/count${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.count/count${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.groupBy/groupBy${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.groupBy/groupBy${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.aggregate/aggregate${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.aggregate/aggregate${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.${model}\.upsert/upsert${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.${model}\.upsert/upsert${orm_prefix}Orm/g" "$file"
}

# Process each file
echo "Starting comprehensive PIM3 actions refactoring..."

# Registries
echo "Processing registries/actions.ts..."
add_orm_imports "$BASE_DIR/registries/actions.ts" "  findManyRegistriesOrm,
  countRegistriesOrm,
  createRegistryOrm,
  updateRegistryOrm,
  deleteRegistryOrm,
  findUniqueRegistryOrm,
  updateManyRegistriesOrm,
  findManyRegistryItemsOrm,
  countRegistryItemsOrm,
  createRegistryItemOrm,
  updateRegistryItemOrm,
  deleteRegistryItemOrm,
  findUniqueRegistryItemOrm,
  updateManyRegistryItemsOrm,
  findManyUsersOrm,
  groupByRegistriesOrm"
replace_prisma_calls "$BASE_DIR/registries/actions.ts" "registry" "Registry"
replace_prisma_calls "$BASE_DIR/registries/actions.ts" "registryItem" "RegistryItem"
replace_prisma_calls "$BASE_DIR/registries/actions.ts" "user" "User"

# Taxonomies
echo "Processing taxonomies/actions.ts..."
add_orm_imports "$BASE_DIR/taxonomies/actions.ts" "  findManyTaxonomiesOrm,
  countTaxonomiesOrm,
  createTaxonomyOrm,
  updateTaxonomyOrm,
  deleteTaxonomyOrm,
  findUniqueTaxonomyOrm,
  updateManyTaxonomiesOrm,
  deleteManyTaxonomiesOrm,
  aggregateTaxonomiesOrm"
replace_prisma_calls "$BASE_DIR/taxonomies/actions.ts" "taxonomy" "Taxonomy"

# Inventory
echo "Processing inventory/actions.ts..."
add_orm_imports "$BASE_DIR/inventory/actions.ts" "  findManyInventoryOrm,
  countInventoryOrm,
  createInventoryOrm,
  updateInventoryOrm,
  deleteInventoryOrm,
  findUniqueInventoryOrm,
  updateManyInventoryOrm,
  upsertInventoryOrm,
  findManyInventoryTransactionsOrm,
  countInventoryTransactionsOrm,
  createInventoryTransactionOrm,
  aggregateInventoryOrm,
  aggregateInventoryTransactionsOrm"
replace_prisma_calls "$BASE_DIR/inventory/actions.ts" "inventory" "Inventory"
replace_prisma_calls "$BASE_DIR/inventory/actions.ts" "inventoryTransaction" "InventoryTransaction"

# Reviews
echo "Processing reviews/actions.ts..."
add_orm_imports "$BASE_DIR/reviews/actions.ts" "  findManyReviewsOrm,
  countReviewsOrm,
  createReviewOrm,
  updateReviewOrm,
  deleteReviewOrm,
  findUniqueReviewOrm,
  updateManyReviewsOrm,
  aggregateReviewsOrm,
  groupByReviewsOrm"
replace_prisma_calls "$BASE_DIR/reviews/actions.ts" "review" "Review"

# Media
echo "Processing media/actions.ts..."
add_orm_imports "$BASE_DIR/media/actions.ts" "  findManyMediaOrm,
  countMediaOrm,
  createMediaOrm,
  updateMediaOrm,
  deleteMediaOrm,
  findUniqueMediaOrm,
  updateManyMediaOrm,
  deleteManyMediaOrm,
  groupByMediaOrm"
replace_prisma_calls "$BASE_DIR/media/actions.ts" "media" "Media"

# Carts
echo "Processing carts/actions.ts..."
add_orm_imports "$BASE_DIR/carts/actions.ts" "  findManyCartsOrm,
  countCartsOrm,
  createCartOrm,
  updateCartOrm,
  deleteCartOrm,
  findUniqueCartOrm,
  updateManyCartsOrm,
  findManyCartItemsOrm,
  createCartItemOrm,
  updateCartItemOrm,
  deleteCartItemOrm,
  findUniqueCartItemOrm,
  deleteManyCartItemsOrm"
replace_prisma_calls "$BASE_DIR/carts/actions.ts" "cart" "Cart"
replace_prisma_calls "$BASE_DIR/carts/actions.ts" "cartItem" "CartItem"

# Product Categories
echo "Processing product-categories/actions.ts..."
add_orm_imports "$BASE_DIR/product-categories/actions.ts" "  findManyProductCategoriesOrm,
  countProductCategoriesOrm,
  createProductCategoryOrm,
  updateProductCategoryOrm,
  deleteProductCategoryOrm,
  findUniqueProductCategoryOrm,
  updateManyProductCategoriesOrm"
replace_prisma_calls "$BASE_DIR/product-categories/actions.ts" "productCategory" "ProductCategory"

# Favorites
echo "Processing favorites/actions.ts..."
add_orm_imports "$BASE_DIR/favorites/actions.ts" "  findManyFavoritesOrm,
  countFavoritesOrm,
  createFavoriteOrm,
  deleteFavoriteOrm,
  findFirstFavoriteOrm,
  deleteManyFavoritesOrm,
  groupByFavoritesOrm"
replace_prisma_calls "$BASE_DIR/favorites/actions.ts" "favorite" "Favorite"

# Product Assets
echo "Processing product-assets/actions.ts..."
add_orm_imports "$BASE_DIR/product-assets/actions.ts" "  findManyMediaOrm,
  countMediaOrm,
  createMediaOrm,
  updateMediaOrm,
  deleteMediaOrm,
  findUniqueMediaOrm,
  updateManyMediaOrm,
  deleteManyMediaOrm"
replace_prisma_calls "$BASE_DIR/product-assets/actions.ts" "media" "Media"

# Categories
echo "Processing categories/actions.ts..."
add_orm_imports "$BASE_DIR/categories/actions.ts" "  findManyCategoriesOrm,
  countCategoriesOrm,
  createCategoryOrm,
  updateCategoryOrm,
  deleteCategoryOrm,
  findUniqueCategoryOrm,
  updateManyCategoriesOrm"
replace_prisma_calls "$BASE_DIR/categories/actions.ts" "category" "Category"

# Fandoms
echo "Processing fandoms/actions.ts..."
add_orm_imports "$BASE_DIR/fandoms/actions.ts" "  findManyFandomsOrm,
  countFandomsOrm,
  createFandomOrm,
  updateFandomOrm,
  deleteFandomOrm,
  findUniqueFandomOrm,
  updateManyFandomsOrm"
replace_prisma_calls "$BASE_DIR/fandoms/actions.ts" "fandom" "Fandom"

# Story
echo "Processing story/actions.ts..."
add_orm_imports "$BASE_DIR/story/actions.ts" "  findManyStoryOrm,
  countStoryOrm,
  createStoryOrm,
  updateStoryOrm,
  deleteStoryOrm,
  findUniqueStoryOrm,
  updateManyStoryOrm"
replace_prisma_calls "$BASE_DIR/story/actions.ts" "story" "Story"

# Locations
echo "Processing locations/actions.ts..."
add_orm_imports "$BASE_DIR/locations/actions.ts" "  findManyLocationsOrm,
  countLocationsOrm,
  createLocationOrm,
  updateLocationOrm,
  deleteLocationOrm,
  findUniqueLocationOrm,
  updateManyLocationsOrm"
replace_prisma_calls "$BASE_DIR/locations/actions.ts" "location" "Location"

# Collections
echo "Processing collections/actions.ts..."
add_orm_imports "$BASE_DIR/collections/actions.ts" "  findManyCollectionsOrm,
  countCollectionsOrm,
  createCollectionOrm,
  updateCollectionOrm,
  deleteCollectionOrm,
  findUniqueCollectionOrm"
replace_prisma_calls "$BASE_DIR/collections/actions.ts" "collection" "Collection"

# Brands
echo "Processing brands/actions.ts..."
# Check if it needs any changes
if grep -q "prisma\." "$BASE_DIR/brands/actions.ts"; then
  add_orm_imports "$BASE_DIR/brands/actions.ts" "  updateManyBrandsOrm"
  replace_prisma_calls "$BASE_DIR/brands/actions.ts" "brand" "Brand"
fi

# Orders
echo "Processing orders/actions.ts..."
# Check if it needs ORM imports
if grep -q "getOrdersAction" "$BASE_DIR/orders/actions.ts"; then
  echo "orders/actions.ts already uses server actions, skipping"
fi

# Articles
echo "Processing articles/actions.ts..."
# Check if it uses server actions
if grep -q "getArticlesAction" "$BASE_DIR/articles/actions.ts"; then
  echo "articles/actions.ts already uses server actions, skipping"
fi

# PDP Joins
echo "Processing pdp-joins/actions.ts..."
# Check if it uses server actions
if grep -q "ProductBrandAssociation" "$BASE_DIR/pdp-joins/actions.ts"; then
  echo "pdp-joins/actions.ts already uses server actions, skipping"
fi

echo "Refactoring complete!"
echo "Now checking for any remaining prisma/db usage..."

# Check for any remaining usage
for file in $(find "$BASE_DIR" -name "actions.ts"); do
  count=$(grep -c "prisma\.\|db\." "$file" 2>/dev/null || echo 0)
  if [ "$count" -gt 0 ]; then
    echo "WARNING: $file still has $count prisma/db references"
    grep -n "prisma\.\|db\." "$file" | head -5
  fi
done