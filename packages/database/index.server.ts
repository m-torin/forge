// Server-side exports for database package
import 'server-only';

// Export the database instance and types
export * from './index';

// Export database actions
export * from './actions';

// Export direct access to specific database providers
export * as prisma from './prisma';
export * as firestore from './firestore';
