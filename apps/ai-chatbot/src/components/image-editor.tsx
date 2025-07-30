import { LoaderIcon } from '#/components/icons';
import { RESPONSIVE } from '#/lib/ui-constants';
import cn from 'classnames';
import Image from 'next/image';

interface ImageEditorProps {
  title: string;
  content: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: string;
  isInline: boolean;
}

export function ImageEditor({ title, content, status, isInline }: ImageEditorProps) {
  return (
    <div
      className={cn('flex w-full flex-row items-center justify-center', {
        'h-[calc(100dvh-60px)] sm:h-[calc(100dvh-80px)]': !isInline,
        'h-[200px] sm:h-[250px]': isInline,
      })}
    >
      {status === 'streaming' ? (
        <div className="flex flex-row items-center gap-4">
          {!isInline && (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          )}
          <div>Generating Image...</div>
        </div>
      ) : (
        <div>
          <Image
            className={cn('h-fit w-full max-w-[800px]', {
              [`${RESPONSIVE.SPACING.MOBILE.XS} md:p-20`]: !isInline,
            })}
            src={`data:image/png;base64,${content}`}
            alt={title}
            width={800}
            height={600}
            sizes="(max-width: 800px) 100vw, 800px"
          />
        </div>
      )}
    </div>
  );
}
