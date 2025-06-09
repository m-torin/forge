"use server";

import { database } from "../index";
import type { Prisma } from "../generated/client/index";

//==============================================================================
// PRODUCT CRUD OPERATIONS
//==============================================================================

export async function createProduct(data: Prisma.ProductCreateInput) {
  return database.product.create({ data });
}

export async function findManyProducts(args?: Prisma.ProductFindManyArgs) {
  return database.product.findMany(args);
}

export async function findUniqueProduct(args: Prisma.ProductFindUniqueArgs) {
  return database.product.findUnique(args);
}

export async function findFirstProduct(args?: Prisma.ProductFindFirstArgs) {
  return database.product.findFirst(args);
}

export async function updateProduct(args: Prisma.ProductUpdateArgs) {
  return database.product.update(args);
}

export async function updateManyProducts(args: Prisma.ProductUpdateManyArgs) {
  return database.product.updateMany(args);
}

export async function upsertProduct(args: Prisma.ProductUpsertArgs) {
  return database.product.upsert(args);
}

export async function deleteProduct(args: Prisma.ProductDeleteArgs) {
  return database.product.delete(args);
}

export async function deleteManyProducts(args?: Prisma.ProductDeleteManyArgs) {
  return database.product.deleteMany(args);
}

export async function countProducts(args?: Prisma.ProductCountArgs) {
  return database.product.count(args);
}

export async function aggregateProducts(args?: Prisma.ProductAggregateArgs) {
  return database.product.aggregate(args);
}

export async function groupByProducts(args: Prisma.ProductGroupByArgs) {
  return database.product.groupBy(args);
}

//==============================================================================
// PRODUCT BARCODE CRUD OPERATIONS
//==============================================================================

export async function createProductBarcode(data: Prisma.ProductBarcodeCreateInput) {
  return database.productBarcode.create({ data });
}

export async function findManyProductBarcodes(args?: Prisma.ProductBarcodeFindManyArgs) {
  return database.productBarcode.findMany(args);
}

export async function findUniqueProductBarcode(args: Prisma.ProductBarcodeFindUniqueArgs) {
  return database.productBarcode.findUnique(args);
}

export async function findFirstProductBarcode(args?: Prisma.ProductBarcodeFindFirstArgs) {
  return database.productBarcode.findFirst(args);
}

export async function updateProductBarcode(args: Prisma.ProductBarcodeUpdateArgs) {
  return database.productBarcode.update(args);
}

export async function updateManyProductBarcodes(args: Prisma.ProductBarcodeUpdateManyArgs) {
  return database.productBarcode.updateMany(args);
}

export async function upsertProductBarcode(args: Prisma.ProductBarcodeUpsertArgs) {
  return database.productBarcode.upsert(args);
}

export async function deleteProductBarcode(args: Prisma.ProductBarcodeDeleteArgs) {
  return database.productBarcode.delete(args);
}

export async function deleteManyProductBarcodes(args?: Prisma.ProductBarcodeDeleteManyArgs) {
  return database.productBarcode.deleteMany(args);
}

export async function countProductBarcodes(args?: Prisma.ProductBarcodeCountArgs) {
  return database.productBarcode.count(args);
}

//==============================================================================
// PRODUCT ASSET CRUD OPERATIONS
//==============================================================================

export async function createProductAsset(data: Prisma.ProductAssetCreateInput) {
  return database.productAsset.create({ data });
}

export async function findManyProductAssets(args?: Prisma.ProductAssetFindManyArgs) {
  return database.productAsset.findMany(args);
}

export async function findUniqueProductAsset(args: Prisma.ProductAssetFindUniqueArgs) {
  return database.productAsset.findUnique(args);
}

export async function findFirstProductAsset(args?: Prisma.ProductAssetFindFirstArgs) {
  return database.productAsset.findFirst(args);
}

export async function updateProductAsset(args: Prisma.ProductAssetUpdateArgs) {
  return database.productAsset.update(args);
}

export async function updateManyProductAssets(args: Prisma.ProductAssetUpdateManyArgs) {
  return database.productAsset.updateMany(args);
}

export async function upsertProductAsset(args: Prisma.ProductAssetUpsertArgs) {
  return database.productAsset.upsert(args);
}

export async function deleteProductAsset(args: Prisma.ProductAssetDeleteArgs) {
  return database.productAsset.delete(args);
}

export async function deleteManyProductAssets(args?: Prisma.ProductAssetDeleteManyArgs) {
  return database.productAsset.deleteMany(args);
}

export async function countProductAssets(args?: Prisma.ProductAssetCountArgs) {
  return database.productAsset.count(args);
}

//==============================================================================
// SCAN HISTORY CRUD OPERATIONS
//==============================================================================

export async function createScanHistory(data: Prisma.ScanHistoryCreateInput) {
  return database.scanHistory.create({ data });
}

