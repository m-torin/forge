import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // Multi-file schema directory
  schema: path.join('src', 'prisma', 'schemas'),

  // Migration configuration
  migrations: {
    path: path.join('migrations'),
  },

  // Studio configuration
  studio: {
    port: 3600,
    host: 'localhost',
  },

  // Experimental features you're using
  experimental: {
    driverAdapters: true,
    studio: true,
  },
});
