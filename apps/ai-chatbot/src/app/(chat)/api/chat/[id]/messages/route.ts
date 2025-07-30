import { auth } from '#/app/(auth)/auth';
import {
  getChatById,
  getMessageCountByChatId,
  getMessagesByChatIdPaginated,
} from '#/lib/db/queries';
import { ChatSDKError } from '#/lib/errors';
import { logError } from '@repo/observability';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: chatId } = await params;
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);

  // Validate parameters
  if (page < 1 || pageSize < 1 || pageSize > 100) {
    return new ChatSDKError('bad_request:api', 'Invalid pagination parameters').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  // Get chat to verify ownership
  try {
    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return new ChatSDKError('not_found:chat').toResponse();
    }

    // Check permissions
    if (chat.visibility === 'private' && chat.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    // Get paginated messages
    const offset = (page - 1) * pageSize;
    const messages = await getMessagesByChatIdPaginated({
      chatId,
      limit: pageSize,
      offset,
    });

    // Check if there are more messages
    const totalCount = await getMessageCountByChatId({ chatId });
    const hasMore = offset + messages.length < totalCount;

    return Response.json({
      messages,
      hasMore,
      total: totalCount,
      page,
      pageSize,
    });
  } catch (error) {
    await logError('Error fetching paginated messages', { error, chatId });
    return new ChatSDKError('model_error:database', 'Failed to fetch messages').toResponse();
  }
}
