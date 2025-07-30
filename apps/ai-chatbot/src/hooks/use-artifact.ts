'use client';

import { UIArtifact } from '#/components/artifact';
import { useLocalStorage } from '@mantine/hooks';
import { useCallback, useMemo } from 'react';

/**
 * Initial artifact data with default values
 */
export const initialArtifactData: UIArtifact = {
  documentId: 'init',
  content: '',
  kind: 'text',
  title: '',
  status: 'idle',
  isVisible: false,
  boundingBox: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

/**
 * Selector function type for artifact state
 */
type Selector<T> = (state: UIArtifact) => T;

/**
 * Hook to select specific artifact state values
 * @param selector - Function to select state subset
 * @returns Selected artifact state value
 */
export function useArtifactSelector<Selected>(selector: Selector<Selected>) {
  const [localArtifact] = useLocalStorage<UIArtifact>({
    key: 'artifact',
    defaultValue: initialArtifactData,
  });

  const selectedValue = useMemo(() => {
    return selector(localArtifact || initialArtifactData);
  }, [localArtifact, selector]);

  return selectedValue;
}

/**
 * Hook for managing artifact state with localStorage persistence
 * @returns Artifact state and setter function
 */
export function useArtifact() {
  const [artifact, setLocalArtifact] = useLocalStorage<UIArtifact>({
    key: 'artifact',
    defaultValue: initialArtifactData,
  });

  const setArtifact = useCallback(
    (updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => {
      const artifactToUpdate = artifact || initialArtifactData;

      if (typeof updaterFn === 'function') {
        setLocalArtifact(updaterFn(artifactToUpdate));
      } else {
        setLocalArtifact(updaterFn);
      }
    },
    [artifact, setLocalArtifact],
  );

  const [metadata, setMetadata] = useLocalStorage<any>({
    key:
      artifact.documentId !== 'init'
        ? `artifact-metadata-${artifact.documentId}`
        : 'artifact-metadata-default',
    defaultValue: null,
  });

  return useMemo(
    () => ({
      artifact: artifact || initialArtifactData,
      setArtifact,
      metadata,
      setMetadata,
    }),
    [artifact, setArtifact, metadata, setMetadata],
  );
}