export async function findManyScanHistories(args?: Prisma.ScanHistoryFindManyArgs) {
  return database.scanHistory.findMany(args);
}

export async function findUniqueScanHistory(args: Prisma.ScanHistoryFindUniqueArgs) {
  return database.scanHistory.findUnique(args);
}

export async function findFirstScanHistory(args?: Prisma.ScanHistoryFindFirstArgs) {
  return database.scanHistory.findFirst(args);
}

export async function updateScanHistory(args: Prisma.ScanHistoryUpdateArgs) {
  return database.scanHistory.update(args);
}

export async function updateManyScanHistories(args: Prisma.ScanHistoryUpdateManyArgs) {
  return database.scanHistory.updateMany(args);
}

export async function upsertScanHistory(args: Prisma.ScanHistoryUpsertArgs) {
  return database.scanHistory.upsert(args);
}

export async function deleteScanHistory(args: Prisma.ScanHistoryDeleteArgs) {
  return database.scanHistory.delete(args);
}

export async function deleteManyScanHistories(args?: Prisma.ScanHistoryDeleteManyArgs) {
  return database.scanHistory.deleteMany(args);
}

export async function countScanHistories(args?: Prisma.ScanHistoryCountArgs) {
  return database.scanHistory.count(args);
}

//==============================================================================
// PRODUCT CATEGORY CRUD OPERATIONS
//==============================================================================

export async function createProductCategory(data: Prisma.ProductCategoryCreateInput) {
  return database.productCategory.create({ data });
}

export async function findManyProductCategories(args?: Prisma.ProductCategoryFindManyArgs) {
  return database.productCategory.findMany(args);
}

export async function findUniqueProductCategory(args: Prisma.ProductCategoryFindUniqueArgs) {
  return database.productCategory.findUnique(args);
}

export async function findFirstProductCategory(args?: Prisma.ProductCategoryFindFirstArgs) {
  return database.productCategory.findFirst(args);
}

export async function updateProductCategory(args: Prisma.ProductCategoryUpdateArgs) {
  return database.productCategory.update(args);
}

export async function updateManyProductCategories(args: Prisma.ProductCategoryUpdateManyArgs) {
  return database.productCategory.updateMany(args);
}

export async function upsertProductCategory(args: Prisma.ProductCategoryUpsertArgs) {
  return database.productCategory.upsert(args);
}

export async function deleteProductCategory(args: Prisma.ProductCategoryDeleteArgs) {
  return database.productCategory.delete(args);
}

export async function deleteManyProductCategories(args?: Prisma.ProductCategoryDeleteManyArgs) {
  return database.productCategory.deleteMany(args);
}

export async function countProductCategories(args?: Prisma.ProductCategoryCountArgs) {
  return database.productCategory.count(args);
}

//==============================================================================
// BRAND CRUD OPERATIONS
//==============================================================================

export async function createBrand(data: Prisma.BrandCreateInput) {
  return database.brand.create({ data });
}

export async function findManyBrands(args?: Prisma.BrandFindManyArgs) {
  return database.brand.findMany(args);
}

export async function findUniqueBrand(args: Prisma.BrandFindUniqueArgs) {
  return database.brand.findUnique(args);
}

export async function findFirstBrand(args?: Prisma.BrandFindFirstArgs) {
  return database.brand.findFirst(args);
}

export async function updateBrand(args: Prisma.BrandUpdateArgs) {
  return database.brand.update(args);
}

export async function updateManyBrands(args: Prisma.BrandUpdateManyArgs) {
  return database.brand.updateMany(args);
}

export async function upsertBrand(args: Prisma.BrandUpsertArgs) {
  return database.brand.upsert(args);
}

export async function deleteBrand(args: Prisma.BrandDeleteArgs) {
  return database.brand.delete(args);
}

export async function deleteManyBrands(args?: Prisma.BrandDeleteManyArgs) {
  return database.brand.deleteMany(args);
}

export async function countBrands(args?: Prisma.BrandCountArgs) {
  return database.brand.count(args);
}

//==============================================================================
// COLLECTION CRUD OPERATIONS
//==============================================================================

export async function createCollection(data: Prisma.CollectionCreateInput) {
  return database.collection.create({ data });
}

export async function findManyCollections(args?: Prisma.CollectionFindManyArgs) {
  return database.collection.findMany(args);
}

export async function findUniqueCollection(args: Prisma.CollectionFindUniqueArgs) {
  return database.collection.findUnique(args);
}

export async function findFirstCollection(args?: Prisma.CollectionFindFirstArgs) {
  return database.collection.findFirst(args);
}

export async function updateCollection(args: Prisma.CollectionUpdateArgs) {
  return database.collection.update(args);
}

