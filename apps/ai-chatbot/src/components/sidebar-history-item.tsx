import {
  CheckCircleFillIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  ShareIcon,
  TrashIcon,
} from '#/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from '#/components/ui/sidebar';
import { useChatVisibility } from '#/hooks/chat/use-chat-visibility';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import type { Chat } from '#/lib/db/schema';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { memo } from 'react';

/**
 * Pure chat item component for sidebar history
 * @param chat - Chat data object
 * @param isActive - Whether this chat is currently active
 * @param onDelete - Callback for deleting the chat
 * @param setOpenMobile - Function to control mobile sidebar state
 */
const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  const { variants } = useAnimationSystem();
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibilityType: chat.visibility,
  });

  return (
    <motion.div
      variants={variants.sidebarItemVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
            <span>{chat.title}</span>
          </Link>
        </SidebarMenuButton>

        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild>
            <motion.div
              variants={variants.hoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              <SidebarMenuAction
                className="mr-0.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                showOnHover={!isActive}
              >
                <MoreHorizontalIcon />
                <span className="sr-only">More</span>
              </SidebarMenuAction>
            </motion.div>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="group cursor-pointer">
                <ShareIcon />
                <span>Share</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    className="group cursor-pointer flex-row justify-between"
                    onClick={() => {
                      setVisibilityType('private');
                    }}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <LockIcon size={12} />
                      <span>Private</span>
                    </div>
                    {visibilityType === 'private' && (
                      <motion.div
                        variants={variants.scaleVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <CheckCircleFillIcon />
                      </motion.div>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="group cursor-pointer flex-row justify-between"
                    onClick={() => {
                      setVisibilityType('public');
                    }}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <GlobeIcon />
                      <span>Public</span>
                    </div>
                    {visibilityType === 'public' && (
                      <motion.div
                        variants={variants.scaleVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <CheckCircleFillIcon />
                      </motion.div>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
              onSelect={() => onDelete(chat.id)}
            >
              <TrashIcon />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </motion.div>
  );
};

/**
 * Memoized chat item component for performance optimization
 */
export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});
