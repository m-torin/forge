"use server";

import { prisma } from "../index";
import type { Prisma } from "../generated/client/index";

//==============================================================================
// PRODUCT CRUD OPERATIONS
//==============================================================================

export async function createProduct(args: Prisma.ProductCreateArgs) {
  return prisma.product.create(args);
}

export async function findManyProducts(args?: Prisma.ProductFindManyArgs) {
  return prisma.product.findMany(args);
}

export async function findUniqueProduct(args: Prisma.ProductFindUniqueArgs) {
  return prisma.product.findUnique(args);
}

export async function findFirstProduct(args?: Prisma.ProductFindFirstArgs) {
  return prisma.product.findFirst(args);
}

export async function updateProduct(args: Prisma.ProductUpdateArgs) {
  return prisma.product.update(args);
}

export async function updateManyProducts(args: Prisma.ProductUpdateManyArgs) {
  return prisma.product.updateMany(args);
}

export async function upsertProduct(args: Prisma.ProductUpsertArgs) {
  return prisma.product.upsert(args);
}

export async function deleteProduct(args: Prisma.ProductDeleteArgs) {
  return prisma.product.delete(args);
}

export async function deleteManyProducts(args?: Prisma.ProductDeleteManyArgs) {
  return prisma.product.deleteMany(args);
}

export async function countProducts(args?: Prisma.ProductCountArgs) {
  return prisma.product.count(args);
}

export async function aggregateProducts(args = {}) {
  return prisma.product.aggregate(args);
}

export async function groupByProducts(args: Prisma.ProductGroupByArgs) {
  return prisma.product.groupBy(args);
}

//==============================================================================
// PRODUCT BARCODE CRUD OPERATIONS
//==============================================================================

export async function createProductBarcode(args: Prisma.ProductBarcodeCreateArgs) {
  return prisma.productBarcode.create(args);
}

export async function findManyProductBarcodes(args?: Prisma.ProductBarcodeFindManyArgs) {
  return prisma.productBarcode.findMany(args);
}

export async function findUniqueProductBarcode(args: Prisma.ProductBarcodeFindUniqueArgs) {
  return prisma.productBarcode.findUnique(args);
}

export async function findFirstProductBarcode(args?: Prisma.ProductBarcodeFindFirstArgs) {
  return prisma.productBarcode.findFirst(args);
}

export async function updateProductBarcode(args: Prisma.ProductBarcodeUpdateArgs) {
  return prisma.productBarcode.update(args);
}

export async function updateManyProductBarcodes(args: Prisma.ProductBarcodeUpdateManyArgs) {
  return prisma.productBarcode.updateMany(args);
}

export async function upsertProductBarcode(args: Prisma.ProductBarcodeUpsertArgs) {
  return prisma.productBarcode.upsert(args);
}

export async function deleteProductBarcode(args: Prisma.ProductBarcodeDeleteArgs) {
  return prisma.productBarcode.delete(args);
}

export async function deleteManyProductBarcodes(args?: Prisma.ProductBarcodeDeleteManyArgs) {
  return prisma.productBarcode.deleteMany(args);
}

export async function countProductBarcodes(args?: Prisma.ProductBarcodeCountArgs) {
  return prisma.productBarcode.count(args);
}

//==============================================================================
// PRODUCT ASSET CRUD OPERATIONS
//==============================================================================

export async function createProductAsset(args: Prisma.ProductAssetCreateArgs) {
  return prisma.productAsset.create(args);
}

export async function findManyProductAssets(args?: Prisma.ProductAssetFindManyArgs) {
  return prisma.productAsset.findMany(args);
}

export async function findUniqueProductAsset(args: Prisma.ProductAssetFindUniqueArgs) {
  return prisma.productAsset.findUnique(args);
}

export async function findFirstProductAsset(args?: Prisma.ProductAssetFindFirstArgs) {
  return prisma.productAsset.findFirst(args);
}

export async function updateProductAsset(args: Prisma.ProductAssetUpdateArgs) {
  return prisma.productAsset.update(args);
}

export async function updateManyProductAssets(args: Prisma.ProductAssetUpdateManyArgs) {
  return prisma.productAsset.updateMany(args);
}

export async function upsertProductAsset(args: Prisma.ProductAssetUpsertArgs) {
  return prisma.productAsset.upsert(args);
}

export async function deleteProductAsset(args: Prisma.ProductAssetDeleteArgs) {
  return prisma.productAsset.delete(args);
}

export async function deleteManyProductAssets(args?: Prisma.ProductAssetDeleteManyArgs) {
  return prisma.productAsset.deleteMany(args);
}

export async function countProductAssets(args?: Prisma.ProductAssetCountArgs) {
  return prisma.productAsset.count(args);
}

//==============================================================================
// SCAN HISTORY CRUD OPERATIONS
//==============================================================================

export async function createScanHistory(args: Prisma.ScanHistoryCreateArgs) {
  return prisma.scanHistory.create(args);
}

