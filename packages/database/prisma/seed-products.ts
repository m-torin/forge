import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

async function seedProducts() {
  console.log('🌱 Seeding products...');

  // Sample products with barcodes for testing
  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      attributes: {
        batteryLife: '30 hours',
        brand: 'TechSound',
        color: 'Black',
        features: ['Noise Cancellation', 'Wireless', 'Bluetooth 5.0'],
        weight: '250g',
      },
      barcodes: [
        { type: 'UPC_A' as const, barcode: '123456789012', isPrimary: true },
        { type: 'EAN_13' as const, barcode: '1234567890128', isPrimary: false },
      ],
      category: 'Electronics > Audio',
      description: 'Premium wireless headphones with noise cancellation and 30-hour battery life',
      sku: 'WBH-001',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Organic Cotton T-Shirt',
      attributes: {
        brand: 'EcoWear',
        careInstructions: 'Machine wash cold, tumble dry low',
        colors: ['White', 'Black', 'Navy', 'Gray'],
        material: '100% Organic Cotton',
        sizes: ['S', 'M', 'L', 'XL'],
      },
      barcodes: [
        { type: 'UPC_A' as const, barcode: '987654321098', isPrimary: true },
        { type: 'EAN_13' as const, barcode: '9876543210982', isPrimary: false },
      ],
      category: 'Clothing > Shirts',
      description: 'Comfortable organic cotton t-shirt in various sizes and colors',
      sku: 'OCT-002',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Smart Home Security Camera',
      attributes: {
        brand: 'SecureHome',
        connectivity: 'Wi-Fi',
        features: ['Night Vision', 'Motion Detection', 'Mobile App', 'Cloud Storage'],
        powerSource: 'AC Adapter',
        resolution: '1080p HD',
      },
      barcodes: [
        { type: 'UPC_A' as const, barcode: '456789123456', isPrimary: true },
        { type: 'EAN_13' as const, barcode: '4567891234567', isPrimary: false },
      ],
      category: 'Electronics > Security',
      description: '1080p HD security camera with night vision and mobile app control',
      sku: 'SHSC-003',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Stainless Steel Water Bottle',
      attributes: {
        brand: 'HydroLife',
        capacity: '750ml',
        colors: ['Silver', 'Black', 'Blue', 'Pink'],
        features: ['Insulated', 'Leak-proof', 'BPA-free'],
        material: 'Stainless Steel',
      },
      barcodes: [
        { type: 'UPC_A' as const, barcode: '789123456789', isPrimary: true },
        { type: 'EAN_13' as const, barcode: '7891234567890', isPrimary: false },
      ],
      category: 'Home & Garden > Drinkware',
      description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours',
      sku: 'SSWB-004',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Wireless Phone Charger',
      attributes: {
        brand: 'ChargeTech',
        chargingSpeed: '15W Fast Charging',
        compatibility: 'Qi-enabled devices',
        dimensions: '10cm x 10cm x 1cm',
        features: ['LED Indicator', 'Overcharge Protection', 'Non-slip Surface'],
      },
      barcodes: [
        { type: 'UPC_A' as const, barcode: '321654987321', isPrimary: true },
        { type: 'EAN_13' as const, barcode: '3216549873210', isPrimary: false },
      ],
      category: 'Electronics > Accessories',
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices',
      sku: 'WPC-005',
      status: 'ACTIVE' as const,
    },
  ];

  for (const productData of products) {
    const { barcodes, ...productInfo } = productData;

    try {
      // Create product with barcodes in a transaction
      const product = await prisma.$transaction(async (tx) => {
        // Create the product
        const newProduct = await tx.product.create({
          data: productInfo,
        });

        // Create the barcodes
        await tx.productBarcode.createMany({
          data: barcodes.map((barcode) => ({
            ...barcode,
            productId: newProduct.id,
          })),
        });

        return newProduct;
      });

      console.log(`✅ Created product: ${product.name} (${product.sku})`);
    } catch (error) {
      console.error(`❌ Failed to create product ${productData.name}:`, error);
    }
  }

  console.log('🎉 Product seeding completed!');
}

async function main() {
  try {
    await seedProducts();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void main();
}

export { seedProducts };
