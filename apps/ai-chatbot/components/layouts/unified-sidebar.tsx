'use client';

import { FileText, Home, MessageSquare, Plus } from 'lucide-react';
import type { User } from 'next-auth';
import Link from 'next/link';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type DocumentType = {
  id: string;
  title: string;
  createdAt: Date;
};

export interface UnifiedSidebarProps {
  user?: User;
  mode: 'chat' | 'editor';
  documents?: DocumentType[];
}

export function UnifiedSidebar({ user, mode, documents = [] }: UnifiedSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const isChat = pathname?.startsWith('/chat') || mode === 'chat';
  const isEditor = pathname?.startsWith('/editor') || mode === 'editor';

  const handleNewChat = () => {
    setOpenMobile(false);
    if (isChat) {
      router.push('/chat');
    } else if (isEditor) {
      router.push('/editor');
    } else {
      router.push('/');
    }
    router.refresh();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const daysDiff = Math.floor(diff / (1000 * 3600 * 24));

    if (daysDiff === 0) {
      return 'Today';
    } else if (daysDiff === 1) {
      return 'Yesterday';
    } else if (daysDiff < 7) {
      return `${daysDiff} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Sidebar className={mode === 'chat' ? 'group-data-[side=left]:border-r-0' : ''}>
      <SidebarHeader>
        {mode === 'chat' ? (
          // Chat Mode Header - AI Workspace + Plus Button + Navigation
          <>
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
                      onClick={handleNewChat}
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

            {/* Chat Navigation */}
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
          </>
        ) : (
          // Editor Mode Header - Simple Documents Title
          <div className="flex items-center gap-2 px-2 py-1">
            <FileText className="h-6 w-6" />
            <span className="font-semibold">Documents</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {mode === 'chat' ? (
          // Chat History
          <SidebarHistory user={user} />
        ) : (
          // Editor Mode Content
          <>
            <div className="px-2 py-2">
              <Button asChild className="w-full justify-start">
                <Link href="/editor/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Document
                </Link>
              </Button>
            </div>

            {/* Editor Navigation Menu */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/" onClick={() => setOpenMobile(false)}>
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chat" onClick={() => setOpenMobile(false)}>
                    <MessageSquare className="h-4 w-4" />
                    Chat Mode
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="px-2 py-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Recent Documents</h3>
              {documents.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No documents yet. Create your first document!
                </div>
              ) : (
                <div className="space-y-1">
                  {documents.slice(0, 5).map(document => (
                    <SidebarMenuButton key={document.id} asChild>
                      <Link
                        href={`/editor/${document.id}`}
                        className="flex flex-col items-start gap-1 p-2 text-left"
                      >
                        <div className="w-full truncate text-sm font-medium">{document.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(new Date(document.createdAt))}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  ))}
                  {documents.length > 5 && (
                    <div className="px-2 py-1">
                      <Link
                        href="/editor"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        View all documents →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        {mode === 'chat'
          ? user && <SidebarUserNav user={user} />
          : user && (
              <div className="px-2 py-2 text-sm text-muted-foreground">
                Signed in as {user.name || user.email}
              </div>
            )}
      </SidebarFooter>
    </Sidebar>
  );
}
