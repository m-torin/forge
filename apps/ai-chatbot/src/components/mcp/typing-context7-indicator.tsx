/**
 * Simple Context7 typing indicator - shows when user might benefit from documentation
 */

'use client';

import { cn } from '#/lib/utils';
import { BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TypingContext7IndicatorProps {
  input: string;
  className?: string;
}

const LIBRARY_PATTERNS = [
  /\breact\b/i,
  /\bnext\.?js\b/i,
  /\btailwind\b/i,
  /\bvue\b/i,
  /\bangular\b/i,
  /\bsvelte\b/i,
  /\bnode\.?js\b/i,
  /\btypescript\b/i,
  /\bexpress\b/i,
  /\bmantine\b/i,
  /\bprisma\b/i,
  /\bzod\b/i,
  /\bframer.?motion\b/i,
];

export function TypingContext7Indicator({ input, className }: TypingContext7IndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);
  const [detectedLibraries, setDetectedLibraries] = useState<string[]>([]);

  useEffect(() => {
    const libraries = LIBRARY_PATTERNS.map(pattern => {
      const match = input.match(pattern);
      return match ? match[0].toLowerCase() : null;
    }).filter(Boolean) as string[];

    const uniqueLibraries = [...new Set(libraries)];

    if (uniqueLibraries.length > 0) {
      setDetectedLibraries(uniqueLibraries);
      setShowIndicator(true);

      // Auto-hide after a few seconds
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowIndicator(false);
      setDetectedLibraries([]);
    }
  }, [input]);

  if (!showIndicator || detectedLibraries.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-600 duration-300 animate-in fade-in slide-in-from-bottom-2',
        className,
      )}
    >
      <BookOpen className="h-3 w-3" />
      <span>Context7 will enhance with {detectedLibraries.slice(0, 2).join(', ')} docs</span>
      {detectedLibraries.length > 2 && (
        <span className="opacity-60">+{detectedLibraries.length - 2}</span>
      )}
    </div>
  );
}