export async function findManyScanHistories(args?: Prisma.ScanHistoryFindManyArgs) {
  return prisma.scanHistory.findMany(args);
}

export async function findUniqueScanHistory(args: Prisma.ScanHistoryFindUniqueArgs) {
  return prisma.scanHistory.findUnique(args);
}

export async function findFirstScanHistory(args?: Prisma.ScanHistoryFindFirstArgs) {
  return prisma.scanHistory.findFirst(args);
}

export async function updateScanHistory(args: Prisma.ScanHistoryUpdateArgs) {
  return prisma.scanHistory.update(args);
}

export async function updateManyScanHistories(args: Prisma.ScanHistoryUpdateManyArgs) {
  return prisma.scanHistory.updateMany(args);
}

export async function upsertScanHistory(args: Prisma.ScanHistoryUpsertArgs) {
  return prisma.scanHistory.upsert(args);
}

export async function deleteScanHistory(args: Prisma.ScanHistoryDeleteArgs) {
  return prisma.scanHistory.delete(args);
}

export async function deleteManyScanHistories(args?: Prisma.ScanHistoryDeleteManyArgs) {
  return prisma.scanHistory.deleteMany(args);
}

export async function countScanHistories(args?: Prisma.ScanHistoryCountArgs) {
  return prisma.scanHistory.count(args);
}

//==============================================================================
// PRODUCT CATEGORY CRUD OPERATIONS
//==============================================================================

export async function createProductCategory(args: Prisma.ProductCategoryCreateArgs) {
  return prisma.productCategory.create(args);
}

export async function findManyProductCategories(args?: Prisma.ProductCategoryFindManyArgs) {
  return prisma.productCategory.findMany(args);
}

export async function findUniqueProductCategory(args: Prisma.ProductCategoryFindUniqueArgs) {
  return prisma.productCategory.findUnique(args);
}

export async function findFirstProductCategory(args?: Prisma.ProductCategoryFindFirstArgs) {
  return prisma.productCategory.findFirst(args);
}

export async function updateProductCategory(args: Prisma.ProductCategoryUpdateArgs) {
  return prisma.productCategory.update(args);
}

export async function updateManyProductCategories(args: Prisma.ProductCategoryUpdateManyArgs) {
  return prisma.productCategory.updateMany(args);
}

export async function upsertProductCategory(args: Prisma.ProductCategoryUpsertArgs) {
  return prisma.productCategory.upsert(args);
}

export async function deleteProductCategory(args: Prisma.ProductCategoryDeleteArgs) {
  return prisma.productCategory.delete(args);
}

export async function deleteManyProductCategories(args?: Prisma.ProductCategoryDeleteManyArgs) {
  return prisma.productCategory.deleteMany(args);
}

export async function countProductCategories(args?: Prisma.ProductCategoryCountArgs) {
  return prisma.productCategory.count(args);
}

//==============================================================================
// BRAND CRUD OPERATIONS
//==============================================================================

export async function createBrand(args: Prisma.BrandCreateArgs) {
  return prisma.brand.create(args);
}

export async function findManyBrands(args?: Prisma.BrandFindManyArgs) {
  return prisma.brand.findMany(args);
}

export async function findUniqueBrand(args: Prisma.BrandFindUniqueArgs) {
  return prisma.brand.findUnique(args);
}

export async function findFirstBrand(args?: Prisma.BrandFindFirstArgs) {
  return prisma.brand.findFirst(args);
}

export async function updateBrand(args: Prisma.BrandUpdateArgs) {
  return prisma.brand.update(args);
}

export async function updateManyBrands(args: Prisma.BrandUpdateManyArgs) {
  return prisma.brand.updateMany(args);
}

export async function upsertBrand(args: Prisma.BrandUpsertArgs) {
  return prisma.brand.upsert(args);
}

export async function deleteBrand(args: Prisma.BrandDeleteArgs) {
  return prisma.brand.delete(args);
}

export async function deleteManyBrands(args?: Prisma.BrandDeleteManyArgs) {
  return prisma.brand.deleteMany(args);
}

export async function countBrands(args?: Prisma.BrandCountArgs) {
  return prisma.brand.count(args);
}

//==============================================================================
// COLLECTION CRUD OPERATIONS
//==============================================================================

export async function createCollection(args: Prisma.CollectionCreateArgs) {
  return prisma.collection.create(args);
}

export async function findManyCollections(args?: Prisma.CollectionFindManyArgs) {
  return prisma.collection.findMany(args);
}

export async function findUniqueCollection(args: Prisma.CollectionFindUniqueArgs) {
  return prisma.collection.findUnique(args);
}

export async function findFirstCollection(args?: Prisma.CollectionFindFirstArgs) {
  return prisma.collection.findFirst(args);
}

export async function updateCollection(args: Prisma.CollectionUpdateArgs) {
  return prisma.collection.update(args);
}

export async function updateManyCollections(args: Prisma.CollectionUpdateManyArgs) {
  return prisma.collection.updateMany(args);
}

