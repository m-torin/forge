/**
 * This example demonstrates how to map between Prisma and Firestore models.
 *
 * Note: This is for demonstration purposes only and is not meant to be executed directly.
 */

import { Database } from '@repo/database/database';
import { database } from '@repo/database';

// Define a type for model mapping configuration
interface ModelMapping {
  prismaCollection: string;
  firestoreCollection: string;
  fieldMappings: Record<string, FieldMapping>;
}

// Define a type for field mapping configuration
interface FieldMapping {
  prismaField: string;
  firestoreField: string;
  transform?: {
    toPrisma?: (value: any) => any;
    toFirestore?: (value: any) => any;
  };
}

// Example model mappings
const modelMappings: Record<string, ModelMapping> = {
  user: {
    prismaCollection: 'user',
    firestoreCollection: 'users',
    fieldMappings: {
      id: {
        prismaField: 'id',
        firestoreField: 'id',
      },
      name: {
        prismaField: 'name',
        firestoreField: 'displayName',
      },
      email: {
        prismaField: 'email',
        firestoreField: 'email',
      },
      createdAt: {
        prismaField: 'createdAt',
        firestoreField: 'createdAt',
        transform: {
          toPrisma: (value) => value.toDate(), // Convert Firestore Timestamp to Date
          toFirestore: (value) => new Date(value), // Convert Date/string to Firestore Timestamp
        },
      },
    },
  },
  organization: {
    prismaCollection: 'organization',
    firestoreCollection: 'organizations',
    fieldMappings: {
      id: {
        prismaField: 'id',
        firestoreField: 'id',
      },
      name: {
        prismaField: 'name',
        firestoreField: 'name',
      },
      slug: {
        prismaField: 'slug',
        firestoreField: 'slug',
      },
    },
  },
};

// Helper function to convert data from Prisma format to Firestore format
function convertToFirestoreFormat(modelName: string, prismaData: any): any {
  const mapping = modelMappings[modelName];
  if (!mapping) {
    throw new Error(`No mapping defined for model: ${modelName}`);
  }

  const firestoreData: Record<string, any> = {};

  Object.entries(mapping.fieldMappings).forEach(([key, fieldMapping]) => {
    const prismaValue = prismaData[fieldMapping.prismaField];

    if (prismaValue !== undefined) {
      let firestoreValue = prismaValue;

      // Apply transformation if defined
      if (fieldMapping.transform?.toFirestore) {
        firestoreValue = fieldMapping.transform.toFirestore(prismaValue);
      }

      firestoreData[fieldMapping.firestoreField] = firestoreValue;
    }
  });

  return firestoreData;
}

// Helper function to convert data from Firestore format to Prisma format
function convertToPrismaFormat(modelName: string, firestoreData: any): any {
  const mapping = modelMappings[modelName];
  if (!mapping) {
    throw new Error(`No mapping defined for model: ${modelName}`);
  }

  const prismaData: Record<string, any> = {};

  Object.entries(mapping.fieldMappings).forEach(([key, fieldMapping]) => {
    const firestoreValue = firestoreData[fieldMapping.firestoreField];

    if (firestoreValue !== undefined) {
      let prismaValue = firestoreValue;

      // Apply transformation if defined
      if (fieldMapping.transform?.toPrisma) {
        prismaValue = fieldMapping.transform.toPrisma(firestoreValue);
      }

      prismaData[fieldMapping.prismaField] = prismaValue;
    }
  });

  return prismaData;
}

// Example: Using the model mapping to create data in both databases
async function createInBothDatabases(modelName: string, data: any) {
  const db = database as Database;
  const currentProvider = db.getProvider();

  // Create in the current database
  console.log(`Creating in ${currentProvider}...`);
  const result = await db.create(
    currentProvider === 'prisma'
      ? modelMappings[modelName].prismaCollection
      : modelMappings[modelName].firestoreCollection,
    data
  );

  // Switch provider
  const otherProvider = currentProvider === 'prisma' ? 'firestore' : 'prisma';
  await db.setProvider(otherProvider);

  // Convert data to the appropriate format
  const convertedData = currentProvider === 'prisma'
    ? convertToFirestoreFormat(modelName, data)
    : convertToPrismaFormat(modelName, data);

  // Create in the other database
  console.log(`Creating in ${otherProvider}...`);
  const otherResult = await db.create(
    otherProvider === 'prisma'
      ? modelMappings[modelName].prismaCollection
      : modelMappings[modelName].firestoreCollection,
    convertedData
  );

  // Switch back to original provider
  await db.setProvider(currentProvider);

  return {
    [currentProvider]: result,
    [otherProvider]: otherResult,
  };
}

// Example: Syncing data between Prisma and Firestore
async function syncData(modelName: string, id: string) {
  const db = database as Database;

  // Get from Prisma
  await db.setProvider('prisma');
  const prismaData = await db.findUnique(
    modelMappings[modelName].prismaCollection,
    { where: { id } }
  );

  if (!prismaData) {
    throw new Error(`No ${modelName} found in Prisma with id: ${id}`);
  }

  // Convert to Firestore format
  const firestoreData = convertToFirestoreFormat(modelName, prismaData);

  // Update in Firestore
  await db.setProvider('firestore');
  await db.update(
    modelMappings[modelName].firestoreCollection,
    id,
    firestoreData
  );

  console.log(`Synced ${modelName} with id ${id} from Prisma to Firestore`);

  // Switch back to Prisma
  await db.setProvider('prisma');
}

// Example usage
async function exampleUsage() {
  // Create a user in both databases
  const userData = {
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
  };

  const results = await createInBothDatabases('user', userData);
  console.log('Created user in both databases:', results);

  // Sync an organization from Prisma to Firestore
  await syncData('organization', 'org-123');
}

// This would execute the examples if this were a real script
// exampleUsage().catch(console.error);
