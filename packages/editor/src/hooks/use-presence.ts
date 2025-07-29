'use client';

import { useDebouncedCallback, useIdle, useMove } from '@mantine/hooks';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCollaboration } from './use-collaboration';

interface PresenceOptions {
  documentId: string;
  userId: string;
  updateInterval?: number;
  trackCursor?: boolean;
  trackSelection?: boolean;
  idleTimeout?: number; // milliseconds, defaults to 30000 (30 seconds)
}

export function usePresence(options: PresenceOptions): ReturnType<typeof useCollaboration> & {
  cursorPosition: { x: number; y: number } | null;
  selection: { start: number; end: number } | null;
  isActive: boolean;
  isIdle: boolean;
  isMoving: boolean;
  updateCursor: (x: number, y: number) => void;
  updateSelection: (start: number, end: number) => void;
  setActiveStatus: (active: boolean) => void;
  cursorRef: React.RefCallback<HTMLElement> | null;
  selectionRef: React.RefObject<HTMLElement | null>;
} {
  const { idleTimeout = 30000 } = options;
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const selectionRef = useRef<HTMLElement>(null);

  const collaboration = useCollaboration({
    documentId: options.documentId,
    userId: options.userId,
    enablePresence: true,
    enableCursors: options.trackCursor,
  });

  // Use Mantine's useIdle hook for activity detection
  const isIdle = useIdle(idleTimeout);
  const isActive = !isIdle;

  // Use Mantine's useMove hook for cursor tracking
  const { ref: cursorRef, active: isMoving } = useMove(
    ({ x, y }) => {
      if (options.trackCursor) {
        const newPosition = { x, y };
        setCursorPosition(newPosition);

        // Debounce cursor updates to collaboration service
        debouncedCursorUpdate(newPosition);
      }
    },
    {
      onScrubStart: () => {
        // Optional: Handle when cursor tracking starts
      },
      onScrubEnd: () => {
        // Optional: Handle when cursor tracking ends
      },
    },
  );

  // Debounced cursor update to avoid overwhelming the collaboration service
  const debouncedCursorUpdate = useDebouncedCallback(
    (position: { x: number; y: number }) => {
      collaboration.sendEvent({
        type: 'cursor',
        userId: options.userId,
        data: { cursor: position },
      });
    },
    50, // Update cursor position every 50ms max
  );

  // Debounced selection update
  const debouncedSelectionUpdate = useDebouncedCallback(
    (start: number, end: number) => {
      collaboration.sendEvent({
        type: 'selection',
        userId: options.userId,
        data: { selection: { start, end } },
      });
    },
    100, // Update selection every 100ms max
  );

  const updateCursor = useCallback(
    (x: number, y: number) => {
      if (!options.trackCursor) return;
      const newPosition = { x, y };
      setCursorPosition(newPosition);
      debouncedCursorUpdate(newPosition);
    },
    [options.trackCursor, debouncedCursorUpdate],
  );

  const updateSelection = useCallback(
    (start: number, end: number) => {
      if (!options.trackSelection) return;
      setSelection({ start, end });
      debouncedSelectionUpdate(start, end);
    },
    [options.trackSelection, debouncedSelectionUpdate],
  );

  const setActiveStatus = useCallback(
    (active: boolean) => {
      collaboration.updatePresence({ isActive: active });
    },
    [collaboration],
  );

  // Update collaboration service when idle state changes
  useEffect(() => {
    setActiveStatus(isActive);
  }, [isActive, setActiveStatus]);

  // Track text selection with optimized event handling
  useEffect(() => {
    if (!options.trackSelection) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        updateSelection(range.startOffset, range.endOffset);
      }
    };

    // Use passive event listener for better performance
    document.addEventListener('selectionchange', handleSelectionChange, { passive: true });
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [options.trackSelection, updateSelection]);

  return {
    ...collaboration,
    cursorPosition,
    selection,
    isActive,
    isIdle,
    isMoving,
    updateCursor,
    updateSelection,
    setActiveStatus,
    // Provide refs for components to attach to DOM elements
    cursorRef: options.trackCursor ? cursorRef : null,
    selectionRef,
  };
}