export async function upsertCollection(args: Prisma.CollectionUpsertArgs) {
  return prisma.collection.upsert(args);
}

export async function deleteCollection(args: Prisma.CollectionDeleteArgs) {
  return prisma.collection.delete(args);
}

export async function deleteManyCollections(args?: Prisma.CollectionDeleteManyArgs) {
  return prisma.collection.deleteMany(args);
}

export async function countCollections(args?: Prisma.CollectionCountArgs) {
  return prisma.collection.count(args);
}

//==============================================================================
// TAXONOMY CRUD OPERATIONS
//==============================================================================

export async function createTaxonomy(args: Prisma.TaxonomyCreateArgs) {
  return prisma.taxonomy.create(args);
}

export async function findManyTaxonomies(args?: Prisma.TaxonomyFindManyArgs) {
  return prisma.taxonomy.findMany(args);
}

export async function findUniqueTaxonomy(args: Prisma.TaxonomyFindUniqueArgs) {
  return prisma.taxonomy.findUnique(args);
}

export async function findFirstTaxonomy(args?: Prisma.TaxonomyFindFirstArgs) {
  return prisma.taxonomy.findFirst(args);
}

export async function updateTaxonomy(args: Prisma.TaxonomyUpdateArgs) {
  return prisma.taxonomy.update(args);
}

export async function updateManyTaxonomies(args: Prisma.TaxonomyUpdateManyArgs) {
  return prisma.taxonomy.updateMany(args);
}

export async function upsertTaxonomy(args: Prisma.TaxonomyUpsertArgs) {
  return prisma.taxonomy.upsert(args);
}

export async function deleteTaxonomy(args: Prisma.TaxonomyDeleteArgs) {
  return prisma.taxonomy.delete(args);
}

export async function deleteManyTaxonomies(args?: Prisma.TaxonomyDeleteManyArgs) {
  return prisma.taxonomy.deleteMany(args);
}

export async function countTaxonomies(args?: Prisma.TaxonomyCountArgs) {
  return prisma.taxonomy.count(args);
}

//==============================================================================
// MEDIA CRUD OPERATIONS
//==============================================================================

export async function createMedia(args: Prisma.MediaCreateArgs) {
  return prisma.media.create(args);
}

export async function findManyMedia(args?: Prisma.MediaFindManyArgs) {
  return prisma.media.findMany(args);
}

export async function findUniqueMedia(args: Prisma.MediaFindUniqueArgs) {
  return prisma.media.findUnique(args);
}

export async function findFirstMedia(args?: Prisma.MediaFindFirstArgs) {
  return prisma.media.findFirst(args);
}

export async function updateMedia(args: Prisma.MediaUpdateArgs) {
  return prisma.media.update(args);
}

export async function updateManyMedia(args: Prisma.MediaUpdateManyArgs) {
  return prisma.media.updateMany(args);
}

export async function upsertMedia(args: Prisma.MediaUpsertArgs) {
  return prisma.media.upsert(args);
}

export async function deleteMedia(args: Prisma.MediaDeleteArgs) {
  return prisma.media.delete(args);
}

export async function deleteManyMedia(args?: Prisma.MediaDeleteManyArgs) {
  return prisma.media.deleteMany(args);
}

export async function countMedia(args?: Prisma.MediaCountArgs) {
  return prisma.media.count(args);
}

//==============================================================================
// PDP JOIN CRUD OPERATIONS
//==============================================================================

export async function createPdpJoin(args: Prisma.PdpJoinCreateArgs) {
  return prisma.pdpJoin.create(args);
}

export async function findManyPdpJoins(args?: Prisma.PdpJoinFindManyArgs) {
  return prisma.pdpJoin.findMany(args);
}

export async function findUniquePdpJoin(args: Prisma.PdpJoinFindUniqueArgs) {
  return prisma.pdpJoin.findUnique(args);
}

export async function findFirstPdpJoin(args?: Prisma.PdpJoinFindFirstArgs) {
  return prisma.pdpJoin.findFirst(args);
}

export async function updatePdpJoin(args: Prisma.PdpJoinUpdateArgs) {
  return prisma.pdpJoin.update(args);
}

export async function updateManyPdpJoins(args: Prisma.PdpJoinUpdateManyArgs) {
  return prisma.pdpJoin.updateMany(args);
}

export async function upsertPdpJoin(args: Prisma.PdpJoinUpsertArgs) {
  return prisma.pdpJoin.upsert(args);
}

export async function deletePdpJoin(args: Prisma.PdpJoinDeleteArgs) {
  return prisma.pdpJoin.delete(args);
}

export async function deleteManyPdpJoins(args?: Prisma.PdpJoinDeleteManyArgs) {
  return prisma.pdpJoin.deleteMany(args);
}

export async function countPdpJoins(args?: Prisma.PdpJoinCountArgs) {
  return prisma.pdpJoin.count(args);
}