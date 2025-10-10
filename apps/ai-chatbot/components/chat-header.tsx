'use client';

import { MoonIcon, PlusIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { AppHeader } from '@/components/layouts/app-header';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { memo } from 'react';
import { useSidebar } from './ui/sidebar';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { theme, setTheme } = useTheme();

  const { width: windowWidth } = useWindowSize();

  return (
    <AppHeader
      variant="chat"
      leftSlot={
        <>
          <SidebarToggle />
          {(!open || windowWidth < 768) && (
            <Button
              variant="outline"
              className="ml-auto px-2 md:ml-0 md:h-fit md:px-2"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          )}
        </>
      }
      centerSlot={
        !isReadonly ? (
          <VisibilitySelector chatId={chatId} selectedVisibilityType={selectedVisibilityType} />
        ) : null
      }
      rightSlot={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-[34px] w-[34px] rounded-lg p-0"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
        </Button>
      }
    />
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
