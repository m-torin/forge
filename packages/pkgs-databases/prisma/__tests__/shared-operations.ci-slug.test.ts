// Minimal unit tests for CI slug helpers using a fake delegate and tsx runner
// Run: pnpm --filter @repo/db-prisma test:helpers

import {
  deleteBySlugCI,
  existsBySlugCI,
  existsFirstGeneric,
  findBySlugCI,
  updateBySlugCI,
} from '../src/orm/shared-operations.ts';

// Simple assertion helpers
function assert(condition: any, message: string) {
  if (!condition) throw new Error('Assertion failed: ' + message);
}
function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: ${message}. Expected=${JSON.stringify(expected)}, Actual=${JSON.stringify(actual)}`,
    );
  }
}

// Fake in-memory dataset
const records = [
  { id: '1', slug: 'Foo-Bar', name: 'Alpha' },
  { id: '2', slug: 'baz-qux', name: 'Beta' },
];

// Capture last call args to verify helper behavior
let lastFindFirstArgs: any = null;
let lastUpdateArgs: any = null;
let lastDeleteArgs: any = null;

// Fake delegate that simulates Prisma model delegate behavior
const delegate: any = {
  async findFirst(args: any) {
    lastFindFirstArgs = args;
    const where = args?.where || {};
    // Support case-insensitive slug equals path
    if (where.slug && typeof where.slug.equals === 'string') {
      const target = (where.slug.equals as string).toLowerCase();
      const match = records.find(r => r.slug.toLowerCase() === target);
      if (!match) return null;
      // Respect select to shape the result minimally
      if (args?.select?.id) return { id: match.id };
      return { ...match };
    }
    // Generic findFirst support for existsFirstGeneric
    if (where.name && typeof where.name.equals === 'string') {
      const target = (where.name.equals as string).toLowerCase();
      const match = records.find(r => r.name.toLowerCase() === target);
      if (!match) return null;
      if (args?.select?.id) return { id: match.id };
      return { ...match };
    }
    return null;
  },

  async update(args: any) {
    lastUpdateArgs = args;
    const id = args?.where?.id;
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Record not found for update');
    const next = { ...records[idx], ...(args?.data || {}) };
    records[idx] = next;
    return { ...next };
  },

  async delete(args: any) {
    lastDeleteArgs = args;
    const id = args?.where?.id;
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Record not found for delete');
    const removed = records.splice(idx, 1)[0];
    return { ...removed };
  },
};

async function run() {
  // findBySlugCI: case-insensitive match and include/select propagation
  const found = await findBySlugCI(delegate, 'slug', 'foo-bar', { select: { id: true } });
  assert(found && found.id === '1', 'findBySlugCI should resolve id via CI match');
  assert(
    lastFindFirstArgs?.where?.slug?.mode === 'insensitive',
    'findBySlugCI should set mode to insensitive',
  );

  // existsBySlugCI: true when present, false when absent
  const exists1 = await existsBySlugCI(delegate, 'slug', 'FOO-bar');
  const exists2 = await existsBySlugCI(delegate, 'slug', 'not-present');
  assertEqual(exists1, true, 'existsBySlugCI should be true for present slug');
  assertEqual(exists2, false, 'existsBySlugCI should be false for absent slug');

  // updateBySlugCI: updates record by locating id through CI slug
  const updated = await updateBySlugCI(delegate, 'slug', 'FOO-BAR', { name: 'Alpha-Updated' });
  assert(updated && updated.id === '1', 'updateBySlugCI should update record found by CI slug');
  assertEqual(updated.name, 'Alpha-Updated', 'updateBySlugCI should apply provided data');
  assert(
    lastUpdateArgs?.where?.id === '1',
    'updateBySlugCI should transform where to primary key id',
  );

  // deleteBySlugCI: deletes record by locating id through CI slug
  const deleted = await deleteBySlugCI(delegate, 'slug', 'Baz-QUX');
  assert(deleted && deleted.id === '2', 'deleteBySlugCI should delete record found by CI slug');
  assert(
    lastDeleteArgs?.where?.id === '2',
    'deleteBySlugCI should transform where to primary key id',
  );
  const existsAfterDelete = await existsBySlugCI(delegate, 'slug', 'baz-qux');
  assertEqual(existsAfterDelete, false, 'existsBySlugCI should be false after delete');

  // existsFirstGeneric: generic non-unique existence flow using findFirst
  const existsByName = await existsFirstGeneric(delegate, {
    where: { name: { equals: 'alpha-updated', mode: 'insensitive' } },
    select: { id: true },
  });
  assertEqual(
    existsByName,
    true,
    'existsFirstGeneric should work with arbitrary non-unique filters via findFirst',
  );

  console.log('✅ CI slug helpers and existsFirstGeneric tests passed');
}

run().catch(err => {
  console.error('❌ Tests failed:', err);
  process.exit(1);
});
