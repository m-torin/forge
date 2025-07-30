'use client';

import { LoaderIcon } from '#/components/icons';
import { ChatItem } from '#/components/sidebar-history-item';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from '#/components/ui/sidebar';
import type { Chat } from '#/lib/db/schema';
import { mockDataStore } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { ANIMATION_CLASSES } from '#/lib/ui-constants';
import { fetcher } from '#/lib/utils';
import { useDisclosure, useToggle } from '@mantine/hooks';
import cx from 'classnames';
import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Archive, Clock, Filter, Search, SortAsc, SortDesc, Star, X } from 'lucide-react';
import type { User } from 'next-auth';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSWRInfinite from 'swr/infinite';

/**
 * Type for grouping chats by time period
 */
type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

/**
 * Interface for chat history with pagination
 */
export interface ChatHistory {
  chats: Array<Chat>;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

/**
 * Groups chats by date periods (today, yesterday, last week, etc.)
 * @param chats - Array of chat objects to group
 * @returns Grouped chats object
 */
const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats,
  );
};

/**
 * Generates pagination key for SWR infinite loading
 * @param pageIndex - Current page index
 * @param previousPageData - Previous page data
 * @returns API endpoint URL or null if no more pages
 */
export function getChatHistoryPaginationKey(
  pageIndex: number,
  previousPageData: ChatHistory | null,
) {
  if (previousPageData && previousPageData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`;

  const firstChatFromPage = previousPageData?.chats.at(-1);

  if (!firstChatFromPage) return null;

  return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

/**
 * Sidebar history component with search, filtering, and pagination
 * @param user - Current user object
 */
export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();
  const prototypeMode = isPrototypeMode();

  const {
    data: paginatedChatHistories,
    setSize,
    isValidating,
    isLoading,
    mutate,
  } = useSWRInfinite<ChatHistory>(
    prototypeMode ? () => null : getChatHistoryPaginationKey,
    fetcher,
    {
      fallbackData: [],
    },
  );

  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, { open: openDeleteDialog, close: closeDeleteDialog }] = useDisclosure();

  // Enhanced search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, toggleSearchFocus] = useToggle();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'today' | 'recent' | 'archived'>('all');
  const [showFilters, { toggle: toggleFilters }] = useDisclosure();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get mock chat history in prototype mode
  const mockChatHistory = prototypeMode ? mockDataStore.getChatHistory() : null;

  // Enhanced filtering and search logic
  const filteredAndSortedChats = useMemo(() => {
    const chatsFromHistory = prototypeMode
      ? mockChatHistory || []
      : paginatedChatHistories?.flatMap(page => page.chats) || [];

    let filtered = chatsFromHistory;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        chat =>
          chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply type filter
    const now = new Date();
    switch (filterType) {
      case 'today':
        filtered = filtered.filter(chat => isToday(new Date(chat.createdAt)));
        break;
      case 'recent':
        const oneWeekAgo = subWeeks(now, 1);
        filtered = filtered.filter(chat => new Date(chat.createdAt) > oneWeekAgo);
        break;
      case 'archived':
        const oneMonthAgo = subMonths(now, 1);
        filtered = filtered.filter(chat => new Date(chat.createdAt) < oneMonthAgo);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [mockChatHistory, paginatedChatHistories, searchQuery, filterType, sortOrder, prototypeMode]);

  const hasReachedEnd = prototypeMode
    ? true // In prototype mode, we have all the data
    : paginatedChatHistories
      ? paginatedChatHistories.some(page => page.hasMore === false)
      : false;

  const hasEmptyChatHistory = filteredAndSortedChats.length === 0;
  const hasSearchResults = searchQuery.trim() !== '' && filteredAndSortedChats.length > 0;

  const handleDelete = async () => {
    if (prototypeMode) {
      // Mock delete operation in prototype mode
      if (deleteId) {
        mockDataStore.deleteChat(deleteId);
        toast.success('Chat deleted successfully (prototype mode)');
      }
      closeDeleteDialog();

      if (deleteId === id) {
        router.push('/');
      }
      return;
    }

    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting chat...',
      success: () => {
        mutate(chatHistories => {
          if (chatHistories) {
            return chatHistories.map(chatHistory => ({
              ...chatHistory,
              chats: chatHistory.chats.filter(chat => chat.id !== deleteId),
            }));
          }
        });

        return 'Chat deleted successfully';
      },
      error: 'Failed to delete chat',
    });

    closeDeleteDialog();

    if (deleteId === id) {
      router.push('/');
    }
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
            Login to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading && !prototypeMode) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Today</div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map(item => (
              <div key={item} className="flex h-8 items-center gap-2 rounded-md px-2">
                <div
                  className="h-4 max-w-[--skeleton-width] flex-1 rounded-md bg-sidebar-accent-foreground/10"
                  style={
                    {
                      '--skeleton-width': `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          {/* Enhanced Search and Filter Controls */}
          <div className="mb-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <div
                className={cx(
                  `relative flex items-center transition-all ${ANIMATION_CLASSES.NORMAL}`,
                  isSearchFocused && 'scale-[1.02] transform',
                )}
              >
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground transition-colors duration-200" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => toggleSearchFocus(true)}
                  onBlur={() => toggleSearchFocus(false)}
                  className={cx(
                    `h-9 pl-9 pr-9 transition-all ${ANIMATION_CLASSES.NORMAL}`,
                    'focus:border-ring/40 focus:ring-2 focus:ring-ring/20',
                    isSearchFocused && 'bg-background/50 backdrop-blur-sm',
                  )}
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 h-4 w-4 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFilters}
                className={cx(
                  `h-8 gap-1 px-2 text-xs transition-all ${ANIMATION_CLASSES.NORMAL}`,
                  showFilters && 'bg-muted',
                )}
              >
                <Filter className="h-3 w-3" />
                Filters
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const orders: Array<typeof sortOrder> = ['newest', 'oldest', 'alphabetical'];
                  const currentIndex = orders.indexOf(sortOrder);
                  setSortOrder(orders[(currentIndex + 1) % orders.length]);
                }}
                className="h-8 gap-1 px-2 text-xs"
                title={`Sort by ${sortOrder}`}
              >
                {sortOrder === 'newest' ? (
                  <SortDesc className="h-3 w-3" />
                ) : sortOrder === 'oldest' ? (
                  <SortAsc className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Expandable Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-1 overflow-hidden"
                >
                  {[
                    { id: 'all', label: 'All', icon: null },
                    { id: 'today', label: 'Today', icon: Clock },
                    { id: 'recent', label: 'Recent', icon: Star },
                    { id: 'archived', label: 'Archived', icon: Archive },
                  ].map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={filterType === id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(id as typeof filterType)}
                      className="h-7 gap-1 px-2 text-xs"
                    >
                      {Icon && <Icon className="h-3 w-3" />}
                      {label}
                    </Button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Results Summary */}
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-2 text-xs text-muted-foreground"
              >
                {hasSearchResults
                  ? `Found ${filteredAndSortedChats.length} conversation${filteredAndSortedChats.length === 1 ? '' : 's'}`
                  : 'No conversations match your search'}
              </motion.div>
            )}
          </div>

          {/* Chat History Content */}
          {hasEmptyChatHistory && !searchQuery ? (
            <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
              Your conversations will appear here once you start chatting!
            </div>
          ) : hasEmptyChatHistory && searchQuery ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-3 p-4 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">No conversations found</div>
                <div className="text-xs text-muted-foreground">
                  Try adjusting your search or filters
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="text-xs"
              >
                Clear search
              </Button>
            </motion.div>
          ) : (
            <SidebarMenu>
              <motion.div
                key={`${searchQuery}-${filterType}-${sortOrder}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-6"
              >
                {searchQuery || filterType !== 'all' ? (
                  // Flat list when searching/filtering
                  <div className="space-y-1">
                    {filteredAndSortedChats.map((chat, index) => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ChatItem
                          chat={chat}
                          isActive={chat.id === id}
                          onDelete={chatId => {
                            setDeleteId(chatId);
                            openDeleteDialog();
                          }}
                          setOpenMobile={setOpenMobile}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // Grouped by date when no search/filter
                  (() => {
                    const groupedChats = groupChatsByDate(filteredAndSortedChats);
                    return (
                      <>
                        {groupedChats.today.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                              Today
                            </div>
                            {groupedChats.today.map((chat, index) => (
                              <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <ChatItem
                                  chat={chat}
                                  isActive={chat.id === id}
                                  onDelete={chatId => {
                                    setDeleteId(chatId);
                                    openDeleteDialog();
                                  }}
                                  setOpenMobile={setOpenMobile}
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}

                        {groupedChats.yesterday.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                              Yesterday
                            </div>
                            {groupedChats.yesterday.map((chat, index) => (
                              <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <ChatItem
                                  chat={chat}
                                  isActive={chat.id === id}
                                  onDelete={chatId => {
                                    setDeleteId(chatId);
                                    openDeleteDialog();
                                  }}
                                  setOpenMobile={setOpenMobile}
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}

                        {groupedChats.lastWeek.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                              Last 7 days
                            </div>
                            {groupedChats.lastWeek.map((chat, index) => (
                              <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <ChatItem
                                  chat={chat}
                                  isActive={chat.id === id}
                                  onDelete={chatId => {
                                    setDeleteId(chatId);
                                    openDeleteDialog();
                                  }}
                                  setOpenMobile={setOpenMobile}
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}

                        {groupedChats.lastMonth.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                              Last 30 days
                            </div>
                            {groupedChats.lastMonth.map((chat, index) => (
                              <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <ChatItem
                                  chat={chat}
                                  isActive={chat.id === id}
                                  onDelete={chatId => {
                                    setDeleteId(chatId);
                                    openDeleteDialog();
                                  }}
                                  setOpenMobile={setOpenMobile}
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}

                        {groupedChats.older.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                              Older than last month
                            </div>
                            {groupedChats.older.map((chat, index) => (
                              <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <ChatItem
                                  chat={chat}
                                  isActive={chat.id === id}
                                  onDelete={chatId => {
                                    setDeleteId(chatId);
                                    openDeleteDialog();
                                  }}
                                  setOpenMobile={setOpenMobile}
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </>
                    );
                  })()
                )}
              </motion.div>
            </SidebarMenu>
          )}

          {!prototypeMode && (
            <motion.div
              onViewportEnter={() => {
                if (!isValidating && !hasReachedEnd) {
                  setSize(size => size + 1);
                }
              }}
            />
          )}

          {hasReachedEnd ? (
            <div className="mt-8 flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
              {prototypeMode
                ? 'Mock chat history loaded (prototype mode)'
                : 'You have reached the end of your chat history.'}
            </div>
          ) : !prototypeMode ? (
            <div className="mt-8 flex flex-row items-center gap-2 p-2 text-zinc-500 dark:text-zinc-400">
              <div className="animate-spin">
                <LoaderIcon />
              </div>
              <div>Loading Chats...</div>
            </div>
          ) : null}
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your chat and remove it
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