export async function updateManyCollections(args: Prisma.CollectionUpdateManyArgs) {
  return database.collection.updateMany(args);
}

export async function upsertCollection(args: Prisma.CollectionUpsertArgs) {
  return database.collection.upsert(args);
}

export async function deleteCollection(args: Prisma.CollectionDeleteArgs) {
  return database.collection.delete(args);
}

export async function deleteManyCollections(args?: Prisma.CollectionDeleteManyArgs) {
  return database.collection.deleteMany(args);
}

export async function countCollections(args?: Prisma.CollectionCountArgs) {
  return database.collection.count(args);
}

//==============================================================================
// TAXONOMY CRUD OPERATIONS
//==============================================================================

export async function createTaxonomy(data: Prisma.TaxonomyCreateInput) {
  return database.taxonomy.create({ data });
}

export async function findManyTaxonomies(args?: Prisma.TaxonomyFindManyArgs) {
  return database.taxonomy.findMany(args);
}

export async function findUniqueTaxonomy(args: Prisma.TaxonomyFindUniqueArgs) {
  return database.taxonomy.findUnique(args);
}

export async function findFirstTaxonomy(args?: Prisma.TaxonomyFindFirstArgs) {
  return database.taxonomy.findFirst(args);
}

export async function updateTaxonomy(args: Prisma.TaxonomyUpdateArgs) {
  return database.taxonomy.update(args);
}

export async function updateManyTaxonomies(args: Prisma.TaxonomyUpdateManyArgs) {
  return database.taxonomy.updateMany(args);
}

export async function upsertTaxonomy(args: Prisma.TaxonomyUpsertArgs) {
  return database.taxonomy.upsert(args);
}

export async function deleteTaxonomy(args: Prisma.TaxonomyDeleteArgs) {
  return database.taxonomy.delete(args);
}

export async function deleteManyTaxonomies(args?: Prisma.TaxonomyDeleteManyArgs) {
  return database.taxonomy.deleteMany(args);
}

export async function countTaxonomies(args?: Prisma.TaxonomyCountArgs) {
  return database.taxonomy.count(args);
}

//==============================================================================
// MEDIA CRUD OPERATIONS
//==============================================================================

export async function createMedia(data: Prisma.MediaCreateInput) {
  return database.media.create({ data });
}

export async function findManyMedia(args?: Prisma.MediaFindManyArgs) {
  return database.media.findMany(args);
}

export async function findUniqueMedia(args: Prisma.MediaFindUniqueArgs) {
  return database.media.findUnique(args);
}

export async function findFirstMedia(args?: Prisma.MediaFindFirstArgs) {
  return database.media.findFirst(args);
}

export async function updateMedia(args: Prisma.MediaUpdateArgs) {
  return database.media.update(args);
}

export async function updateManyMedia(args: Prisma.MediaUpdateManyArgs) {
  return database.media.updateMany(args);
}

export async function upsertMedia(args: Prisma.MediaUpsertArgs) {
  return database.media.upsert(args);
}

export async function deleteMedia(args: Prisma.MediaDeleteArgs) {
  return database.media.delete(args);
}

export async function deleteManyMedia(args?: Prisma.MediaDeleteManyArgs) {
  return database.media.deleteMany(args);
}

export async function countMedia(args?: Prisma.MediaCountArgs) {
  return database.media.count(args);
}

//==============================================================================
// PDP JOIN CRUD OPERATIONS
//==============================================================================

export async function createPdpJoin(data: Prisma.PdpJoinCreateInput) {
  return database.pdpJoin.create({ data });
}

export async function findManyPdpJoins(args?: Prisma.PdpJoinFindManyArgs) {
  return database.pdpJoin.findMany(args);
}

export async function findUniquePdpJoin(args: Prisma.PdpJoinFindUniqueArgs) {
  return database.pdpJoin.findUnique(args);
}

export async function findFirstPdpJoin(args?: Prisma.PdpJoinFindFirstArgs) {
  return database.pdpJoin.findFirst(args);
}

export async function updatePdpJoin(args: Prisma.PdpJoinUpdateArgs) {
  return database.pdpJoin.update(args);
}

export async function updateManyPdpJoins(args: Prisma.PdpJoinUpdateManyArgs) {
  return database.pdpJoin.updateMany(args);
}

export async function upsertPdpJoin(args: Prisma.PdpJoinUpsertArgs) {
  return database.pdpJoin.upsert(args);
}

export async function deletePdpJoin(args: Prisma.PdpJoinDeleteArgs) {
  return database.pdpJoin.delete(args);
}

export async function deleteManyPdpJoins(args?: Prisma.PdpJoinDeleteManyArgs) {
  return database.pdpJoin.deleteMany(args);
}

export async function countPdpJoins(args?: Prisma.PdpJoinCountArgs) {
  return database.pdpJoin.count(args);
}