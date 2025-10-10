'use client';

import { mergeAttributes } from '@tiptap/core';
import Link from '@tiptap/extension-link';

// =============================================================================
// ENHANCED LINK NODE
// =============================================================================

interface LinkOptions {
  openOnClick: boolean;
  linkOnPaste: boolean;
  autolink: boolean;
  protocols: Array<string>;
  HTMLAttributes: Record<string, any>;
  validate?: (url: string) => boolean;
  showPreviews: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    enhancedLink: {
      /**
       * Set a link mark
       */
      setEnhancedLink: (attributes: { href: string; target?: string }) => ReturnType;
      /**
       * Toggle a link mark
       */
      toggleEnhancedLink: (attributes: { href: string; target?: string }) => ReturnType;
      /**
       * Unset a link mark
       */
      unsetEnhancedLink: () => ReturnType;
    };
  }
}

export const EnhancedLinkExtension = Link.extend<LinkOptions>({
  name: 'enhancedLink',

  addOptions() {
    return {
      ...this.parent?.(),
      openOnClick: false,
      linkOnPaste: true,
      autolink: true,
      protocols: [],
      HTMLAttributes: {
        class: 'enhanced-notion-link',
      },
      validate: undefined,
      showPreviews: true,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      href: {
        default: null,
      },
      target: {
        default: null,
      },
      rel: {
        default: null,
      },
      class: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[href]:not([href *= "javascript:" i])',
        getAttrs: node => {
          const href = (node as HTMLElement).getAttribute('href');
          return href ? { href } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        rel: 'noopener noreferrer nofollow',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setEnhancedLink:
        attributes =>
        ({ chain }) => {
          return chain().setMark(this.name, attributes).setMeta('preventAutolink', true).run();
        },

      toggleEnhancedLink:
        attributes =>
        ({ chain }) => {
          return chain()
            .toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
            .setMeta('preventAutolink', true)
            .run();
        },

      unsetEnhancedLink:
        () =>
        ({ chain }) => {
          return chain()
            .unsetMark(this.name, { extendEmptyMarkRange: true })
            .setMeta('preventAutolink', true)
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => {
        // This will be handled by the toolbar
        return false;
      },
    };
  },
});

// Note: For link marks, we handle rendering through CSS and DOM manipulation
// rather than React components, as marks are inline formatting

// =============================================================================
// CSS STYLES FOR ENHANCED LINKS
// =============================================================================

export const enhancedLinkStyles = `
  .enhanced-notion-link {
    color: #2563eb;
    text-decoration: underline;
    text-decoration-color: rgba(37, 99, 235, 0.3);
    text-underline-offset: 2px;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .enhanced-notion-link:hover {
    color: #1d4ed8;
    text-decoration-color: rgba(29, 78, 216, 0.6);
    background-color: rgba(37, 99, 235, 0.05);
    border-radius: 2px;
    padding: 1px 2px;
    margin: -1px -2px;
  }

  .enhanced-notion-link:active {
    background-color: rgba(37, 99, 235, 0.1);
  }

  /* Link preview popover styling */
  .popover-content {
    --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }

  .popover-content .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @keyframes popover-in {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .animate-in {
    animation: popover-in 0.2s ease-out;
  }

  /* Loading skeleton */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

// =============================================================================
// LINK UTILS
// =============================================================================

const linkUtils = {
  /**
   * Validate if a URL is safe and properly formatted
   */
  isValidUrl: (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Normalize URL by adding protocol if missing
   */
  normalizeUrl: (url: string): string => {
    if (!url) return '';

    // Don't modify if it already has a protocol
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
      return url;
    }

    // Add https for regular URLs
    if (url.includes('.') && !url.includes(' ')) {
      return `https://${url}`;
    }

    return url;
  },

  /**
   * Extract domain from URL for display
   */
  extractDomain: (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  },

  /**
   * Check if URL is external (different domain)
   */
  isExternalUrl: (url: string): boolean => {
    try {
      const linkDomain = new URL(url).hostname;
      const currentDomain = window.location.hostname;
      return linkDomain !== currentDomain;
    } catch {
      return true; // Assume external if we can't parse
    }
  },

  /**
   * Generate appropriate target and rel attributes
   */
  getLinkAttributes: (url: string): { target?: string; rel?: string } => {
    const isExternal = linkUtils.isExternalUrl(url);

    if (isExternal) {
      return {
        target: '_blank',
        rel: 'noopener noreferrer',
      };
    }

    return {};
  },
};
