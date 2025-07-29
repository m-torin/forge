import { InventoryTransactionType, type Prisma } from '../../../../../prisma-generated/client';

export interface InventoryConfig {
  productId?: string;
  variantId?: string;
  locationId: string;
  locationName: string;
  baseQuantity: number;
  lowStockThreshold: number;
}

export function createInventoryRecord(config: InventoryConfig): Prisma.InventoryCreateInput {
  const quantity = config.baseQuantity;
  const reserved = Math.floor(quantity * 0.1); // 10% typically reserved for pending orders
  const available = quantity - reserved;

  return {
    quantity,
    reserved,
    available,
    lowStockThreshold: config.lowStockThreshold,
    locationId: config.locationId,
    locationName: config.locationName,
    lastRestockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within last 30 days
    product: config.productId ? { connect: { id: config.productId } } : undefined,
    variant: config.variantId ? { connect: { id: config.variantId } } : undefined,
    metadata: {
      reorderPoint: config.lowStockThreshold * 2,
      reorderQuantity: config.baseQuantity,
      supplier: 'Default Supplier',
    },
  };
}

export function generateStockLevels(_productType: string): {
  baseQuantity: number;
  lowStockThreshold: number;
} {
  // Different stock levels based on product type
  const stockProfiles = {
    popular: { baseQuantity: 500, lowStockThreshold: 50 },
    standard: { baseQuantity: 200, lowStockThreshold: 20 },
    limited: { baseQuantity: 50, lowStockThreshold: 5 },
    clearance: { baseQuantity: 100, lowStockThreshold: 10 },
  };

  // Randomly assign stock profile with weighted distribution
  const random = Math.random();
  if (random < 0.1) return stockProfiles.popular;
  if (random < 0.3) return stockProfiles.limited;
  if (random < 0.4) return stockProfiles.clearance;
  return stockProfiles.standard;
}

export function createInventoryTransaction(
  inventoryId: string,
  type: InventoryTransactionType,
  quantity: number,
  referenceType?: string,
  referenceId?: string,
): Prisma.InventoryTransactionCreateInput {
  const notes = generateTransactionNotes(type, quantity);

  return {
    type,
    quantity, // Positive for additions, negative for removals
    referenceType,
    referenceId,
    notes,
    createdBy: 'system',
    inventory: { connect: { id: inventoryId } },
  };
}

function generateTransactionNotes(type: InventoryTransactionType, quantity: number): string {
  const notes: Record<InventoryTransactionType, string[]> = {
    [InventoryTransactionType.RESTOCK]: [
      `Restocked ${Math.abs(quantity)} units from supplier`,
      `Regular inventory replenishment`,
      `Emergency restock - low inventory`,
    ],
    [InventoryTransactionType.SALE]: [
      `Sold ${Math.abs(quantity)} units`,
      `Customer order fulfilled`,
      `Retail sale`,
    ],
    [InventoryTransactionType.RETURN]: [
      `Customer return - ${quantity} units`,
      `Defective item return`,
      `Change of mind return`,
    ],
    [InventoryTransactionType.ADJUSTMENT]: [
      `Inventory count adjustment`,
      `Damaged goods write-off`,
      `Stock reconciliation`,
    ],
    [InventoryTransactionType.RESERVATION]: [
      `Reserved for special event`,
      `Reserved for pre-order`,
      `Reserved for customer pickup`,
    ],
    [InventoryTransactionType.RELEASE]: [
      `Released from reservation`,
      `Reservation cancelled`,
      `Released to general inventory`,
    ],
  };

  const typeNotes = notes[type] || [`${type} transaction`];
  return typeNotes[Math.floor(Math.random() * typeNotes.length)];
}

export function generateInventoryHistory(
  inventoryId: string,
): Prisma.InventoryTransactionCreateManyInput[] {
  const transactions: Prisma.InventoryTransactionCreateManyInput[] = [];
  const transactionCount = Math.floor(Math.random() * 10) + 5; // 5-15 transactions

  for (let i = 0; i < transactionCount; i++) {
    const daysAgo = Math.floor(Math.random() * 90); // Within last 90 days
    const transactionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Weighted transaction types
    const typeRandom = Math.random();
    let type: InventoryTransactionType;
    let quantity: number;

    if (typeRandom < 0.4) {
      // 40% sales
      type = InventoryTransactionType.SALE;
      quantity = -(Math.floor(Math.random() * 5) + 1); // -1 to -5
    } else if (typeRandom < 0.6) {
      // 20% restocks
      type = InventoryTransactionType.RESTOCK;
      quantity = Math.floor(Math.random() * 100) + 50; // 50-150
    } else if (typeRandom < 0.75) {
      // 15% returns
      type = InventoryTransactionType.RETURN;
      quantity = Math.floor(Math.random() * 3) + 1; // 1-3
    } else if (typeRandom < 0.9) {
      // 15% adjustments
      type = InventoryTransactionType.ADJUSTMENT;
      quantity =
        Math.random() > 0.5 ? Math.floor(Math.random() * 10) : -Math.floor(Math.random() * 10);
    } else {
      // 10% reservations
      type = InventoryTransactionType.RESERVATION;
      quantity = -(Math.floor(Math.random() * 20) + 10); // -10 to -30
    }

    transactions.push({
      inventoryId,
      type,
      quantity,
      notes: generateTransactionNotes(type, quantity),
      createdAt: transactionDate,
      createdBy: 'system',
    });
  }

  // Sort by date (oldest first)
  return transactions.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || Date.now());
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || Date.now());
    return dateA.getTime() - dateB.getTime();
  });
}
