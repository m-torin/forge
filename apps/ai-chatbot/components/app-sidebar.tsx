'use client';

import { FileText, Home, MessageSquare } from 'lucide-react';
import type { User } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const isChat = pathname?.startsWith('/chat');
  const isEditor = pathname?.startsWith('/editor');

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
                AI Workspace
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="h-8 p-1 md:h-fit md:p-2"
                  onClick={() => {
                    setOpenMobile(false);
                    if (isChat) {
                      router.push('/chat');
                    } else if (isEditor) {
                      router.push('/editor');
                    } else {
                      router.push('/');
                    }
                    router.refresh();
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end" className="hidden md:block">
                {isChat ? 'New Chat' : isEditor ? 'New Document' : 'New'}
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>

        {/* Mode Navigation */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'}>
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <Home className="h-4 w-4" />
                Home
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isChat}>
              <Link href="/chat" onClick={() => setOpenMobile(false)}>
                <MessageSquare className="h-4 w-4" />
                Chat Mode
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isEditor}>
              <Link href="/editor" onClick={() => setOpenMobile(false)}>
                <FileText className="h-4 w-4" />
                Editor Mode
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
