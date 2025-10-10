import type { Attachment } from '@/lib/types';
import { Cross2Icon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { Loader } from './elements/loader';
import { Button } from './ui/button';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
}) => {
  const { name, url, contentType } = attachment;

  return (
    <div
      data-testid="input-attachment-preview"
      className="group relative h-16 w-16 overflow-hidden rounded-lg border bg-muted"
    >
      {contentType?.startsWith('image') ? (
        <Image
          alt={name ?? 'An image attachment'}
          className="object-cover"
          fill
          sizes="4rem"
          src={url}
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          File
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader size={16} />
        </div>
      )}

      {onRemove && !isUploading && (
        <Button
          onClick={onRemove}
          size="sm"
          variant="destructive"
          className="absolute right-0.5 top-0.5 size-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Cross2Icon className="h-2 w-2" />
        </Button>
      )}

      <div className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/80 to-transparent px-1 py-0.5 text-[10px] text-white">
        {name}
      </div>
    </div>
  );
};
