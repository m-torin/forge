/**
 * Test utilities for Prisma database testing
 *
 * This module provides the Prismock client and setup functions for
 * in-memory database testing.
 */

export {
  prismock as prismaMock,
  txClient as txMock,
  setupPrismockTests as setupOrmTests,
  clearAllData,
} from "../src/testing/testing.js";
