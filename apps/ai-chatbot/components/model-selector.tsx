'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatModelAsCookie } from '@/app/(main)/chat/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels, type ChatModelId } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { CheckCircledIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import type { Session } from 'next-auth';

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session;
  selectedModelId: ChatModelId;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(selectedModelId);

  const userType = session.user.type;
  const { availableChatModelIds } = entitlementsByUserType[userType];

  const availableChatModels = chatModels.filter(chatModel =>
    availableChatModelIds.includes(chatModel.id),
  );

  const selectedChatModel = useMemo(
    () => availableChatModels.find(chatModel => chatModel.id === optimisticModelId),
    [optimisticModelId, availableChatModels],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button data-testid="model-selector" variant="outline" className="md:h-[34px] md:px-2">
          {selectedChatModel?.name}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {availableChatModels.map(chatModel => {
          const { id } = chatModel;

          return (
            <DropdownMenuItem
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setOpen(false);

                startTransition(() => {
                  setOptimisticModelId(id);
                  saveChatModelAsCookie(id);
                });
              }}
              data-active={id === optimisticModelId}
              asChild
            >
              <button
                type="button"
                className="group/item flex w-full flex-row items-center justify-between gap-4"
              >
                <div className="flex flex-col items-start gap-1">
                  <div>{chatModel.name}</div>
                  <div className="text-xs text-muted-foreground">{chatModel.description}</div>
                </div>

                <div className="text-foreground opacity-0 group-data-[active=true]/item:opacity-100 dark:text-foreground">
                  <CheckCircledIcon className="h-4 w-4" />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
