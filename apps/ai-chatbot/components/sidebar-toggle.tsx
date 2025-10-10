import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Button } from './ui/button';

export function SidebarToggle({ className }: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-testid="sidebar-toggle-button"
          onClick={toggleSidebar}
          variant="outline"
          className={cn('h-8 px-1 md:h-fit md:px-2', className)}
        >
          <HamburgerMenuIcon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="hidden md:block">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
