import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';
import { Cross1Icon } from '@radix-ui/react-icons';
import { memo } from 'react';
import { Button } from './ui/button';

function PureArtifactCloseButton() {
  const { setArtifact } = useArtifact();

  return (
    <Button
      data-testid="artifact-close-button"
      variant="outline"
      className="h-fit p-2 dark:hover:bg-zinc-700"
      onClick={() => {
        setArtifact(currentArtifact =>
          currentArtifact.status === 'streaming'
            ? {
                ...currentArtifact,
                isVisible: false,
              }
            : { ...initialArtifactData, status: 'idle' },
        );
      }}
    >
      <Cross1Icon className="h-[18px] w-[18px]" />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
