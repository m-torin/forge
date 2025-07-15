/*
  Warnings:

  - You are about to drop the column `inviterId` on the `invitation` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `member` table. All the data in the column will be lost.
  - You are about to drop the `Page` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BrandType" AS ENUM ('LABEL', 'RETAILER', 'MARKETPLACE', 'OTHER');

-- CreateEnum
CREATE TYPE "CollectionType" AS ENUM ('SEASONAL', 'THEMATIC', 'PRODUCT_LINE', 'BRAND_LINE', 'PROMOTIONAL', 'CURATED', 'TRENDING', 'FEATURED', 'NEW_ARRIVALS', 'BEST_SELLERS', 'CLEARANCE', 'LIMITED_EDITION', 'COLLABORATION', 'EXCLUSIVE', 'BUNDLE', 'SET', 'OTHER');

-- CreateEnum
CREATE TYPE "TaxonomyType" AS ENUM ('TAG', 'ATTRACTION', 'THING', 'COLOR', 'MATERIAL', 'EVENT', 'ENTERTAINMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'MANUAL', 'SPECIFICATION', 'CERTIFICATE');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('IMPORTED', 'DEDICATED');

-- CreateEnum
CREATE TYPE "RegistryType" AS ENUM ('WISHLIST', 'GIFT', 'WEDDING', 'BABY', 'BIRTHDAY', 'HOLIDAY', 'OTHER');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('HELPFUL', 'NOT_HELPFUL');

-- CreateEnum
CREATE TYPE "RegistryUserRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL', 'SERVICE', 'SUBSCRIPTION', 'BUNDLE', 'VARIANT', 'OTHER');

-- CreateEnum
CREATE TYPE "BarcodeType" AS ENUM ('UPC_A', 'UPC_E', 'EAN_13', 'EAN_8', 'CODE_128', 'CODE_39', 'QR_CODE', 'PDF417', 'AZTEC', 'DATA_MATRIX', 'ITF14', 'CODABAR', 'OTHER');

-- CreateEnum
CREATE TYPE "JrRuleAction" AS ENUM ('match_on', 'reject_on', 'replace');

-- CreateEnum
CREATE TYPE "JrChartMethod" AS ENUM ('sitemap', 'grid');

-- CreateEnum
CREATE TYPE "JrScrapingSource" AS ENUM ('any', 'scraping_bee', 'playwright', 'puppeteer', 'brightdata', 'scraperapi', 'custom');

-- CreateEnum
CREATE TYPE "JrChartRuleFor" AS ENUM ('availability', 'brand', 'canonical_url', 'description', 'description_string', 'json_ld', 'media', 'name', 'offsite_iframe', 'price', 'sku', 'summary');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('destination', 'location', 'lodging', 'place');

-- CreateEnum
CREATE TYPE "LodgingType" AS ENUM ('disney_resort', 'universal_resort', 'onsite_hotel', 'offsite_hotel', 'ship', 'campground', 'other');

-- CreateEnum
CREATE TYPE "PdpUrlType" AS ENUM ('CANONICAL', 'IFRAME', 'LEGACY', 'ALTERNATE');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('SHIPPING', 'BILLING', 'BOTH');

-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'CONVERTED', 'MERGED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PROCESSING', 'FULFILLED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PAYMENT', 'REFUND', 'PARTIAL_REFUND', 'VOID');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('RESTOCK', 'SALE', 'RETURN', 'ADJUSTMENT', 'RESERVATION', 'RELEASE');

-- DropForeignKey
ALTER TABLE "member" DROP CONSTRAINT "member_teamId_fkey";

-- DropIndex
DROP INDEX "member_teamId_idx";

-- AlterTable
ALTER TABLE "apikey" ADD COLUMN     "keyHash" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "invitation" DROP COLUMN "inviterId",
ADD COLUMN     "invitedById" TEXT;

-- AlterTable
ALTER TABLE "member" DROP COLUMN "teamId";

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "team" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "authorSince" TIMESTAMP(3),
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "expertise" TEXT[],
ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerifiedAuthor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "suspensionDetails" JSONB;

-- DropTable
DROP TABLE "Page";

-- CreateTable
CREATE TABLE "team_member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twofactor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "secretHash" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twofactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backupcode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "twoFactorId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backupcode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkey" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    "transports" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "brand" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'USD',
    "type" "ProductType" NOT NULL DEFAULT 'PHYSICAL',
    "variantPrice" DECIMAL(10,2),
    "compareAtPrice" DECIMAL(10,2),
    "physicalProperties" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "copy" JSONB NOT NULL,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiConfidence" DOUBLE PRECISION,
    "aiSources" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdpJoin" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "iframeUrl" TEXT,
    "tempMediaUrls" TEXT,
    "lastScanned" DATE,
    "copy" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PdpJoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdp_urls" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pdpJoinId" TEXT NOT NULL,
    "urlType" "PdpUrlType" NOT NULL DEFAULT 'LEGACY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "copy" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdp_urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_identifiers" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "pdpJoinId" TEXT,
    "collectionId" TEXT,
    "brandId" TEXT,
    "mpn" TEXT,
    "upcA" TEXT,
    "ean13" TEXT,
    "gs1128" TEXT,
    "upcE" TEXT,
    "ean8" TEXT,
    "isbn10" TEXT,
    "isbn13" TEXT,
    "asin" TEXT,
    "tcin" TEXT,
    "dpci" TEXT,
    "themoviedbId" TEXT,
    "hardcoverappId" TEXT,
    "itf14" TEXT,
    "customBarcode" TEXT,
    "customBarcodeType" TEXT,
    "primaryIdentifierField" TEXT,
    "source" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "confidence" JSONB DEFAULT '{}',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_identifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "BrandType" NOT NULL DEFAULT 'OTHER',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "baseUrl" TEXT,
    "copy" JSONB NOT NULL,
    "parentId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cast" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isFictional" BOOLEAN NOT NULL DEFAULT true,
    "copy" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "Cast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "CollectionType" NOT NULL DEFAULT 'OTHER',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT,
    "copy" JSONB NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fandom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isFictional" BOOLEAN NOT NULL DEFAULT true,
    "copy" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "Fandom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locationType" "LocationType" NOT NULL DEFAULT 'place',
    "lodgingType" "LodgingType",
    "isFictional" BOOLEAN NOT NULL DEFAULT true,
    "copy" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "mimeType" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "copy" JSONB NOT NULL,
    "articleId" TEXT,
    "brandId" TEXT,
    "collectionId" TEXT,
    "productId" TEXT,
    "taxonomyId" TEXT,
    "categoryId" TEXT,
    "pdpJoinId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "reviewId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "copy" JSONB NOT NULL,
    "parentId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fandomId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isFictional" BOOLEAN NOT NULL DEFAULT true,
    "copy" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "seriesId" TEXT,
    "fandomId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isFictional" BOOLEAN NOT NULL DEFAULT true,
    "copy" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "TaxonomyType" NOT NULL DEFAULT 'TAG',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "copy" JSONB NOT NULL,
    "parentId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jolly_roger" (
    "id" SERIAL NOT NULL,
    "canChart" BOOLEAN NOT NULL DEFAULT true,
    "chartingMethod" "JrChartMethod" NOT NULL DEFAULT 'sitemap',
    "brandId" TEXT,
    "sitemaps" TEXT,
    "gridUrls" TEXT,
    "pdpUrlPatterns" JSONB,

    CONSTRAINT "jolly_roger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jr_extraction_rules" (
    "id" SERIAL NOT NULL,
    "jollyRogerId" INTEGER NOT NULL,
    "fieldName" "JrChartRuleFor" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "selectors" JSONB NOT NULL DEFAULT '[]',
    "mustContain" VARCHAR(255),
    "cannotContain" VARCHAR(255),
    "lastSuccessfulSelector" JSONB,
    "successRate" DOUBLE PRECISION,
    "lastTestedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "jr_extraction_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JrFindReplace" (
    "id" SERIAL NOT NULL,
    "lookFor" VARCHAR(255) NOT NULL,
    "replaceWith" VARCHAR(255),
    "ruleAction" "JrRuleAction" NOT NULL DEFAULT 'match_on',
    "isRegex" BOOLEAN NOT NULL DEFAULT false,
    "regexFlags" VARCHAR(10),
    "priority" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "JrFindReplace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "type" "ReviewType" NOT NULL DEFAULT 'DEDICATED',
    "sourceId" TEXT,
    "source" TEXT,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "productId" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteJoin" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "collectionId" TEXT,

    CONSTRAINT "FavoriteJoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewVoteJoin" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "voteType" "VoteType" NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,

    CONSTRAINT "ReviewVoteJoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "AddressType" NOT NULL DEFAULT 'SHIPPING',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "street1" TEXT NOT NULL,
    "street2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "metadata" JSONB,
    "abandonedAt" TIMESTAMP(3),
    "recoveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isGift" BOOLEAN NOT NULL DEFAULT false,
    "giftMessage" TEXT,
    "registryId" TEXT,
    "savedForLater" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "guestEmail" TEXT,
    "guestName" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "shippingAddressId" TEXT,
    "billingAddressId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "shippingAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "shippingMethod" TEXT,
    "trackingNumber" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "customerNotes" TEXT,
    "internalNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "isGift" BOOLEAN NOT NULL DEFAULT false,
    "giftMessage" TEXT,
    "registryId" TEXT,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "fulfilledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "gateway" TEXT NOT NULL,
    "gatewayId" TEXT,
    "gatewayResponse" JSONB,
    "paymentMethod" TEXT,
    "last4" TEXT,
    "parentTransactionId" TEXT,
    "metadata" JSONB,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "available" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER,
    "locationId" TEXT,
    "locationName" TEXT,
    "lastRestockedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "RegistryType" NOT NULL DEFAULT 'WISHLIST',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "eventDate" TIMESTAMP(3),
    "createdByUserId" TEXT,

    CONSTRAINT "Registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistryItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "registryId" TEXT NOT NULL,
    "productId" TEXT,
    "collectionId" TEXT,

    CONSTRAINT "RegistryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistryPurchaseJoin" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "orderNumber" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "estimatedDelivery" TIMESTAMP(3),
    "actualDelivery" TIMESTAMP(3),
    "isGift" BOOLEAN NOT NULL DEFAULT false,
    "giftMessage" TEXT,
    "giftWrapped" BOOLEAN NOT NULL DEFAULT false,
    "thankYouSent" BOOLEAN NOT NULL DEFAULT false,
    "thankYouSentAt" TIMESTAMP(3),
    "thankYouMessage" TEXT,
    "notes" TEXT,
    "purchaserId" TEXT NOT NULL,
    "registryItemId" TEXT NOT NULL,
    "notifiedOwner" BOOLEAN NOT NULL DEFAULT false,
    "notifiedDate" TIMESTAMP(3),

    CONSTRAINT "RegistryPurchaseJoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistryUserJoin" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "RegistryUserRole" NOT NULL DEFAULT 'VIEWER',
    "userId" TEXT NOT NULL,
    "registryId" TEXT NOT NULL,

    CONSTRAINT "RegistryUserJoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_config" (
    "id" TEXT NOT NULL,
    "workflowSlug" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "notifyOnStart" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnComplete" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnApproval" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmail" TEXT,
    "maxRetries" INTEGER,
    "timeoutSeconds" INTEGER,
    "rateLimitPerHour" INTEGER,
    "maxConcurrent" INTEGER,
    "priority" SMALLINT DEFAULT 5,
    "customPayload" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "workflow_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_execution" (
    "id" TEXT NOT NULL,
    "workflowRunId" TEXT NOT NULL,
    "workflowSlug" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "inputPayload" JSONB,
    "inputPayloadHash" TEXT,
    "outputPayload" JSONB,
    "hasOutput" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "errorType" TEXT,
    "errorStack" TEXT,
    "stepCount" INTEGER NOT NULL DEFAULT 0,
    "completedSteps" INTEGER NOT NULL DEFAULT 0,
    "failedSteps" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "currentStep" TEXT,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "progressMessage" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "totalCostCents" INTEGER NOT NULL DEFAULT 0,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "apiCallCount" INTEGER NOT NULL DEFAULT 0,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "imagesProcessed" INTEGER NOT NULL DEFAULT 0,
    "aiTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "storageBytes" BIGINT NOT NULL DEFAULT 0,
    "triggeredBy" TEXT NOT NULL,
    "triggerSource" TEXT,
    "parentExecutionId" TEXT,
    "retryOfExecutionId" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "actualStartAt" TIMESTAMP(3),
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_schedule" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cronExpression" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "payload" JSONB NOT NULL,
    "nextRunAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "successfulRuns" INTEGER NOT NULL DEFAULT 0,
    "failedRuns" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "workflow_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_checkpoint" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "workflowSlug" TEXT NOT NULL,
    "checkpointName" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "stepName" TEXT,
    "state" JSONB NOT NULL,
    "progress" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRestored" BOOLEAN NOT NULL DEFAULT false,
    "restoredAt" TIMESTAMP(3),
    "stateSizeBytes" INTEGER,

    CONSTRAINT "workflow_checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_metrics" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "workflowSlug" TEXT NOT NULL,
    "totalDuration" INTEGER NOT NULL,
    "setupDuration" INTEGER NOT NULL DEFAULT 0,
    "executionDuration" INTEGER NOT NULL DEFAULT 0,
    "cleanupDuration" INTEGER NOT NULL DEFAULT 0,
    "stepsPlanned" INTEGER NOT NULL DEFAULT 0,
    "stepsExecuted" INTEGER NOT NULL DEFAULT 0,
    "stepsSucceeded" INTEGER NOT NULL DEFAULT 0,
    "stepsFailed" INTEGER NOT NULL DEFAULT 0,
    "stepsSkipped" INTEGER NOT NULL DEFAULT 0,
    "stepsRetried" INTEGER NOT NULL DEFAULT 0,
    "memoryUsageMB" INTEGER,
    "cpuUsagePercent" DOUBLE PRECISION,
    "networkBytesSent" BIGINT NOT NULL DEFAULT 0,
    "networkBytesReceived" BIGINT NOT NULL DEFAULT 0,
    "databaseQueries" INTEGER NOT NULL DEFAULT 0,
    "apiCallsExternal" INTEGER NOT NULL DEFAULT 0,
    "fileOperations" INTEGER NOT NULL DEFAULT 0,
    "aiTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "dataQualityScore" DOUBLE PRECISION,
    "performanceScore" DOUBLE PRECISION,
    "reliabilityScore" DOUBLE PRECISION,
    "overallQualityScore" DOUBLE PRECISION,
    "computeCostCents" INTEGER NOT NULL DEFAULT 0,
    "storageCostCents" INTEGER NOT NULL DEFAULT 0,
    "networkCostCents" INTEGER NOT NULL DEFAULT 0,
    "externalApiCostCents" INTEGER NOT NULL DEFAULT 0,
    "totalCostCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_service_usage" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "workflowSlug" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "operationCount" INTEGER NOT NULL DEFAULT 1,
    "bytesProcessed" BIGINT,
    "tokensUsed" INTEGER,
    "durationMs" INTEGER,
    "costCents" INTEGER NOT NULL DEFAULT 0,
    "requestData" JSONB,
    "responseData" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "workflow_service_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_alert" (
    "id" TEXT NOT NULL,
    "workflowSlug" TEXT NOT NULL,
    "executionId" TEXT,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" JSONB,
    "actualValue" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "notificationsSent" INTEGER NOT NULL DEFAULT 0,
    "lastNotifiedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductTaxonomy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductTaxonomy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductSeries" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductSeries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductStory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductStory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PdpJoinTaxonomy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PdpJoinTaxonomy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BrandToCollection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BrandToCollection_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BrandToJrFindReplaceReject" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BrandToJrFindReplaceReject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PdpJoinManufacturerBrands" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PdpJoinManufacturerBrands_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductCast" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductCast_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CastToJrFindReplaceReject" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CastToJrFindReplaceReject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductCollection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductCollection_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionToTaxonomy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollectionToTaxonomy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollectionToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PdpJoinCollection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PdpJoinCollection_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductFandom" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductFandom_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FandomToLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FandomToLocation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FandomToJrFindReplaceReject" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FandomToJrFindReplaceReject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductLocation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PdpJoinLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PdpJoinLocation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TaxonomyLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaxonomyLocation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JrExtractionRuleToJrFindReplaceReject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_JrExtractionRuleToJrFindReplaceReject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JrFindReplaceRejectToLocation" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JrFindReplaceRejectToLocation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JrFindReplaceRejectToTaxonomy" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JrFindReplaceRejectToTaxonomy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JrFindReplaceRejectToStory" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JrFindReplaceRejectToStory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JrFindReplaceRejectToSeries" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JrFindReplaceRejectToSeries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "team_member_userId_idx" ON "team_member"("userId");

-- CreateIndex
CREATE INDEX "team_member_teamId_idx" ON "team_member"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_userId_teamId_key" ON "team_member"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "twofactor_userId_key" ON "twofactor"("userId");

-- CreateIndex
CREATE INDEX "twofactor_userId_idx" ON "twofactor"("userId");

-- CreateIndex
CREATE INDEX "backupcode_userId_idx" ON "backupcode"("userId");

-- CreateIndex
CREATE INDEX "backupcode_twoFactorId_idx" ON "backupcode"("twoFactorId");

-- CreateIndex
CREATE UNIQUE INDEX "backupcode_codeHash_userId_key" ON "backupcode"("codeHash", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "passkey_credentialId_key" ON "passkey"("credentialId");

-- CreateIndex
CREATE INDEX "passkey_userId_idx" ON "passkey"("userId");

-- CreateIndex
CREATE INDEX "passkey_credentialId_idx" ON "passkey"("credentialId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_email_idx" ON "audit_logs"("email");

-- CreateIndex
CREATE INDEX "audit_logs_type_idx" ON "audit_logs"("type");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_type_timestamp_idx" ON "audit_logs"("type", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_slug_idx" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_userId_idx" ON "Article"("userId");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_deletedAt_idx" ON "Article"("deletedAt");

-- CreateIndex
CREATE INDEX "Article_deletedById_idx" ON "Article"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE INDEX "product_slug_idx" ON "product"("slug");

-- CreateIndex
CREATE INDEX "product_category_idx" ON "product"("category");

-- CreateIndex
CREATE INDEX "product_status_idx" ON "product"("status");

-- CreateIndex
CREATE INDEX "product_aiGenerated_idx" ON "product"("aiGenerated");

-- CreateIndex
CREATE INDEX "product_brand_idx" ON "product"("brand");

-- CreateIndex
CREATE INDEX "product_type_idx" ON "product"("type");

-- CreateIndex
CREATE INDEX "product_parentId_idx" ON "product"("parentId");

-- CreateIndex
CREATE INDEX "product_deletedAt_idx" ON "product"("deletedAt");

-- CreateIndex
CREATE INDEX "product_displayOrder_idx" ON "product"("displayOrder");

-- CreateIndex
CREATE INDEX "product_isDefault_idx" ON "product"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "PdpJoin_canonicalUrl_key" ON "PdpJoin"("canonicalUrl");

-- CreateIndex
CREATE INDEX "PdpJoin_productId_idx" ON "PdpJoin"("productId");

-- CreateIndex
CREATE INDEX "PdpJoin_brandId_idx" ON "PdpJoin"("brandId");

-- CreateIndex
CREATE INDEX "PdpJoin_canonicalUrl_idx" ON "PdpJoin"("canonicalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "PdpJoin_productId_brandId_key" ON "PdpJoin"("productId", "brandId");

-- CreateIndex
CREATE UNIQUE INDEX "pdp_urls_url_key" ON "pdp_urls"("url");

-- CreateIndex
CREATE INDEX "pdp_urls_url_isActive_idx" ON "pdp_urls"("url", "isActive");

-- CreateIndex
CREATE INDEX "pdp_urls_pdpJoinId_urlType_idx" ON "pdp_urls"("pdpJoinId", "urlType");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_upcA_key" ON "product_identifiers"("upcA");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_ean13_key" ON "product_identifiers"("ean13");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_gs1128_key" ON "product_identifiers"("gs1128");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_upcE_key" ON "product_identifiers"("upcE");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_ean8_key" ON "product_identifiers"("ean8");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_asin_key" ON "product_identifiers"("asin");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_tcin_key" ON "product_identifiers"("tcin");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_dpci_key" ON "product_identifiers"("dpci");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_hardcoverappId_key" ON "product_identifiers"("hardcoverappId");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_itf14_key" ON "product_identifiers"("itf14");

-- CreateIndex
CREATE INDEX "product_identifiers_mpn_idx" ON "product_identifiers"("mpn");

-- CreateIndex
CREATE INDEX "product_identifiers_upcA_idx" ON "product_identifiers"("upcA");

-- CreateIndex
CREATE INDEX "product_identifiers_ean13_idx" ON "product_identifiers"("ean13");

-- CreateIndex
CREATE INDEX "product_identifiers_gs1128_idx" ON "product_identifiers"("gs1128");

-- CreateIndex
CREATE INDEX "product_identifiers_upcE_idx" ON "product_identifiers"("upcE");

-- CreateIndex
CREATE INDEX "product_identifiers_ean8_idx" ON "product_identifiers"("ean8");

-- CreateIndex
CREATE INDEX "product_identifiers_isbn10_idx" ON "product_identifiers"("isbn10");

-- CreateIndex
CREATE INDEX "product_identifiers_isbn13_idx" ON "product_identifiers"("isbn13");

-- CreateIndex
CREATE INDEX "product_identifiers_asin_idx" ON "product_identifiers"("asin");

-- CreateIndex
CREATE INDEX "product_identifiers_tcin_idx" ON "product_identifiers"("tcin");

-- CreateIndex
CREATE INDEX "product_identifiers_dpci_idx" ON "product_identifiers"("dpci");

-- CreateIndex
CREATE INDEX "product_identifiers_themoviedbId_idx" ON "product_identifiers"("themoviedbId");

-- CreateIndex
CREATE INDEX "product_identifiers_hardcoverappId_idx" ON "product_identifiers"("hardcoverappId");

-- CreateIndex
CREATE INDEX "product_identifiers_itf14_idx" ON "product_identifiers"("itf14");

-- CreateIndex
CREATE INDEX "product_identifiers_customBarcode_idx" ON "product_identifiers"("customBarcode");

-- CreateIndex
CREATE INDEX "product_identifiers_source_idx" ON "product_identifiers"("source");

-- CreateIndex
CREATE INDEX "product_identifiers_verifiedAt_idx" ON "product_identifiers"("verifiedAt");

-- CreateIndex
CREATE INDEX "product_identifiers_productId_idx" ON "product_identifiers"("productId");

-- CreateIndex
CREATE INDEX "product_identifiers_pdpJoinId_idx" ON "product_identifiers"("pdpJoinId");

-- CreateIndex
CREATE INDEX "product_identifiers_collectionId_idx" ON "product_identifiers"("collectionId");

-- CreateIndex
CREATE INDEX "product_identifiers_brandId_idx" ON "product_identifiers"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "product_identifiers_productId_pdpJoinId_collectionId_brandI_key" ON "product_identifiers"("productId", "pdpJoinId", "collectionId", "brandId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_slug_idx" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_type_idx" ON "Brand"("type");

-- CreateIndex
CREATE INDEX "Brand_status_idx" ON "Brand"("status");

-- CreateIndex
CREATE INDEX "Brand_parentId_idx" ON "Brand"("parentId");

-- CreateIndex
CREATE INDEX "Brand_displayOrder_idx" ON "Brand"("displayOrder");

-- CreateIndex
CREATE INDEX "Brand_deletedAt_idx" ON "Brand"("deletedAt");

-- CreateIndex
CREATE INDEX "Brand_deletedById_idx" ON "Brand"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "Cast_slug_key" ON "Cast"("slug");

-- CreateIndex
CREATE INDEX "Cast_slug_idx" ON "Cast"("slug");

-- CreateIndex
CREATE INDEX "Cast_deletedAt_idx" ON "Cast"("deletedAt");

-- CreateIndex
CREATE INDEX "Cast_deletedById_idx" ON "Cast"("deletedById");

-- CreateIndex
CREATE INDEX "Cast_isFictional_idx" ON "Cast"("isFictional");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_slug_idx" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_type_idx" ON "Collection"("type");

-- CreateIndex
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");

-- CreateIndex
CREATE INDEX "Collection_status_idx" ON "Collection"("status");

-- CreateIndex
CREATE INDEX "Collection_parentId_idx" ON "Collection"("parentId");

-- CreateIndex
CREATE INDEX "Collection_deletedAt_idx" ON "Collection"("deletedAt");

-- CreateIndex
CREATE INDEX "Collection_deletedById_idx" ON "Collection"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "Fandom_slug_key" ON "Fandom"("slug");

-- CreateIndex
CREATE INDEX "Fandom_slug_idx" ON "Fandom"("slug");

-- CreateIndex
CREATE INDEX "Fandom_deletedAt_idx" ON "Fandom"("deletedAt");

-- CreateIndex
CREATE INDEX "Fandom_deletedById_idx" ON "Fandom"("deletedById");

-- CreateIndex
CREATE INDEX "Fandom_isFictional_idx" ON "Fandom"("isFictional");

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");

-- CreateIndex
CREATE INDEX "Location_slug_idx" ON "Location"("slug");

-- CreateIndex
CREATE INDEX "Location_deletedAt_idx" ON "Location"("deletedAt");

-- CreateIndex
CREATE INDEX "Location_deletedById_idx" ON "Location"("deletedById");

-- CreateIndex
CREATE INDEX "Location_isFictional_idx" ON "Location"("isFictional");

-- CreateIndex
CREATE INDEX "Location_locationType_idx" ON "Location"("locationType");

-- CreateIndex
CREATE INDEX "Location_lodgingType_idx" ON "Location"("lodgingType");

-- CreateIndex
CREATE INDEX "Media_userId_idx" ON "Media"("userId");

-- CreateIndex
CREATE INDEX "Media_articleId_idx" ON "Media"("articleId");

-- CreateIndex
CREATE INDEX "Media_brandId_idx" ON "Media"("brandId");

-- CreateIndex
CREATE INDEX "Media_collectionId_idx" ON "Media"("collectionId");

-- CreateIndex
CREATE INDEX "Media_productId_idx" ON "Media"("productId");

-- CreateIndex
CREATE INDEX "Media_taxonomyId_idx" ON "Media"("taxonomyId");

-- CreateIndex
CREATE INDEX "Media_reviewId_idx" ON "Media"("reviewId");

-- CreateIndex
CREATE INDEX "Media_categoryId_idx" ON "Media"("categoryId");

-- CreateIndex
CREATE INDEX "Media_pdpJoinId_idx" ON "Media"("pdpJoinId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "Media_sortOrder_idx" ON "Media"("sortOrder");

-- CreateIndex
CREATE INDEX "Media_deletedAt_idx" ON "Media"("deletedAt");

-- CreateIndex
CREATE INDEX "Media_deletedById_idx" ON "Media"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");

-- CreateIndex
CREATE INDEX "ProductCategory_slug_idx" ON "ProductCategory"("slug");

-- CreateIndex
CREATE INDEX "ProductCategory_parentId_idx" ON "ProductCategory"("parentId");

-- CreateIndex
CREATE INDEX "ProductCategory_status_idx" ON "ProductCategory"("status");

-- CreateIndex
CREATE INDEX "ProductCategory_displayOrder_idx" ON "ProductCategory"("displayOrder");

-- CreateIndex
CREATE INDEX "ProductCategory_deletedAt_idx" ON "ProductCategory"("deletedAt");

-- CreateIndex
CREATE INDEX "ProductCategory_deletedById_idx" ON "ProductCategory"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "Series_slug_key" ON "Series"("slug");

-- CreateIndex
CREATE INDEX "Series_slug_idx" ON "Series"("slug");

-- CreateIndex
CREATE INDEX "Series_fandomId_idx" ON "Series"("fandomId");

-- CreateIndex
CREATE INDEX "Series_displayOrder_idx" ON "Series"("displayOrder");

-- CreateIndex
CREATE INDEX "Series_deletedAt_idx" ON "Series"("deletedAt");

-- CreateIndex
CREATE INDEX "Series_deletedById_idx" ON "Series"("deletedById");

-- CreateIndex
CREATE INDEX "Series_isFictional_idx" ON "Series"("isFictional");

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_slug_idx" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_seriesId_idx" ON "Story"("seriesId");

-- CreateIndex
CREATE INDEX "Story_fandomId_idx" ON "Story"("fandomId");

-- CreateIndex
CREATE INDEX "Story_displayOrder_idx" ON "Story"("displayOrder");

-- CreateIndex
CREATE INDEX "Story_deletedAt_idx" ON "Story"("deletedAt");

-- CreateIndex
CREATE INDEX "Story_deletedById_idx" ON "Story"("deletedById");

-- CreateIndex
CREATE INDEX "Story_isFictional_idx" ON "Story"("isFictional");

-- CreateIndex
CREATE UNIQUE INDEX "Taxonomy_slug_key" ON "Taxonomy"("slug");

-- CreateIndex
CREATE INDEX "Taxonomy_slug_idx" ON "Taxonomy"("slug");

-- CreateIndex
CREATE INDEX "Taxonomy_type_idx" ON "Taxonomy"("type");

-- CreateIndex
CREATE INDEX "Taxonomy_status_idx" ON "Taxonomy"("status");

-- CreateIndex
CREATE INDEX "Taxonomy_deletedAt_idx" ON "Taxonomy"("deletedAt");

-- CreateIndex
CREATE INDEX "Taxonomy_deletedById_idx" ON "Taxonomy"("deletedById");

-- CreateIndex
CREATE INDEX "Taxonomy_parentId_idx" ON "Taxonomy"("parentId");

-- CreateIndex
CREATE INDEX "Taxonomy_displayOrder_idx" ON "Taxonomy"("displayOrder");

-- CreateIndex
CREATE INDEX "Taxonomy_level_idx" ON "Taxonomy"("level");

-- CreateIndex
CREATE UNIQUE INDEX "jolly_roger_brandId_key" ON "jolly_roger"("brandId");

-- CreateIndex
CREATE INDEX "jolly_roger_canChart_idx" ON "jolly_roger"("canChart");

-- CreateIndex
CREATE INDEX "jolly_roger_brandId_idx" ON "jolly_roger"("brandId");

-- CreateIndex
CREATE INDEX "jr_extraction_rules_jollyRogerId_idx" ON "jr_extraction_rules"("jollyRogerId");

-- CreateIndex
CREATE INDEX "jr_extraction_rules_fieldName_idx" ON "jr_extraction_rules"("fieldName");

-- CreateIndex
CREATE INDEX "jr_extraction_rules_isActive_idx" ON "jr_extraction_rules"("isActive");

-- CreateIndex
CREATE INDEX "jr_extraction_rules_selectors_idx" ON "jr_extraction_rules" USING GIN ("selectors");

-- CreateIndex
CREATE UNIQUE INDEX "jr_extraction_rules_jollyRogerId_fieldName_key" ON "jr_extraction_rules"("jollyRogerId", "fieldName");

-- CreateIndex
CREATE INDEX "JrFindReplace_priority_idx" ON "JrFindReplace"("priority");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_verified_idx" ON "Review"("verified");

-- CreateIndex
CREATE INDEX "Review_type_idx" ON "Review"("type");

-- CreateIndex
CREATE INDEX "Review_source_idx" ON "Review"("source");

-- CreateIndex
CREATE INDEX "Review_helpfulCount_idx" ON "Review"("helpfulCount");

-- CreateIndex
CREATE INDEX "Review_totalVotes_idx" ON "Review"("totalVotes");

-- CreateIndex
CREATE INDEX "Review_deletedAt_idx" ON "Review"("deletedAt");

-- CreateIndex
CREATE INDEX "Review_deletedById_idx" ON "Review"("deletedById");

-- CreateIndex
CREATE INDEX "FavoriteJoin_userId_idx" ON "FavoriteJoin"("userId");

-- CreateIndex
CREATE INDEX "FavoriteJoin_productId_idx" ON "FavoriteJoin"("productId");

-- CreateIndex
CREATE INDEX "FavoriteJoin_collectionId_idx" ON "FavoriteJoin"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteJoin_userId_productId_collectionId_key" ON "FavoriteJoin"("userId", "productId", "collectionId");

-- CreateIndex
CREATE INDEX "ReviewVoteJoin_userId_idx" ON "ReviewVoteJoin"("userId");

-- CreateIndex
CREATE INDEX "ReviewVoteJoin_reviewId_idx" ON "ReviewVoteJoin"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewVoteJoin_voteType_idx" ON "ReviewVoteJoin"("voteType");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewVoteJoin_userId_reviewId_key" ON "ReviewVoteJoin"("userId", "reviewId");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Address_type_idx" ON "Address"("type");

-- CreateIndex
CREATE INDEX "Cart_sessionId_idx" ON "Cart"("sessionId");

-- CreateIndex
CREATE INDEX "Cart_status_idx" ON "Cart"("status");

-- CreateIndex
CREATE INDEX "Cart_expiresAt_idx" ON "Cart"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");

-- CreateIndex
CREATE INDEX "CartItem_variantId_idx" ON "CartItem"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_variantId_key" ON "CartItem"("cartId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- CreateIndex
CREATE INDEX "OrderItem_status_idx" ON "OrderItem"("status");

-- CreateIndex
CREATE INDEX "Transaction_orderId_idx" ON "Transaction"("orderId");

-- CreateIndex
CREATE INDEX "Transaction_gateway_idx" ON "Transaction"("gateway");

-- CreateIndex
CREATE INDEX "Transaction_gatewayId_idx" ON "Transaction"("gatewayId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Inventory_available_idx" ON "Inventory"("available");

-- CreateIndex
CREATE INDEX "Inventory_locationId_idx" ON "Inventory"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_variantId_locationId_key" ON "Inventory"("productId", "variantId", "locationId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_inventoryId_idx" ON "InventoryTransaction"("inventoryId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_referenceType_referenceId_idx" ON "InventoryTransaction"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "Registry_createdByUserId_idx" ON "Registry"("createdByUserId");

-- CreateIndex
CREATE INDEX "Registry_type_idx" ON "Registry"("type");

-- CreateIndex
CREATE INDEX "Registry_isPublic_idx" ON "Registry"("isPublic");

-- CreateIndex
CREATE INDEX "Registry_eventDate_idx" ON "Registry"("eventDate");

-- CreateIndex
CREATE INDEX "Registry_deletedAt_idx" ON "Registry"("deletedAt");

-- CreateIndex
CREATE INDEX "Registry_deletedById_idx" ON "Registry"("deletedById");

-- CreateIndex
CREATE INDEX "RegistryItem_registryId_idx" ON "RegistryItem"("registryId");

-- CreateIndex
CREATE INDEX "RegistryItem_productId_idx" ON "RegistryItem"("productId");

-- CreateIndex
CREATE INDEX "RegistryItem_collectionId_idx" ON "RegistryItem"("collectionId");

-- CreateIndex
CREATE INDEX "RegistryItem_purchased_idx" ON "RegistryItem"("purchased");

-- CreateIndex
CREATE INDEX "RegistryItem_priority_idx" ON "RegistryItem"("priority");

-- CreateIndex
CREATE INDEX "RegistryItem_deletedAt_idx" ON "RegistryItem"("deletedAt");

-- CreateIndex
CREATE INDEX "RegistryItem_deletedById_idx" ON "RegistryItem"("deletedById");

-- CreateIndex
CREATE UNIQUE INDEX "RegistryItem_registryId_productId_collectionId_key" ON "RegistryItem"("registryId", "productId", "collectionId");

-- CreateIndex
CREATE INDEX "RegistryPurchaseJoin_purchaserId_idx" ON "RegistryPurchaseJoin"("purchaserId");

-- CreateIndex
CREATE INDEX "RegistryPurchaseJoin_registryItemId_idx" ON "RegistryPurchaseJoin"("registryItemId");

-- CreateIndex
CREATE INDEX "RegistryPurchaseJoin_status_idx" ON "RegistryPurchaseJoin"("status");

-- CreateIndex
CREATE INDEX "RegistryPurchaseJoin_purchaseDate_idx" ON "RegistryPurchaseJoin"("purchaseDate");

-- CreateIndex
CREATE INDEX "RegistryPurchaseJoin_transactionId_idx" ON "RegistryPurchaseJoin"("transactionId");

-- CreateIndex
CREATE INDEX "RegistryPurchaseJoin_orderNumber_idx" ON "RegistryPurchaseJoin"("orderNumber");

-- CreateIndex
CREATE INDEX "RegistryPurchaseJoin_isGift_idx" ON "RegistryPurchaseJoin"("isGift");

-- CreateIndex
CREATE INDEX "RegistryPurchaseJoin_notifiedOwner_idx" ON "RegistryPurchaseJoin"("notifiedOwner");

-- CreateIndex
CREATE INDEX "RegistryPurchaseJoin_thankYouSent_idx" ON "RegistryPurchaseJoin"("thankYouSent");

-- CreateIndex
CREATE INDEX "RegistryUserJoin_userId_idx" ON "RegistryUserJoin"("userId");

-- CreateIndex
CREATE INDEX "RegistryUserJoin_registryId_idx" ON "RegistryUserJoin"("registryId");

-- CreateIndex
CREATE INDEX "RegistryUserJoin_role_idx" ON "RegistryUserJoin"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RegistryUserJoin_userId_registryId_key" ON "RegistryUserJoin"("userId", "registryId");

-- CreateIndex
CREATE INDEX "workflow_config_workflowSlug_idx" ON "workflow_config"("workflowSlug");

-- CreateIndex
CREATE INDEX "workflow_config_organizationId_idx" ON "workflow_config"("organizationId");

-- CreateIndex
CREATE INDEX "workflow_config_userId_idx" ON "workflow_config"("userId");

-- CreateIndex
CREATE INDEX "workflow_config_isEnabled_idx" ON "workflow_config"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_config_workflowSlug_organizationId_key" ON "workflow_config"("workflowSlug", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_config_workflowSlug_userId_key" ON "workflow_config"("workflowSlug", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_execution_workflowRunId_key" ON "workflow_execution"("workflowRunId");

-- CreateIndex
CREATE INDEX "workflow_execution_workflowSlug_idx" ON "workflow_execution"("workflowSlug");

-- CreateIndex
CREATE INDEX "workflow_execution_workflowSlug_status_startedAt_idx" ON "workflow_execution"("workflowSlug", "status", "startedAt");

-- CreateIndex
CREATE INDEX "workflow_execution_userId_idx" ON "workflow_execution"("userId");

-- CreateIndex
CREATE INDEX "workflow_execution_organizationId_idx" ON "workflow_execution"("organizationId");

-- CreateIndex
CREATE INDEX "workflow_execution_organizationId_status_startedAt_idx" ON "workflow_execution"("organizationId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "workflow_execution_status_idx" ON "workflow_execution"("status");

-- CreateIndex
CREATE INDEX "workflow_execution_startedAt_idx" ON "workflow_execution"("startedAt");

-- CreateIndex
CREATE INDEX "workflow_execution_triggeredBy_idx" ON "workflow_execution"("triggeredBy");

-- CreateIndex
CREATE INDEX "workflow_execution_retryOfExecutionId_idx" ON "workflow_execution"("retryOfExecutionId");

-- CreateIndex
CREATE INDEX "workflow_execution_scheduledFor_idx" ON "workflow_execution"("scheduledFor");

-- CreateIndex
CREATE INDEX "workflow_execution_progressPercent_idx" ON "workflow_execution"("progressPercent");

-- CreateIndex
CREATE INDEX "workflow_schedule_configId_idx" ON "workflow_schedule"("configId");

-- CreateIndex
CREATE INDEX "workflow_schedule_isActive_idx" ON "workflow_schedule"("isActive");

-- CreateIndex
CREATE INDEX "workflow_schedule_nextRunAt_idx" ON "workflow_schedule"("nextRunAt");

-- CreateIndex
CREATE INDEX "workflow_checkpoint_executionId_idx" ON "workflow_checkpoint"("executionId");

-- CreateIndex
CREATE INDEX "workflow_checkpoint_workflowSlug_idx" ON "workflow_checkpoint"("workflowSlug");

-- CreateIndex
CREATE INDEX "workflow_checkpoint_createdAt_idx" ON "workflow_checkpoint"("createdAt");

-- CreateIndex
CREATE INDEX "workflow_checkpoint_stepId_idx" ON "workflow_checkpoint"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_checkpoint_executionId_checkpointName_key" ON "workflow_checkpoint"("executionId", "checkpointName");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_metrics_executionId_key" ON "workflow_metrics"("executionId");

-- CreateIndex
CREATE INDEX "workflow_metrics_workflowSlug_idx" ON "workflow_metrics"("workflowSlug");

-- CreateIndex
CREATE INDEX "workflow_metrics_totalDuration_idx" ON "workflow_metrics"("totalDuration");

-- CreateIndex
CREATE INDEX "workflow_metrics_overallQualityScore_idx" ON "workflow_metrics"("overallQualityScore");

-- CreateIndex
CREATE INDEX "workflow_metrics_totalCostCents_idx" ON "workflow_metrics"("totalCostCents");

-- CreateIndex
CREATE INDEX "workflow_metrics_createdAt_idx" ON "workflow_metrics"("createdAt");

-- CreateIndex
CREATE INDEX "workflow_service_usage_executionId_idx" ON "workflow_service_usage"("executionId");

-- CreateIndex
CREATE INDEX "workflow_service_usage_workflowSlug_idx" ON "workflow_service_usage"("workflowSlug");

-- CreateIndex
CREATE INDEX "workflow_service_usage_serviceName_idx" ON "workflow_service_usage"("serviceName");

-- CreateIndex
CREATE INDEX "workflow_service_usage_serviceType_idx" ON "workflow_service_usage"("serviceType");

-- CreateIndex
CREATE INDEX "workflow_service_usage_startedAt_idx" ON "workflow_service_usage"("startedAt");

-- CreateIndex
CREATE INDEX "workflow_service_usage_costCents_idx" ON "workflow_service_usage"("costCents");

-- CreateIndex
CREATE INDEX "workflow_alert_workflowSlug_idx" ON "workflow_alert"("workflowSlug");

-- CreateIndex
CREATE INDEX "workflow_alert_executionId_idx" ON "workflow_alert"("executionId");

-- CreateIndex
CREATE INDEX "workflow_alert_alertType_idx" ON "workflow_alert"("alertType");

-- CreateIndex
CREATE INDEX "workflow_alert_severity_idx" ON "workflow_alert"("severity");

-- CreateIndex
CREATE INDEX "workflow_alert_status_idx" ON "workflow_alert"("status");

-- CreateIndex
CREATE INDEX "workflow_alert_createdAt_idx" ON "workflow_alert"("createdAt");

-- CreateIndex
CREATE INDEX "_ProductTaxonomy_B_index" ON "_ProductTaxonomy"("B");

-- CreateIndex
CREATE INDEX "_ProductCategories_B_index" ON "_ProductCategories"("B");

-- CreateIndex
CREATE INDEX "_ProductSeries_B_index" ON "_ProductSeries"("B");

-- CreateIndex
CREATE INDEX "_ProductStory_B_index" ON "_ProductStory"("B");

-- CreateIndex
CREATE INDEX "_PdpJoinTaxonomy_B_index" ON "_PdpJoinTaxonomy"("B");

-- CreateIndex
CREATE INDEX "_BrandToCollection_B_index" ON "_BrandToCollection"("B");

-- CreateIndex
CREATE INDEX "_BrandToJrFindReplaceReject_B_index" ON "_BrandToJrFindReplaceReject"("B");

-- CreateIndex
CREATE INDEX "_PdpJoinManufacturerBrands_B_index" ON "_PdpJoinManufacturerBrands"("B");

-- CreateIndex
CREATE INDEX "_ProductCast_B_index" ON "_ProductCast"("B");

-- CreateIndex
CREATE INDEX "_CastToJrFindReplaceReject_B_index" ON "_CastToJrFindReplaceReject"("B");

-- CreateIndex
CREATE INDEX "_ProductCollection_B_index" ON "_ProductCollection"("B");

-- CreateIndex
CREATE INDEX "_CollectionToTaxonomy_B_index" ON "_CollectionToTaxonomy"("B");

-- CreateIndex
CREATE INDEX "_CollectionToCategory_B_index" ON "_CollectionToCategory"("B");

-- CreateIndex
CREATE INDEX "_PdpJoinCollection_B_index" ON "_PdpJoinCollection"("B");

-- CreateIndex
CREATE INDEX "_ProductFandom_B_index" ON "_ProductFandom"("B");

-- CreateIndex
CREATE INDEX "_FandomToLocation_B_index" ON "_FandomToLocation"("B");

-- CreateIndex
CREATE INDEX "_FandomToJrFindReplaceReject_B_index" ON "_FandomToJrFindReplaceReject"("B");

-- CreateIndex
CREATE INDEX "_ProductLocation_B_index" ON "_ProductLocation"("B");

-- CreateIndex
CREATE INDEX "_PdpJoinLocation_B_index" ON "_PdpJoinLocation"("B");

-- CreateIndex
CREATE INDEX "_TaxonomyLocation_B_index" ON "_TaxonomyLocation"("B");

-- CreateIndex
CREATE INDEX "_JrExtractionRuleToJrFindReplaceReject_B_index" ON "_JrExtractionRuleToJrFindReplaceReject"("B");

-- CreateIndex
CREATE INDEX "_JrFindReplaceRejectToLocation_B_index" ON "_JrFindReplaceRejectToLocation"("B");

-- CreateIndex
CREATE INDEX "_JrFindReplaceRejectToTaxonomy_B_index" ON "_JrFindReplaceRejectToTaxonomy"("B");

-- CreateIndex
CREATE INDEX "_JrFindReplaceRejectToStory_B_index" ON "_JrFindReplaceRejectToStory"("B");

-- CreateIndex
CREATE INDEX "_JrFindReplaceRejectToSeries_B_index" ON "_JrFindReplaceRejectToSeries"("B");

-- CreateIndex
CREATE INDEX "apikey_organizationId_idx" ON "apikey"("organizationId");

-- CreateIndex
CREATE INDEX "apikey_key_idx" ON "apikey"("key");

-- CreateIndex
CREATE INDEX "apikey_keyHash_idx" ON "apikey"("keyHash");

-- CreateIndex
CREATE INDEX "apikey_lastUsedAt_idx" ON "apikey"("lastUsedAt");

-- CreateIndex
CREATE INDEX "invitation_invitedById_idx" ON "invitation"("invitedById");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE INDEX "session_userId_activeOrganizationId_idx" ON "session"("userId", "activeOrganizationId");

-- CreateIndex
CREATE INDEX "user_deletedAt_idx" ON "user"("deletedAt");

-- CreateIndex
CREATE INDEX "user_isVerifiedAuthor_idx" ON "user"("isVerifiedAuthor");

-- CreateIndex
CREATE INDEX "user_isSuspended_idx" ON "user"("isSuspended");

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twofactor" ADD CONSTRAINT "twofactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backupcode" ADD CONSTRAINT "backupcode_twoFactorId_fkey" FOREIGN KEY ("twoFactorId") REFERENCES "twofactor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdpJoin" ADD CONSTRAINT "PdpJoin_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdpJoin" ADD CONSTRAINT "PdpJoin_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdp_urls" ADD CONSTRAINT "pdp_urls_pdpJoinId_fkey" FOREIGN KEY ("pdpJoinId") REFERENCES "PdpJoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_identifiers" ADD CONSTRAINT "product_identifiers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_identifiers" ADD CONSTRAINT "product_identifiers_pdpJoinId_fkey" FOREIGN KEY ("pdpJoinId") REFERENCES "PdpJoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_identifiers" ADD CONSTRAINT "product_identifiers_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_identifiers" ADD CONSTRAINT "product_identifiers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cast" ADD CONSTRAINT "Cast_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fandom" ADD CONSTRAINT "Fandom_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "Taxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_pdpJoinId_fkey" FOREIGN KEY ("pdpJoinId") REFERENCES "PdpJoin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_fandomId_fkey" FOREIGN KEY ("fandomId") REFERENCES "Fandom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_fandomId_fkey" FOREIGN KEY ("fandomId") REFERENCES "Fandom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxonomy" ADD CONSTRAINT "Taxonomy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Taxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxonomy" ADD CONSTRAINT "Taxonomy_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jolly_roger" ADD CONSTRAINT "jolly_roger_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jr_extraction_rules" ADD CONSTRAINT "jr_extraction_rules_jollyRogerId_fkey" FOREIGN KEY ("jollyRogerId") REFERENCES "jolly_roger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteJoin" ADD CONSTRAINT "FavoriteJoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteJoin" ADD CONSTRAINT "FavoriteJoin_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteJoin" ADD CONSTRAINT "FavoriteJoin_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewVoteJoin" ADD CONSTRAINT "ReviewVoteJoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewVoteJoin" ADD CONSTRAINT "ReviewVoteJoin_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_parentTransactionId_fkey" FOREIGN KEY ("parentTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registry" ADD CONSTRAINT "Registry_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registry" ADD CONSTRAINT "Registry_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryItem" ADD CONSTRAINT "RegistryItem_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryItem" ADD CONSTRAINT "RegistryItem_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryItem" ADD CONSTRAINT "RegistryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryItem" ADD CONSTRAINT "RegistryItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryPurchaseJoin" ADD CONSTRAINT "RegistryPurchaseJoin_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryPurchaseJoin" ADD CONSTRAINT "RegistryPurchaseJoin_registryItemId_fkey" FOREIGN KEY ("registryItemId") REFERENCES "RegistryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryUserJoin" ADD CONSTRAINT "RegistryUserJoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryUserJoin" ADD CONSTRAINT "RegistryUserJoin_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "Registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_retryOfExecutionId_fkey" FOREIGN KEY ("retryOfExecutionId") REFERENCES "workflow_execution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_schedule" ADD CONSTRAINT "workflow_schedule_configId_fkey" FOREIGN KEY ("configId") REFERENCES "workflow_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_checkpoint" ADD CONSTRAINT "workflow_checkpoint_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "workflow_execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_metrics" ADD CONSTRAINT "workflow_metrics_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "workflow_execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_service_usage" ADD CONSTRAINT "workflow_service_usage_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "workflow_execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_alert" ADD CONSTRAINT "workflow_alert_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "workflow_execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductTaxonomy" ADD CONSTRAINT "_ProductTaxonomy_A_fkey" FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductTaxonomy" ADD CONSTRAINT "_ProductTaxonomy_B_fkey" FOREIGN KEY ("B") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCategories" ADD CONSTRAINT "_ProductCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCategories" ADD CONSTRAINT "_ProductCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductSeries" ADD CONSTRAINT "_ProductSeries_A_fkey" FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductSeries" ADD CONSTRAINT "_ProductSeries_B_fkey" FOREIGN KEY ("B") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductStory" ADD CONSTRAINT "_ProductStory_A_fkey" FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductStory" ADD CONSTRAINT "_ProductStory_B_fkey" FOREIGN KEY ("B") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PdpJoinTaxonomy" ADD CONSTRAINT "_PdpJoinTaxonomy_A_fkey" FOREIGN KEY ("A") REFERENCES "PdpJoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PdpJoinTaxonomy" ADD CONSTRAINT "_PdpJoinTaxonomy_B_fkey" FOREIGN KEY ("B") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToCollection" ADD CONSTRAINT "_BrandToCollection_A_fkey" FOREIGN KEY ("A") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToCollection" ADD CONSTRAINT "_BrandToCollection_B_fkey" FOREIGN KEY ("B") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToJrFindReplaceReject" ADD CONSTRAINT "_BrandToJrFindReplaceReject_A_fkey" FOREIGN KEY ("A") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToJrFindReplaceReject" ADD CONSTRAINT "_BrandToJrFindReplaceReject_B_fkey" FOREIGN KEY ("B") REFERENCES "JrFindReplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PdpJoinManufacturerBrands" ADD CONSTRAINT "_PdpJoinManufacturerBrands_A_fkey" FOREIGN KEY ("A") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PdpJoinManufacturerBrands" ADD CONSTRAINT "_PdpJoinManufacturerBrands_B_fkey" FOREIGN KEY ("B") REFERENCES "PdpJoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCast" ADD CONSTRAINT "_ProductCast_A_fkey" FOREIGN KEY ("A") REFERENCES "Cast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCast" ADD CONSTRAINT "_ProductCast_B_fkey" FOREIGN KEY ("B") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CastToJrFindReplaceReject" ADD CONSTRAINT "_CastToJrFindReplaceReject_A_fkey" FOREIGN KEY ("A") REFERENCES "Cast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CastToJrFindReplaceReject" ADD CONSTRAINT "_CastToJrFindReplaceReject_B_fkey" FOREIGN KEY ("B") REFERENCES "JrFindReplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCollection" ADD CONSTRAINT "_ProductCollection_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCollection" ADD CONSTRAINT "_ProductCollection_B_fkey" FOREIGN KEY ("B") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToTaxonomy" ADD CONSTRAINT "_CollectionToTaxonomy_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToTaxonomy" ADD CONSTRAINT "_CollectionToTaxonomy_B_fkey" FOREIGN KEY ("B") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToCategory" ADD CONSTRAINT "_CollectionToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToCategory" ADD CONSTRAINT "_CollectionToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PdpJoinCollection" ADD CONSTRAINT "_PdpJoinCollection_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PdpJoinCollection" ADD CONSTRAINT "_PdpJoinCollection_B_fkey" FOREIGN KEY ("B") REFERENCES "PdpJoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductFandom" ADD CONSTRAINT "_ProductFandom_A_fkey" FOREIGN KEY ("A") REFERENCES "Fandom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductFandom" ADD CONSTRAINT "_ProductFandom_B_fkey" FOREIGN KEY ("B") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FandomToLocation" ADD CONSTRAINT "_FandomToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "Fandom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FandomToLocation" ADD CONSTRAINT "_FandomToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FandomToJrFindReplaceReject" ADD CONSTRAINT "_FandomToJrFindReplaceReject_A_fkey" FOREIGN KEY ("A") REFERENCES "Fandom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FandomToJrFindReplaceReject" ADD CONSTRAINT "_FandomToJrFindReplaceReject_B_fkey" FOREIGN KEY ("B") REFERENCES "JrFindReplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductLocation" ADD CONSTRAINT "_ProductLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductLocation" ADD CONSTRAINT "_ProductLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PdpJoinLocation" ADD CONSTRAINT "_PdpJoinLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PdpJoinLocation" ADD CONSTRAINT "_PdpJoinLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "PdpJoin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaxonomyLocation" ADD CONSTRAINT "_TaxonomyLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaxonomyLocation" ADD CONSTRAINT "_TaxonomyLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JrExtractionRuleToJrFindReplaceReject" ADD CONSTRAINT "_JrExtractionRuleToJrFindReplaceReject_A_fkey" FOREIGN KEY ("A") REFERENCES "jr_extraction_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JrExtractionRuleToJrFindReplaceReject" ADD CONSTRAINT "_JrExtractionRuleToJrFindReplaceReject_B_fkey" FOREIGN KEY ("B") REFERENCES "JrFindReplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JrFindReplaceRejectToLocation" ADD CONSTRAINT "_JrFindReplaceRejectToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "JrFindReplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JrFindReplaceRejectToLocation" ADD CONSTRAINT "_JrFindReplaceRejectToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JrFindReplaceRejectToTaxonomy" ADD CONSTRAINT "_JrFindReplaceRejectToTaxonomy_A_fkey" FOREIGN KEY ("A") REFERENCES "JrFindReplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JrFindReplaceRejectToTaxonomy" ADD CONSTRAINT "_JrFindReplaceRejectToTaxonomy_B_fkey" FOREIGN KEY ("B") REFERENCES "Taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JrFindReplaceRejectToStory" ADD CONSTRAINT "_JrFindReplaceRejectToStory_A_fkey" FOREIGN KEY ("A") REFERENCES "JrFindReplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JrFindReplaceRejectToStory" ADD CONSTRAINT "_JrFindReplaceRejectToStory_B_fkey" FOREIGN KEY ("B") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JrFindReplaceRejectToSeries" ADD CONSTRAINT "_JrFindReplaceRejectToSeries_A_fkey" FOREIGN KEY ("A") REFERENCES "JrFindReplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JrFindReplaceRejectToSeries" ADD CONSTRAINT "_JrFindReplaceRejectToSeries_B_fkey" FOREIGN KEY ("B") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
