import 'server-only';

import { and, asc, count, desc, eq, gt, gte, inArray, lt, type SQL } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../env';

import type { ArtifactKind } from '@/components/artifact';
import type { VisibilityType } from '@/components/visibility-selector';
import { ChatSDKError } from '../errors';
import { generateUUID } from '../utils';
import {
  chat,
  type Chat,
  type DBMessage,
  document,
  documentVersion,
  message,
  stream,
  type Suggestion,
  suggestion,
  user,
  type User,
  vote,
} from './schema';
import { generateHashedPassword } from './utils';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

const client = env.DATABASE_URL ? postgres(env.DATABASE_URL) : ({} as any);
const db = env.DATABASE_URL ? drizzle(client) : ({} as any);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get user by email');
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create guest user');
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db.delete(chat).where(eq(chat.id, id)).returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to delete chat by id');
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(whereCondition ? and(whereCondition, eq(chat.userId, id)) : eq(chat.userId, id))
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError('not_found:database', `Chat with id ${startingAfter} not found`);
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db.select().from(chat).where(eq(chat.id, endingBefore)).limit(1);

      if (!selectedChat) {
        throw new ChatSDKError('not_found:database', `Chat with id ${endingBefore} not found`);
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chats by user id');
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function saveMessages({ messages }: { messages: Array<DBMessage> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get messages by chat id');
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get votes by chat id');
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
        visibility: 'private',
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  if (!env.DATABASE_URL) {
    console.warn('Database not configured, returning empty documents array');
    return [];
  }

  try {
    const documents = await db
      .select({
        id: document.id,
        createdAt: document.createdAt,
        title: document.title,
        content: document.content,
        // contentHtml: document.contentHtml,
        // contentMarkdown: document.contentMarkdown,
        // kind: document.kind,
        // visibility: document.visibility,
        userId: document.userId,
        // updatedAt: document.updatedAt,
      })
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Database error in getDocumentsById:', error);
    return [];
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select({
        id: document.id,
        createdAt: document.createdAt,
        title: document.title,
        content: document.content,
        // contentHtml: document.contentHtml,
        // contentMarkdown: document.contentMarkdown,
        // kind: document.kind,
        // visibility: document.visibility,
        userId: document.userId,
        // updatedAt: document.updatedAt,
      })
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get document by id');
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(and(eq(suggestion.documentId, id), gt(suggestion.documentCreatedAt, timestamp)));

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

export async function saveSuggestions({ suggestions }: { suggestions: Array<Suggestion> }) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save suggestions');
  }
}

export async function getSuggestionsByDocumentId({ documentId }: { documentId: string }) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get suggestions by document id');
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get message by id');
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)));

    const messageIds = messagesToDelete.map((msg: any) => msg.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)));

      return await db
        .delete(message)
        .where(and(eq(message.chatId, chatId), inArray(message.id, messageIds)));
    }
  } catch (_error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to update chat visibility by id');
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - differenceInHours * 60 * 60 * 1000);

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, 'user'),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get message count by user id');
  }
}

export async function createStreamId({ streamId, chatId }: { streamId: string; chatId: string }) {
  try {
    await db.insert(stream).values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create stream id');
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map((stream: any) => stream.id);
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get stream ids by chat id');
  }
}

// Enhanced document queries for editor functionality

export async function saveEditorDocument({
  id,
  title,
  content,
  userId,
}: {
  id: string;
  title: string;
  content: any;
  userId: string;
}) {
  if (!env.DATABASE_URL) {
    console.warn('Database not configured, cannot save document');
    throw new ChatSDKError('bad_request:database', 'Database not configured');
  }

  try {
    const now = new Date();
    return await db
      .insert(document)
      .values({
        id,
        title,
        content,
        // contentHtml,
        // contentMarkdown,
        // kind: 'text',
        // visibility,
        userId,
        createdAt: now,
        // updatedAt: now,
      })
      .returning();
  } catch (error) {
    console.error('Database error in saveEditorDocument:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to save editor document');
  }
}

export async function updateEditorDocument({
  id,
  title,
  content,
}: {
  id: string;
  title?: string;
  content?: any;
}) {
  if (!env.DATABASE_URL) {
    console.warn('Database not configured, cannot update document');
    throw new ChatSDKError('bad_request:database', 'Database not configured');
  }

  try {
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    // if (contentHtml !== undefined) updateData.contentHtml = contentHtml;
    // if (contentMarkdown !== undefined) updateData.contentMarkdown = contentMarkdown;
    // updateData.updatedAt = new Date();

    return await db.update(document).set(updateData).where(eq(document.id, id)).returning();
  } catch (error) {
    console.error('Database error in updateEditorDocument:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to update editor document');
  }
}

export async function getDocumentsByUserId({
  userId,
  limit = 20,
}: {
  userId: string;
  limit?: number;
}) {
  if (!env.DATABASE_URL) {
    console.warn('Database not configured, returning empty documents array');
    return [];
  }

  try {
    return await db
      .select({
        id: document.id,
        createdAt: document.createdAt,
        title: document.title,
        content: document.content,
        // contentHtml: document.contentHtml,
        // contentMarkdown: document.contentMarkdown,
        // kind: document.kind,
        // visibility: document.visibility,
        userId: document.userId,
        // updatedAt: document.updatedAt,
      })
      .from(document)
      .where(eq(document.userId, userId))
      .orderBy(desc(document.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Database error in getDocumentsByUserId:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
}

export async function deleteEditorDocumentById({ id }: { id: string }) {
  try {
    // Delete related document versions first
    await db.delete(documentVersion).where(eq(documentVersion.documentId, id));

    // Delete related suggestions
    await db.delete(suggestion).where(eq(suggestion.documentId, id));

    // Delete the document
    return await db.delete(document).where(eq(document.id, id)).returning();
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to delete editor document by id');
  }
}

export async function saveDocumentVersion({
  documentId,
  documentCreatedAt,
  content,
  contentHtml,
  contentMarkdown,
  versionNumber,
  userId,
}: {
  documentId: string;
  documentCreatedAt: Date;
  content: any;
  contentHtml?: string;
  contentMarkdown?: string;
  versionNumber: string;
  userId: string;
}) {
  try {
    return await db
      .insert(documentVersion)
      .values({
        documentId,
        documentCreatedAt,
        content,
        contentHtml,
        contentMarkdown,
        versionNumber,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document version');
  }
}

export async function getDocumentVersionsByDocumentId({ documentId }: { documentId: string }) {
  try {
    return await db
      .select()
      .from(documentVersion)
      .where(eq(documentVersion.documentId, documentId))
      .orderBy(desc(documentVersion.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document versions by document id',
    );
  }
}
