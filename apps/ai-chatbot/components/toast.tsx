'use client';

import { cn } from '@/lib/utils';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';

const iconsByType: Record<'success' | 'error', ReactNode> = {
  success: <CheckCircledIcon className="h-4 w-4" />,
  error: <AlertTriangle className="h-4 w-4" />,
};

export function toast(props: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom(id => (
    <Toast id={id} type={props.type} description={props.description} />
  ));
}

function Toast(props: ToastProps) {
  const { id, type, description } = props;

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [multiLine, setMultiLine] = useState(false);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;

    const update = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
      const lines = Math.round(el.scrollHeight / lineHeight);
      setMultiLine(lines > 1);
    };

    update(); // initial check
    const ro = new ResizeObserver(update); // re-check on width changes
    ro.observe(el);

    return () => ro.disconnect();
  }, [description]);

  return (
    <div className="flex w-full justify-center toast-mobile:w-[356px]">
      <div
        data-testid="toast"
        key={id}
        className={cn(
          'flex w-full flex-row gap-3 rounded-lg bg-zinc-100 p-3 toast-mobile:w-fit',
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
        <div ref={descriptionRef} className="text-sm text-zinc-950">
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
