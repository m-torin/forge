'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { AIFeaturesPanel } from '#/components/features/ai-features-panel';
import { PlusIcon } from '#/components/icons';
import { KeyboardHint } from '#/components/keyboard-navigation';
import { QuickMcpStatus } from '#/components/mcp/quick-status';
import { SidebarHistory } from '#/components/sidebar-history';
import { SidebarUserNav } from '#/components/sidebar-user-nav';
import { Button } from '#/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '#/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import Link from 'next/link';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const handleFeatureSelect = useCallback(
    (prompt: string) => {
      // Create a new chat with the selected feature prompt
      const chatId = crypto.randomUUID();
      const encodedPrompt = encodeURIComponent(prompt);
      setOpenMobile(false);
      router.push(`/chat/${chatId}?query=${encodedPrompt}`);
    },
    [router, setOpenMobile],
  );

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row items-center gap-3"
            >
              <span className="cursor-pointer rounded-md px-2 text-lg font-semibold hover:bg-muted">
                Chatbot
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="group relative h-fit p-2"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <PlusIcon />
                  <KeyboardHint shortcut="⌘K" className="absolute -bottom-6 right-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-4">
        {/* AI Features Panel */}
        {user && (
          <div className="px-2">
            <AIFeaturesPanel
              userType={(user as any).type || 'regular'}
              onFeatureSelect={handleFeatureSelect}
            />
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1">
          <SidebarHistory user={user} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        {/* Quick MCP Status */}
        <div className="px-2 pb-2">
          <QuickMcpStatus />
        </div>

        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
