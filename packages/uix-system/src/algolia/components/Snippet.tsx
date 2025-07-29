'use client';

import { Snippet as InstantSearchSnippet } from 'react-instantsearch';

interface SnippetProps extends Record<string, any> {
  attribute: string;
  hit: any;
  className?: string;
  highlightedTagName?: string;
  nonHighlightedTagName?: string;
  separator?: string;
}

export default function Snippet({
  attribute,
  hit,
  className = '',
  highlightedTagName = 'mark',
  nonHighlightedTagName = 'span',
  separator = ', ',
  ...props
}: SnippetProps) {
  return (
    <InstantSearchSnippet
      attribute={attribute}
      classNames={{
        root: className || '',
        highlighted: 'bg-yellow-200 dark:bg-yellow-800 font-semibold',
        nonHighlighted: '',
        separator: 'text-gray-500 dark:text-gray-400',
      }}
      highlightedTagName={highlightedTagName}
      hit={hit}
      nonHighlightedTagName={nonHighlightedTagName}
      separator={separator}
      {...props}
    />
  );
}
