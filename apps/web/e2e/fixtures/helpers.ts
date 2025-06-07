import { database } from "@repo/database/prisma";

import { TEST_PRODUCTS } from "./products";
import { TEST_SESSIONS, TEST_USERS } from "./users";

import type { TestProduct } from "./products";
import type { TestSession, TestUser } from "./users";

/**
 * Seeds test data into the database
 */
export async function seedTestData() {
  try {
    // Clear existing test data
    await clearTestData();

    // Seed users
    const userPromises = Object.values(TEST_USERS).map(async (user) => {
      const { password, ...userData } = user;
      return database.user.create({
        data: {
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
          // Password would be hashed in real implementation
        },
      });
    });
    await Promise.all(userPromises);

    // Seed sessions
    const sessionPromises = Object.values(TEST_SESSIONS).map(
      async (session) => {
        return database.session.create({
          data: {
            ...session,
            createdAt: new Date(),
            ipAddress: "127.0.0.1",
            updatedAt: new Date(),
            userAgent: "Playwright Test",
          },
        });
      },
    );
    await Promise.all(sessionPromises);

    // Seed products
    const productPromises = Object.values(TEST_PRODUCTS).map(
      async (product) => {
        const { barcodes, images, ...productData } = product;
        return database.product.create({
          data: {
            ...productData,
            attributes: productData.attributes || {},
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      },
    );
    await Promise.all(productPromises);

    console.log("Test data seeded successfully");
  } catch (error) {
    console.error("Error seeding test data:", error);
    throw error;
  }
}

/**
 * Clears all test data from the database
 */
export async function clearTestData() {
  try {
    // Delete in order to respect foreign key constraints
    await database.scanHistory.deleteMany({
      where: {
        userId: {
          in: Object.values(TEST_USERS).map((u) => u.id),
        },
      },
    });

    await database.productAsset.deleteMany({
      where: {
        productId: {
          in: Object.values(TEST_PRODUCTS).map((p) => p.id),
        },
      },
    });

    await database.productBarcode.deleteMany({
      where: {
        productId: {
          in: Object.values(TEST_PRODUCTS).map((p) => p.id),
        },
      },
    });

    await database.product.deleteMany({
      where: {
        id: {
          in: Object.values(TEST_PRODUCTS).map((p) => p.id),
        },
      },
    });

    await database.session.deleteMany({
      where: {
        id: {
          in: Object.values(TEST_SESSIONS).map((s) => s.id),
        },
      },
    });

    await database.user.deleteMany({
      where: {
        id: {
          in: Object.values(TEST_USERS).map((u) => u.id),
        },
      },
    });

    console.log("Test data cleared successfully");
  } catch (error) {
    console.error("Error clearing test data:", error);
    throw error;
  }
}

/**
 * Creates a test user in the database
 */
export async function createDatabaseUser(user: TestUser) {
  const { password, ...userData } = user;
  return database.user.create({
    data: {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Creates a test session in the database
 */
export async function createDatabaseSession(session: TestSession) {
  return database.session.create({
    data: {
      ...session,
      createdAt: new Date(),
      ipAddress: "127.0.0.1",
      updatedAt: new Date(),
      userAgent: "Playwright Test",
    },
  });
}

/**
 * Creates a test product in the database
 */
export async function createDatabaseProduct(product: TestProduct) {
  const { barcodes, images, ...productData } = product;
  const createdProduct = await database.product.create({
    data: {
      ...productData,
      attributes: productData.attributes || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create associated barcodes
  if (barcodes && barcodes.length > 0) {
    await Promise.all(
      barcodes.map((barcode) =>
        database.productBarcode.create({
          data: {
            type: barcode.type as any,
            barcode: barcode.barcode,
            isPrimary: barcode.isPrimary || false,
            productId: createdProduct.id,
          },
        }),
      ),
    );
  }

  // Create associated images
  if (images && images.length > 0) {
    await Promise.all(
      images.map((image, index) =>
        database.productAsset.create({
          data: {
            filename: `image-${index}.jpg`,
            type: "IMAGE",
            url: image.url,
            alt: image.alt,
            productId: createdProduct.id,
            sortOrder: image.sortOrder || index,
          },
        }),
      ),
    );
  }

  return createdProduct;
}

/**
 * Gets a valid session token for testing
 */
export function getTestSessionToken(
  userType: "admin" | "regular" = "regular",
): string {
  return userType === "admin"
    ? TEST_SESSIONS.adminSession.token
    : TEST_SESSIONS.userSession.token;
}

/**
 * Gets test user credentials
 */
export function getTestCredentials(
  userType: keyof typeof TEST_USERS = "regular",
) {
  const user = TEST_USERS[userType];
  return {
    email: user.email,
    password: user.password,
  };
}

/**
 * Mock authentication headers for API testing
 */
export function getMockAuthHeaders(sessionToken: string) {
  return {
    Authorization: `Bearer ${sessionToken}`,
    "Content-Type": "application/json",
  };
}

/**
 * Reset specific test data by type
 */
export async function resetTestDataByType(
  type: "users" | "products" | "orders" | "all",
) {
  switch (type) {
    case "users":
      await database.user.deleteMany({
        where: { email: { contains: "test.example.com" } },
      });
      break;
    case "products":
      await database.product.deleteMany({
        where: { sku: { startsWith: "test-" } },
      });
      break;
    case "all":
      await clearTestData();
      break;
  }
}
