/**
 * Simple test to verify validation extension works
 * Run with: npx tsx src/prisma/extensions/validation/__tests__/validation.test.ts
 */
import { prisma } from '#/prisma/clients/standard';
import { ValidationError } from '#/prisma/extensions/validation/types';

async function testValidation() {
  console.log('Testing validation extension...\n');

  // Test 1: Valid review rating
  console.log('Test 1: Creating review with valid rating (5)');
  try {
    const validReview = await prisma.review.create({
      data: {
        userId: 'test-user-1',
        content: 'Great product!',
        rating: 5,
        title: 'Excellent',
      },
    });
    console.log('✅ Valid review created successfully\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error, '\n');
  }

  // Test 2: Invalid review rating (too high)
  console.log('Test 2: Creating review with invalid rating (6)');
  try {
    await prisma.review.create({
      data: {
        userId: 'test-user-2',
        content: 'Invalid rating test',
        rating: 6,
        title: 'Should fail',
      },
    });
    console.error('❌ Expected validation error but none was thrown\n');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('✅ Validation error caught correctly:');
      console.log(`   Field: ${error.field}`);
      console.log(`   Value: ${error.value}`);
      console.log(`   Model: ${error.model}`);
      console.log(`   Message: ${error.message}
`);
    } else {
      console.error('❌ Unexpected error type:', error, '\n');
    }
  }

  // Test 3: Invalid cart item quantity (negative)
  console.log('Test 3: Creating cart item with invalid quantity (0)');
  try {
    await prisma.cartItem.create({
      data: {
        cartId: 'test-cart-1',
        productId: 'test-product-1',
        quantity: 0,
        price: 10.0,
      },
    });
    console.error('❌ Expected validation error but none was thrown\n');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('✅ Validation error caught correctly:');
      console.log(`   Field: ${error.field}`);
      console.log(`   Value: ${error.value}`);
      console.log(`   Model: ${error.model}`);
      console.log(`   Message: ${error.message}
`);
    } else {
      console.error('❌ Unexpected error type:', error, '\n');
    }
  }

  // Test 4: Valid product with price
  console.log('Test 4: Creating product with valid price');
  try {
    const validProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-' + Date.now(),
        category: 'electronics',
        price: 99.99,
        copy: { description: 'A test product' },
      },
    });
    console.log('✅ Valid product created successfully\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error, '\n');
  }

  // Test 5: Invalid product price (negative)
  console.log('Test 5: Creating product with invalid price (-10)');
  try {
    await prisma.product.create({
      data: {
        name: 'Invalid Product',
        slug: 'invalid-product-' + Date.now(),
        category: 'electronics',
        price: -10,
        copy: { description: 'Should fail' },
      },
    });
    console.error('❌ Expected validation error but none was thrown\n');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('✅ Validation error caught correctly:');
      console.log(`   Field: ${error.field}`);
      console.log(`   Value: ${error.value}`);
      console.log(`   Model: ${error.model}`);
      console.log(`   Message: ${error.message}
`);
    } else {
      console.error('❌ Unexpected error type:', error, '\n');
    }
  }

  console.log('Validation tests completed!');
  await prisma.$disconnect();
}

// Run the test
testValidation().catch(console.error);
