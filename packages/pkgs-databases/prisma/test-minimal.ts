// Minimal test to identify the source of TypeScript compilation issues

// Test 1: Basic import
import { PrismaClient } from './src/generated/client/client';

// Test 2: Simple usage
const client = new PrismaClient();

export { client };
