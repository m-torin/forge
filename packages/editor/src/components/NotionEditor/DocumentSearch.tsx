"use client";

import {
  IconCalendar,
  IconClock,
  IconFileText,
  IconFilter,
  IconHash,
  IconHighlight,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconTarget,
  IconX,
} from "@tabler/icons-react";
import { clsx } from "clsx";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SavedDocument } from "../../hooks/use-document-persistence";

// Search filters interface
export interface SearchFilters {
  dateRange?: {
    start?: string;
    end?: string;
  };
  wordCountRange?: {
    min?: number;
    max?: number;
  };
  hasContent?: boolean;
  searchIn: ("title" | "content" | "both")[];
  sortBy: "relevance" | "modified" | "created" | "title" | "wordCount";
  sortOrder: "asc" | "desc";
}

export interface SearchResult {
  document: SavedDocument;
  relevanceScore: number;
  titleMatches: Array<{ text: string; isMatch: boolean }>;
  contentMatches: Array<{
    text: string;
    isMatch: boolean;
    context: string;
    position: number;
  }>;
  matchCount: number;
}

export interface DocumentSearchProps {
  documents: Record<string, SavedDocument>;
  onSelectDocument: (documentId: string) => void;
  className?: string;
  placeholder?: string;
  maxResults?: number;
  highlightMatches?: boolean;
}

