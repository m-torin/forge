'use client';

import type { CustomUIDataTypes } from '#/lib/types';
import type { DataUIPart } from 'ai';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface DataStreamContextValue {
  dataStream: DataUIPart<CustomUIDataTypes>[];
  setDataStream: React.Dispatch<React.SetStateAction<DataUIPart<CustomUIDataTypes>[]>>;
}

const DataStreamContext = createContext<DataStreamContextValue | null>(null);

export function DataStreamProvider({ children }: { children: React.ReactNode }) {
  const [dataStream, setDataStream] = useState<DataUIPart<CustomUIDataTypes>[]>([]);

  // Memoize setDataStream to prevent unnecessary re-renders
  const stableSetDataStream = useCallback(setDataStream, [setDataStream]);

  const value = useMemo(
    () => ({
      dataStream,
      setDataStream: stableSetDataStream,
    }),
    [dataStream, stableSetDataStream],
  );

  return <DataStreamContext.Provider value={value}>{children}</DataStreamContext.Provider>;
}

export function useDataStream() {
  const context = useContext(DataStreamContext);
  if (!context) {
    throw new Error('useDataStream must be used within a DataStreamProvider');
  }
  return context;
}
