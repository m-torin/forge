import { PrismaClient } from '../../prisma-generated/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await seedProducts();
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedProducts() {
  // eslint-disable-next-line no-console
  console.log('🌱 Seeding products...');

  // Sample products with barcodes for testing
  const products = [
    {
      attributes: {
        batteryLife: '30 hours',
        brand: 'TechSound',
        color: 'Black',
        features: ['Noise Cancellation', 'Wireless', 'Bluetooth 5.0'],
        weight: '250g',
      },
      barcodes: [
        { barcode: '123456789012', isPrimary: true, type: 'UPC_A' as const },
        { barcode: '1234567890128', isPrimary: false, type: 'EAN_13' as const },
      ],
      category: 'Electronics > Audio',
      description: 'Premium wireless headphones with noise cancellation and 30-hour battery life',
      name: 'Wireless Bluetooth Headphones',
      sku: 'WBH-001',
      status: 'ACTIVE' as const,
    },
    {
      attributes: {
        brand: 'EcoWear',
        careInstructions: 'Machine wash cold, tumble dry low',
        colors: ['White', 'Black', 'Navy', 'Gray'],
        material: '100% Organic Cotton',
        sizes: ['S', 'M', 'L', 'XL'],
      },
      barcodes: [
        { barcode: '987654321098', isPrimary: true, type: 'UPC_A' as const },
        { barcode: '9876543210982', isPrimary: false, type: 'EAN_13' as const },
      ],
      category: 'Clothing > Shirts',
      description: 'Comfortable organic cotton t-shirt in various sizes and colors',
      name: 'Organic Cotton T-Shirt',
      sku: 'OCT-002',
      status: 'ACTIVE' as const,
    },
    {
      attributes: {
        brand: 'SecureHome',
        connectivity: 'Wi-Fi',
        features: ['Night Vision', 'Motion Detection', 'Mobile App', 'Cloud Storage'],
        powerSource: 'AC Adapter',
        resolution: '1080p HD',
      },
      barcodes: [
        { barcode: '456789123456', isPrimary: true, type: 'UPC_A' as const },
        { barcode: '4567891234567', isPrimary: false, type: 'EAN_13' as const },
      ],
      category: 'Electronics > Security',
      description: '1080p HD security camera with night vision and mobile app control',
      name: 'Smart Home Security Camera',
      sku: 'SHSC-003',
      status: 'ACTIVE' as const,
    },
    {
      attributes: {
        brand: 'HydroLife',
        capacity: '750ml',
        colors: ['Silver', 'Black', 'Blue', 'Pink'],
        features: ['Insulated', 'Leak-proof', 'BPA-free'],
        material: 'Stainless Steel',
      },
      barcodes: [
        { barcode: '789123456789', isPrimary: true, type: 'UPC_A' as const },
        { barcode: '7891234567890', isPrimary: false, type: 'EAN_13' as const },
      ],
      category: 'Home & Garden > Drinkware',
      description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours',
      name: 'Stainless Steel Water Bottle',
      sku: 'SSWB-004',
      status: 'ACTIVE' as const,
    },
    {
      attributes: {
        brand: 'ChargeTech',
        chargingSpeed: '15W Fast Charging',
        compatibility: 'Qi-enabled devices',
        dimensions: '10cm x 10cm x 1cm',
        features: ['LED Indicator', 'Overcharge Protection', 'Non-slip Surface'],
      },
      barcodes: [
        { barcode: '321654987321', isPrimary: true, type: 'UPC_A' as const },
        { barcode: '3216549873210', isPrimary: false, type: 'EAN_13' as const },
      ],
      category: 'Electronics > Accessories',
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices',
      name: 'Wireless Phone Charger',
      sku: 'WPC-005',
      status: 'ACTIVE' as const,
    },
  ];

  for (const productData of products) {
    const { barcodes, ...productInfo } = productData;

    try {
      // Create product with barcodes in a transaction
      const product = await prisma.$transaction(async (tx: any) => {
        // Create the product
        const newProduct = await tx.product.create({
          data: productInfo,
        });

        // Create the barcodes
        await tx.productBarcode.createMany({
          data: barcodes.map((barcode: any) => ({
            ...barcode,
            productId: newProduct.id,
          })),
        });

        return newProduct;
      });

      // eslint-disable-next-line no-console
      console.log(`✅ Created product: ${product.name} (${product.sku})`);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(`❌ Failed to create product ${productData.name}: `, error);
    }
  }

  // eslint-disable-next-line no-console
  console.log('🎉 Product seeding completed!');
}

if (require.main === module) {
  void main();
}

export { seedProducts };
