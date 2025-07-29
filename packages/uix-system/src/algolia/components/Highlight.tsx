'use client';

import { Highlight as InstantSearchHighlight } from 'react-instantsearch';

interface HighlightProps extends Record<string, any> {
  attribute: string;
  hit: any;
  className?: string;
  highlightedTagName?: string;
  nonHighlightedTagName?: string;
  separator?: string;
}

export default function Highlight({
  attribute,
  hit,
  className = '',
  highlightedTagName = 'mark',
  nonHighlightedTagName = 'span',
  separator = ', ',
  ...props
}: HighlightProps) {
  return (
    <InstantSearchHighlight
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
