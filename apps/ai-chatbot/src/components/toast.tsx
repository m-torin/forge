'use client';

import { CheckCircleFillIcon, WarningIcon } from '#/components/icons';
import { RESPONSIVE } from '#/lib/ui-constants';
import { cn } from '#/lib/utils';
import { useMergedRef, useResizeObserver } from '@mantine/hooks';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';

/**
 * Icons for different toast types
 */
const iconsByType: Record<'success' | 'error', ReactNode> = {
  success: <CheckCircleFillIcon />,
  error: <WarningIcon />,
};

/**
 * Create and display a toast notification
 * @param props - Toast properties excluding id
 * @returns Toast instance
 */
export function toast(props: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom(id => (
    <Toast id={id} type={props.type} description={props.description} />
  ));
}

/**
 * Internal toast component with multiline support
 * @param props - Toast properties including id
 */
function Toast(props: ToastProps) {
  const { id, type, description } = props;

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [multiLine, setMultiLine] = useState(false);

  // Memoize update function to prevent recreation on every render
  const _updateMultiLine = useCallback(() => {
    const el = descriptionRef.current;
    if (!el) return;

    const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
    const lines = Math.round(el.scrollHeight / lineHeight);
    setMultiLine(lines > 1);
  }, []);

  // Use useResizeObserver instead of manual ResizeObserver
  const [resizeRef, rect] = useResizeObserver();
  const mergedRef = useMergedRef(descriptionRef, resizeRef);

  // Update multiLine state when dimensions change
  useEffect(() => {
    if (rect.height > 0) {
      const lineHeight = 20; // Approximate line height
      const lines = Math.round(rect.height / lineHeight);
      setMultiLine(lines > 1);
    }
  }, [rect.height]);

  return (
    <div
      className={`flex w-full justify-center toast-mobile:w-[356px] ${RESPONSIVE.LAYOUT.CONTENT_MOBILE} pb-safe-bottom`}
    >
      <div
        data-testid="toast"
        key={id}
        className={cn(
          'flex min-h-[48px] w-full touch-manipulation flex-row gap-3 rounded-lg bg-zinc-100 p-3 toast-mobile:w-fit',
          multiLine ? 'items-start' : 'items-center',
        )}
      >
        <div
          data-type={type}
          className={cn('data-[type=error]:text-red-600 data-[type=success]:text-green-600', {
            'pt-1': multiLine,
          })}
        >
          {iconsByType[type]}
        </div>
        <div ref={mergedRef} className="text-sm text-zinc-950">
          {description}
        </div>
      </div>
    </div>
  );
}

interface ToastProps {
  id: string | number;
  type: 'success' | 'error';
  description: string;
}
