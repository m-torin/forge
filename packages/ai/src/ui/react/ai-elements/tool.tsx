'use client';

import { CheckIcon, ChevronDownIcon, LoaderIcon, PlayIcon, XIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '../../utils';
import { CodeBlock } from './code-block';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

type ToolState = 'input-streaming' | 'input-available' | 'output-available' | 'output-error';

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ defaultOpen, className, ...props }: ToolProps) => {
  const shouldDefaultOpen = defaultOpen !== undefined ? defaultOpen : true;

  return (
    <Collapsible
      className={cn(
        'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=open]:animate-in',
        className,
      )}
      defaultOpen={shouldDefaultOpen}
      {...props}
    />
  );
};

export type ToolHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  type: string;
  state: ToolState;
};

export const ToolHeader = ({ type, state, className, children, ...props }: ToolHeaderProps) => {
  const getStateIcon = () => {
    switch (state) {
      case 'input-streaming':
        return <LoaderIcon className="size-3 animate-spin" />;
      case 'input-available':
        return <PlayIcon className="size-3" />;
      case 'output-available':
        return <CheckIcon className="size-3" />;
      case 'output-error':
        return <XIcon className="size-3" />;
      default:
        return <LoaderIcon className="size-3" />;
    }
  };

  const getStateLabel = () => {
    switch (state) {
      case 'input-streaming':
        return 'Pending';
      case 'input-available':
        return 'Running';
      case 'output-available':
        return 'Completed';
      case 'output-error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStateVariant = (): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (state) {
      case 'input-streaming':
        return 'outline';
      case 'input-available':
        return 'default';
      case 'output-available':
        return 'secondary';
      case 'output-error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <CollapsibleTrigger asChild className={cn('group', className)} {...props}>
      {children ?? (
        <div className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm">
          <div className="flex items-center gap-2">
            {getStateIcon()}
            <span className="font-medium">{type}</span>
            <Badge variant={getStateVariant()} className="text-xs">
              {getStateLabel()}
            </Badge>
          </div>
          <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
        </div>
      )}
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ children, className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in outline-none',
      className,
    )}
    {...props}
  >
    <div className="space-y-3 p-3 pt-0">{children}</div>
  </CollapsibleContent>
);

export type ToolInputProps = ComponentProps<'div'> & {
  input: unknown;
};

export const ToolInput = ({ input, className, ...props }: ToolInputProps) => (
  <div className={cn('space-y-2', className)} {...props}>
    <h4 className="text-muted-foreground text-sm font-medium">Input</h4>
    <CodeBlock language="json" code={JSON.stringify(input, null, 2)} className="text-xs" />
  </div>
);

export type ToolOutputProps = ComponentProps<'div'> & {
  output?: React.ReactNode;
  errorText?: string;
};

export const ToolOutput = ({ output, errorText, className, ...props }: ToolOutputProps) => {
  if (errorText) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        <h4 className="text-destructive text-sm font-medium">Error</h4>
        <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
          {errorText}
        </div>
      </div>
    );
  }

  if (output) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        <h4 className="text-muted-foreground text-sm font-medium">Output</h4>
        <div className="text-sm">{output}</div>
      </div>
    );
  }

  return null;
};
