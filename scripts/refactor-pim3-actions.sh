#!/bin/bash

# Script to refactor PIM3 action files to use ORM functions instead of direct prisma access

set -e

# Define the mapping of model names to their ORM function prefixes
declare -A MODEL_MAP=(
  ["address"]="Address"
  ["article"]="Article"
  ["brand"]="Brand"
  ["cart"]="Cart"
  ["cartItem"]="CartItem"
  ["cast"]="Cast"
  ["collection"]="Collection"
  ["fandom"]="Fandom"
  ["favorite"]="Favorite"
  ["inventory"]="Inventory"
  ["inventoryTransaction"]="InventoryTransaction"
  ["location"]="Location"
  ["media"]="Media"
  ["order"]="Order"
  ["orderItem"]="OrderItem"
  ["product"]="Product"
  ["productCategory"]="ProductCategory"
  ["registry"]="Registry"
  ["registryItem"]="RegistryItem"
  ["review"]="Review"
  ["series"]="Series"
  ["story"]="Story"
  ["taxonomy"]="Taxonomy"
  ["user"]="User"
)

# Function to refactor a single file
refactor_file() {
  local file=$1
  local model=$2
  local orm_prefix=$3
  
  echo "Refactoring $file for model: $model (ORM prefix: $orm_prefix)"
  
  # Replace prisma.model or db.model calls with ORM functions
  sed -i '' "s/prisma\.$model\.findMany/findMany${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.findMany/findMany${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.findFirst/findFirst${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.findFirst/findFirst${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.findUnique/findUnique${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.findUnique/findUnique${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.create/create${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.create/create${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.update/update${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.update/update${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.updateMany/updateMany${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.updateMany/updateMany${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.delete/delete${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.delete/delete${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.deleteMany/deleteMany${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.deleteMany/deleteMany${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.count/count${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.count/count${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.groupBy/groupBy${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.groupBy/groupBy${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.aggregate/aggregate${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.aggregate/aggregate${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$model\.upsert/upsert${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$model\.upsert/upsert${orm_prefix}Orm/g" "$file"
  
  # Handle plural forms
  local plural_model="${model}s"
  local es_plural_model="${model}es"
  
  sed -i '' "s/prisma\.$plural_model\.findMany/findMany${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$plural_model\.findMany/findMany${orm_prefix}Orm/g" "$file"
  
  sed -i '' "s/prisma\.$es_plural_model\.findMany/findMany${orm_prefix}Orm/g" "$file"
  sed -i '' "s/db\.$es_plural_model\.findMany/findMany${orm_prefix}Orm/g" "$file"
  
  echo "Completed refactoring $file"
}

# Main execution
BASE_DIR="/Users/torin/repos/new--/forge/apps/backstage/src/actions/pim3"

# Refactor specific files based on their primary model
refactor_file "$BASE_DIR/brands/actions.ts" "brand" "Brand"
refactor_file "$BASE_DIR/collections/actions.ts" "collection" "Collection"
refactor_file "$BASE_DIR/categories/actions.ts" "category" "Category"
refactor_file "$BASE_DIR/taxonomies/actions.ts" "taxonomy" "Taxonomy"
refactor_file "$BASE_DIR/series/actions.ts" "series" "Series"
refactor_file "$BASE_DIR/story/actions.ts" "story" "Story"
refactor_file "$BASE_DIR/locations/actions.ts" "location" "Location"
refactor_file "$BASE_DIR/fandoms/actions.ts" "fandom" "Fandom"
refactor_file "$BASE_DIR/product-categories/actions.ts" "productCategory" "ProductCategory"
refactor_file "$BASE_DIR/media/actions.ts" "media" "Media"
refactor_file "$BASE_DIR/inventory/actions.ts" "inventory" "Inventory"
refactor_file "$BASE_DIR/inventory/actions.ts" "inventoryTransaction" "InventoryTransaction"
refactor_file "$BASE_DIR/carts/actions.ts" "cart" "Cart"
refactor_file "$BASE_DIR/carts/actions.ts" "cartItem" "CartItem"
refactor_file "$BASE_DIR/orders/actions.ts" "order" "Order"
refactor_file "$BASE_DIR/orders/actions.ts" "orderItem" "OrderItem"
refactor_file "$BASE_DIR/reviews/actions.ts" "review" "Review"
refactor_file "$BASE_DIR/favorites/actions.ts" "favorite" "Favorite"
refactor_file "$BASE_DIR/registries/actions.ts" "registry" "Registry"
refactor_file "$BASE_DIR/registries/actions.ts" "registryItem" "RegistryItem"
refactor_file "$BASE_DIR/product-assets/actions.ts" "media" "Media"

# Handle products separately as it uses 'db' instead of 'prisma'
refactor_file "$BASE_DIR/products/actions.ts" "product" "Product"

echo "Refactoring complete!"