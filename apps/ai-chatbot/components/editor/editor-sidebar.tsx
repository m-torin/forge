'use client';

import { FileText, Home, MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { User } from 'next-auth';

type DocumentType = {
  id: string;
  title: string;
  createdAt: Date;
  // updatedAt: Date;
  // kind: string;
};

interface EditorSidebarProps {
  user?: User;
  documents?: DocumentType[];
}

export function EditorSidebar({ user, documents = [] }: EditorSidebarProps) {
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
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <FileText className="h-6 w-6" />
          <span className="font-semibold">Documents</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2 py-2">
          <Button asChild className="w-full justify-start">
            <Link href="/editor/new">
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Link>
          </Button>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/chat">
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
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <div className="px-2 py-2 text-sm text-muted-foreground">
            Signed in as {user.name || user.email}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