export function DocumentSearch({
  documents,
  onSelectDocument,
  className,
  placeholder = "Search across all documents...",
  maxResults = 50,
  highlightMatches = true,
}: DocumentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    searchIn: ["both"],
    sortBy: "relevance",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enhanced search algorithm with scoring
  const performSearch = useCallback(
    (query: string, docs: Record<string, SavedDocument>): SearchResult[] => {
      if (!query.trim()) return [];

      const searchTerms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);
      const results: SearchResult[] = [];

      Object.values(docs).forEach((document) => {
        let relevanceScore = 0;
        let matchCount = 0;
        const titleMatches: Array<{ text: string; isMatch: boolean }> = [];
        const contentMatches: Array<{
          text: string;
          isMatch: boolean;
          context: string;
          position: number;
        }> = [];

        // Apply date filter
        if (filters.dateRange?.start || filters.dateRange?.end) {
          const docDate = new Date(document.modified);
          if (
            filters.dateRange.start &&
            docDate < new Date(filters.dateRange.start)
          )
            return;
          if (
            filters.dateRange.end &&
            docDate > new Date(filters.dateRange.end)
          )
            return;
        }

        // Apply word count filter
        if (
          filters.wordCountRange?.min &&
          document.wordCount < filters.wordCountRange.min
        )
          return;
        if (
          filters.wordCountRange?.max &&
          document.wordCount > filters.wordCountRange.max
        )
          return;

        // Apply content filter
        if (filters.hasContent && document.content.text.trim().length === 0)
          return;

        // Search in title
        if (
          filters.searchIn.includes("title") ||
          filters.searchIn.includes("both")
        ) {
          const _titleLower = document.title.toLowerCase();
          const titleWords = document.title.split(/(\s+)/);

          titleWords.forEach((word) => {
            const wordLower = word.toLowerCase();
            const isMatch = searchTerms.some((term) =>
              wordLower.includes(term),
            );
            titleMatches.push({ text: word, isMatch });

            if (isMatch) {
              matchCount++;
              // Title matches get higher relevance score
              relevanceScore += searchTerms.reduce((score, term) => {
                if (wordLower.includes(term)) {
                  // Exact match gets highest score
                  if (wordLower === term) score += 10;
                  // Word starts with term gets high score
                  else if (wordLower.startsWith(term)) score += 7;
                  // Word contains term gets medium score
                  else score += 4;
                }
                return score;
              }, 0);
            }
          });
        }

        // Search in content
        if (
          filters.searchIn.includes("content") ||
          filters.searchIn.includes("both")
        ) {
          const contentText = document.content.text;
          const contentLower = contentText.toLowerCase();

          searchTerms.forEach((term) => {
            let index = 0;
            while ((index = contentLower.indexOf(term, index)) !== -1) {
              matchCount++;
              relevanceScore += 2; // Content matches get lower score than title

              // Extract context around the match
              const contextStart = Math.max(0, index - 50);
              const contextEnd = Math.min(
                contentText.length,
                index + term.length + 50,
              );
              const context = contentText.slice(contextStart, contextEnd);

              contentMatches.push({
                text: term,
                isMatch: true,
                context: context,
                position: index,
              });

              index += term.length;
            }
          });
        }

        // Boost score for recent documents
        const daysSinceModified =
          (Date.now() - new Date(document.modified).getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysSinceModified < 7) relevanceScore += 3;
        else if (daysSinceModified < 30) relevanceScore += 1;

        // Boost score for longer documents (more comprehensive content)
        if (document.wordCount > 500) relevanceScore += 1;

        if (matchCount > 0) {
          results.push({
            document,
            relevanceScore,
            titleMatches,
            contentMatches: contentMatches.slice(0, 3), // Limit context matches
            matchCount,
          });
        }
      });

      return results;
    },
    [filters],
  );

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const results = performSearch(searchQuery, documents);
    // Sort results
    results.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "relevance":
          comparison = a.relevanceScore - b.relevanceScore;
          break;
        case "title":
          comparison = a.document.title.localeCompare(b.document.title);
          break;
        case "modified":
          comparison =
            new Date(a.document.modified).getTime() -
            new Date(b.document.modified).getTime();
          break;
        case "created":
          comparison =
            new Date(a.document.created).getTime() -
            new Date(b.document.created).getTime();
          break;
        case "wordCount":
          comparison = a.document.wordCount - b.document.wordCount;
          break;
      }
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });
    return results.slice(0, maxResults);
  }, [searchQuery, documents, filters, performSearch, maxResults]);

  // Set isSearching state when searchQuery or dependencies change
  useEffect(() => {
    setIsSearching(!!searchQuery.trim());
  }, [searchQuery, documents, filters, performSearch, maxResults]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Highlight text matches
  const highlightText = (parts: Array<{ text: string; isMatch: boolean }>) => {
    return parts.map((part) => (
      <span
        key={`highlight-${part.text}-${part.isMatch}-${part.text.length}`}
        className={clsx(
          part.isMatch &&
            highlightMatches &&
            "bg-yellow-200 font-medium text-yellow-900",
        )}
      >
        {part.text}
      </span>
    ));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={clsx("document-search", className)}>
      <div className="relative">
        <div className="relative">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-20 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 transform items-center gap-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <IconX size={16} />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "rounded p-1 text-gray-400 transition-colors hover:text-gray-600",
                showFilters && "bg-blue-100 text-blue-600",
              )}
              title="Search Filters"
            >
              <IconFilter size={16} />
            </button>
          </div>
        </div>

        <div className="absolute right-24 top-1/2 hidden -translate-y-1/2 transform text-xs text-gray-400 sm:block">
          <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-600 shadow-sm">
            ⌘K
          </kbd>
        </div>
      </div>

      {showFilters && (
        <div className="mt-3 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search In
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: "both",
                    label: "Title & Content",
                    icon: IconFileText,
                  },
                  { value: "title", label: "Title Only", icon: IconHash },
                  {
                    value: "content",
                    label: "Content Only",
                    icon: IconFileText,
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="searchIn"
                      value={option.value}
                      checked={filters.searchIn.includes(option.value as any)}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          searchIn: [e.target.value as any],
                        }))
                      }
                      className="text-blue-600"
                    />
                    <option.icon size={14} className="text-gray-500" />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as any,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="modified">Last Modified</option>
                <option value="created">Date Created</option>
                <option value="title">Title</option>
                <option value="wordCount">Word Count</option>
              </select>

              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
                  }))
                }
                className="mt-2 flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                {filters.sortOrder === "asc" ? (
                  <IconSortAscending size={14} />
                ) : (
                  <IconSortDescending size={14} />
                )}
                {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>

            <div>
              <label className="mb-2 block flex items-center gap-1 text-sm font-medium text-gray-700">
                <IconCalendar size={14} />
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  placeholder="From"
                  value={filters.dateRange?.start || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        start: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  placeholder="To"
                  value={filters.dateRange?.end || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        end: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-300 pt-2">
            <button
              onClick={() =>
                setFilters({
                  searchIn: ["both"],
                  sortBy: "relevance",
                  sortOrder: "desc",
                })
              }
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="text-sm text-blue-600 transition-colors hover:text-blue-800"
            >
              Hide Filters
            </button>
          </div>
        </div>
      )}

      {searchQuery && (
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <IconTarget size={16} />
              <span>
                {isSearching
                  ? "Searching..."
                  : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`}
                {searchQuery && ` for "${searchQuery}"`}
              </span>
            </div>
            {searchResults.length > 0 && (
              <div className="text-xs">
                Sorted by {filters.sortBy} ({filters.sortOrder})
              </div>
            )}
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto">
            {searchResults.length === 0 && !isSearching ? (
              <div className="py-8 text-center text-gray-500">
                <IconSearch size={32} className="mx-auto mb-3 opacity-50" />
                <p>No documents found matching your search.</p>
                <p className="mt-1 text-sm">
                  Try different keywords or adjust your filters.
                </p>
              </div>
            ) : (
              searchResults.map((result) => (
                <div
                  key={result.document.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectDocument(result.document.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectDocument(result.document.id);
                    }
                  }}
                  className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 transition-colors group-hover:text-blue-600">
                        {result.titleMatches.length > 0
                          ? highlightText(result.titleMatches)
                          : result.document.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <IconClock size={12} />
                          {formatDate(result.document.modified)}
                        </span>
                        <span>{result.document.wordCount} words</span>
                        <span className="flex items-center gap-1">
                          <IconHighlight size={12} />
                          {result.matchCount} match
                          {result.matchCount !== 1 ? "es" : ""}
                        </span>
                        {filters.sortBy === "relevance" && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                            {result.relevanceScore} pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {result.contentMatches.length > 0 && (
                    <div className="space-y-2">
                      {result.contentMatches.map((match) => (
                        <div key={match.text + match.position}>
                          <span className="mb-1 block text-xs text-gray-500">
                            Match in content:
                          </span>
                          <span className="leading-relaxed">
                            ...
                            {match.context
                              .split(match.text)
                              .map((part, partIdx, arr) => (
                                <React.Fragment
                                  key={`context-${match.position}-${match.text}-${part.slice(0, 10)}-${part.length}`}
                                >
                                  {part}
                                  {partIdx < arr.length - 1 && (
                                    <mark className="rounded bg-yellow-200 px-1 font-medium text-yellow-900">
                                      {match.text}
                                    </mark>
                                  )}
                                </React.Fragment>
                              ))}
                            ...
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
