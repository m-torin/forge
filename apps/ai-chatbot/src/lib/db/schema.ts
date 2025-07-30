import type { InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * User table schema
 */
export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

/**
 * User model type
 */
export type User = InferSelectModel<typeof user>;

/**
 * Chat table schema
 */
export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

/**
 * Chat model type
 */
export type Chat = InferSelectModel<typeof chat>;

/**
 * DEPRECATED: The following schema is deprecated and will be removed in the future.
 * Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
 */
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

/**
 * Deprecated message model type
 */
export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

/**
 * Message table schema (v2)
 */
export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

// ===== RAG TABLES =====

export const ragDocument = pgTable('RagDocument', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  metadata: json('metadata').notNull().$type<{
    source: string;
    category: string;
    addedAt: string;
    userId?: string;
    tags?: string[];
    originalFilename?: string;
    fileType?: string;
  }>(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  chatId: uuid('chatId').references(() => chat.id),
  isPublic: boolean('isPublic').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type RagDocument = InferSelectModel<typeof ragDocument>;

export const ragChunk = pgTable('RagChunk', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  documentId: uuid('documentId')
    .notNull()
    .references(() => ragDocument.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  chunkIndex: varchar('chunkIndex').notNull(),
  metadata: json('metadata').$type<{
    startChar?: number;
    endChar?: number;
    tokenCount?: number;
    embedding?: number[];
    keywords?: string[];
  }>(),
  // Vector embedding would be stored in Upstash Vector, referenced by this ID
  vectorId: varchar('vectorId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type RagChunk = InferSelectModel<typeof ragChunk>;

export const ragQuery = pgTable('RagQuery', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  query: text('query').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  chatId: uuid('chatId').references(() => chat.id),
  results: json('results').$type<
    Array<{
      chunkId: string;
      content: string;
      score: number;
      metadata: any;
    }>
  >(),
  responseGenerated: boolean('responseGenerated').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type RagQuery = InferSelectModel<typeof ragQuery>;

// RAG configuration per chat
export const ragChatConfig = pgTable('RagChatConfig', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id, { onDelete: 'cascade' })
    .unique(),
  isEnabled: boolean('isEnabled').notNull().default(true),
  similarityThreshold: varchar('similarityThreshold').notNull().default('0.7'),
  maxResults: varchar('maxResults').notNull().default('5'),
  chunkSize: varchar('chunkSize').notNull().default('1000'),
  namespace: varchar('namespace'), // Upstash Vector namespace
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type RagChatConfig = InferSelectModel<typeof ragChatConfig>;

// Export all schema for drizzle queries
export const schema = {
  user,
  chat,
  message,
  vote,
  document,
  suggestion,
  stream,
  ragDocument,
  ragChunk,
  ragQuery,
  ragChatConfig,
};
