'use client';

import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon, RefreshCwIcon } from 'lucide-react';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
  type ComponentProps,
} from 'react';
import { cn } from '../../utils';
import { Button } from './ui/button';

type WebPreviewContextType = {
  url: string;
  setUrl: (url: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
  fullscreen: boolean;
  toggleFullscreen: () => void;
};

const WebPreviewContext = createContext<WebPreviewContextType | null>(null);

const useWebPreview = () => {
  const context = useContext(WebPreviewContext);
  if (!context) {
    throw new Error('useWebPreview must be used within a WebPreview component');
  }
  return context;
};

export type WebPreviewProps = ComponentProps<'div'> & {
  defaultUrl?: string;
  onUrlChange?: (url: string) => void;
};

export const WebPreview = ({
  defaultUrl = '',
  onUrlChange,
  children,
  className,
  ...props
}: WebPreviewProps) => {
  const [url, setUrlState] = useState(defaultUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const setUrl = useCallback(
    (newUrl: string) => {
      setUrlState(newUrl);
      onUrlChange?.(newUrl);
    },
    [onUrlChange],
  );

  const goBack = useCallback(() => {
    // In a real implementation, this would manage history
    setCanGoBack(false);
  }, []);

  const goForward = useCallback(() => {
    // In a real implementation, this would manage history
    setCanGoForward(false);
  }, []);

  const refresh = useCallback(() => {
    // Force refresh by updating a timestamp or similar
    setUrl(url);
  }, [url, setUrl]);

  const toggleFullscreen = useCallback(() => {
    setFullscreen(!fullscreen);
  }, [fullscreen]);

  const contextValue: WebPreviewContextType = {
    url,
    setUrl,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    refresh,
    fullscreen,
    toggleFullscreen,
  };

  return (
    <WebPreviewContext.Provider value={contextValue}>
      <div
        className={cn(
          'bg-background flex flex-col overflow-hidden rounded-lg border',
          fullscreen && 'fixed inset-0 z-50',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </WebPreviewContext.Provider>
  );
};

export type WebPreviewNavigationProps = ComponentProps<'div'>;

export const WebPreviewNavigation = ({
  children,
  className,
  ...props
}: WebPreviewNavigationProps) => (
  <div className={cn('bg-muted/30 flex items-center gap-2 border-b p-3', className)} {...props}>
    {children}
  </div>
);

export type WebPreviewNavigationButtonProps = ComponentProps<typeof Button> & {
  tooltip?: string;
};

export const WebPreviewNavigationButton = ({
  tooltip,
  className,
  ...props
}: WebPreviewNavigationButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn('h-8 w-8 p-0', className)}
    title={tooltip}
    {...props}
  />
);

export type WebPreviewUrlProps = ComponentProps<'input'> & {
  src?: string;
};

export const WebPreviewUrl = ({ src, className, ...props }: WebPreviewUrlProps) => {
  const { url, setUrl, canGoBack, canGoForward, goBack, goForward, refresh } = useWebPreview();

  const displayUrl = src || url;

  return (
    <div className="flex flex-1 items-center gap-2">
      <WebPreviewNavigationButton onClick={goBack} disabled={!canGoBack} tooltip="Go back">
        <ChevronLeftIcon className="h-4 w-4" />
      </WebPreviewNavigationButton>

      <WebPreviewNavigationButton onClick={goForward} disabled={!canGoForward} tooltip="Go forward">
        <ChevronRightIcon className="h-4 w-4" />
      </WebPreviewNavigationButton>

      <WebPreviewNavigationButton onClick={refresh} tooltip="Refresh">
        <RefreshCwIcon className="h-4 w-4" />
      </WebPreviewNavigationButton>

      <input
        type="text"
        value={displayUrl}
        onChange={e => setUrl(e.target.value)}
        className={cn(
          'bg-background flex-1 rounded-md border px-3 py-1.5 text-sm',
          'focus:ring-ring focus:border-transparent focus:outline-none focus:ring-2',
          className,
        )}
        placeholder="Enter URL..."
        {...props}
      />

      <WebPreviewNavigationButton onClick={() => {}} tooltip="Fullscreen">
        <ExpandIcon className="h-4 w-4" />
      </WebPreviewNavigationButton>
    </div>
  );
};

export type WebPreviewBodyProps = ComponentProps<'iframe'> & {
  loading?: ReactNode;
};

export const WebPreviewBody = ({ src, loading, className, ...props }: WebPreviewBodyProps) => {
  const { url } = useWebPreview();
  const [isLoading, setIsLoading] = useState(true);

  const iframeSrc = src || url;

  return (
    <div className="relative flex-1 overflow-hidden">
      {isLoading && loading && (
        <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
          {loading}
        </div>
      )}
      {iframeSrc && (
        <iframe
          src={iframeSrc}
          className={cn('h-full w-full border-0', className)}
          onLoad={() => setIsLoading(false)}
          {...props}
        />
      )}
    </div>
  );
};

type ConsoleLog = {
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: Date;
};

export type WebPreviewConsoleProps = ComponentProps<'div'> & {
  logs?: ConsoleLog[];
};

export const WebPreviewConsole = ({ logs = [], className, ...props }: WebPreviewConsoleProps) => (
  <div
    className={cn('bg-muted/30 max-h-32 overflow-y-auto border-t p-3 font-mono text-xs', className)}
    {...props}
  >
    <div className="space-y-1">
      {logs.map((log, index) => (
        <div
          key={index}
          className={cn(
            'flex items-start gap-2',
            log.level === 'error' && 'text-destructive',
            log.level === 'warn' && 'text-yellow-600 dark:text-yellow-400',
          )}
        >
          <span className="text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
          <span className="flex-1">{log.message}</span>
        </div>
      ))}
    </div>
  </div>
);
