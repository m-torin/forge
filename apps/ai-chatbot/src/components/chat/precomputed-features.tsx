import { enhancedSearchFlag, ragEnabledFlag } from '#/lib/flags';
import { precomputeFlags } from '#/lib/precompute-flags';
import { headers } from 'next/headers';

interface PrecomputedFeaturesProps {
  children: React.ReactNode;
}

export async function PrecomputedFeatures({ children }: PrecomputedFeaturesProps) {
  const headerStore = await headers();
  const flagsCode = headerStore.get('x-flags-code');

  // Use precomputed values if available, otherwise evaluate normally
  const ragEnabled = flagsCode
    ? ragEnabledFlag(flagsCode, precomputeFlags)
    : await ragEnabledFlag();

  const enhancedSearch = flagsCode
    ? enhancedSearchFlag(flagsCode, precomputeFlags)
    : await enhancedSearchFlag();

  return (
    <div data-rag-enabled={ragEnabled} data-enhanced-search={enhancedSearch}>
      {children}
      {ragEnabled && <div className="rag-indicator">🔍 RAG Search Available</div>}
      {enhancedSearch && <div className="enhanced-search-indicator">⚡ Enhanced Search Active</div>}
    </div>
  );
}
