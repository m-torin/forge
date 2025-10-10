import { Node, mergeAttributes, nodePasteRule } from '@tiptap/core';
import type { NodeViewRendererProps } from '@tiptap/react';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import * as React from 'react';

// Twitter/X URL regex patterns
const TWITTER_PATH = '(?:/status/\\d+(?:\\?[A-Za-z0-9_=&-]*)?)?';
export const TWITTER_REGEX_GLOBAL = new RegExp(
  `(?:https?:\\/\\/)?(?:www\\.)?(?:twitter\\.com|x\\.com)\\/[a-zA-Z0-9_]{1,15}${TWITTER_PATH}`,
  'gi',
);
export const TWITTER_REGEX = new RegExp(
  `^(?:https?:\\/\\/)?(?:www\\.)?(?:twitter\\.com|x\\.com)\\/[a-zA-Z0-9_]{1,15}${TWITTER_PATH}$`,
  'i',
);

/**
 * Validate if a URL is a valid Twitter/X URL
 */
export function isValidTwitterUrl(url: string): boolean {
  return TWITTER_REGEX.test(url);
}

/**
 * Extract tweet ID from Twitter URL
 */
export function extractTweetId(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Tweet component using react-tweet
 */
const TweetComponent = ({ node }: NodeViewRendererProps) => {
  const url = node.attrs.src as string;
  const tweetId = extractTweetId(url);

  if (!tweetId) {
    return (
      <NodeViewWrapper>
        <div data-twitter="" className="tweet-error">
          Invalid tweet URL: {url}
        </div>
      </NodeViewWrapper>
    );
  }

  // Lazy load react-tweet component
  if (typeof window === 'undefined') {
    return (
      <NodeViewWrapper>
        <div data-twitter="" className="tweet-placeholder">
          Loading tweet {tweetId}...
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div data-twitter="" data-tweet-id={tweetId}>
        {/* Dynamic import of Tweet component */}
        <TweetLoader tweetId={tweetId} />
      </div>
    </NodeViewWrapper>
  );
};

/**
 * Lazy loader for Tweet component to avoid SSR issues
 */
function TweetLoader({ tweetId }: { tweetId: string }) {
  const [TweetComp, setTweetComp] = React.useState<any>(null);

  React.useEffect(() => {
    const loadTweet = async () => {
      try {
        const module = await import('react-tweet');
        setTweetComp(() => module.Tweet);
      } catch {
        // Silently fail if module cannot be loaded
      }
    };
    void loadTweet();
  }, []);

  if (!TweetComp) {
    return <div className="tweet-loading">Loading tweet...</div>;
  }

  return <TweetComp id={tweetId} />;
}

export interface TwitterOptions {
  /**
   * Controls if the paste handler for tweets should be added
   * @default true
   */
  addPasteHandler: boolean;

  /** HTML attributes for the tweet container */
  HTMLAttributes: Record<string, any>;

  /**
   * Controls if the twitter node should be inline or not
   * @default false
   */
  inline: boolean;

  /**
   * Theme for the tweet embed
   * @default 'light'
   */
  theme?: 'light' | 'dark';
}

/**
 * Options for setting a tweet
 */
export interface SetTweetOptions {
  /** Twitter/X URL */
  src: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    twitter: {
      /**
       * Insert a tweet embed
       * @example editor.commands.setTweet({ src: 'https://x.com/user/status/123' })
       */
      setTweet: (options: SetTweetOptions) => ReturnType;
    };
  }
}

/**
 * Twitter/X embed extension for TipTap v3
 *
 * Adds support for embedding tweets using react-tweet
 *
 * @example
 * ```tsx
 * import { Twitter } from '@repo/editing/extensions/twitter';
 *
 * const extensions = [
 *   Twitter.configure({
 *     addPasteHandler: true,
 *     theme: 'dark',
 *   })
 * ];
 * ```
 */
export const Twitter = Node.create<TwitterOptions>({
  name: 'twitter',

  addOptions() {
    return {
      addPasteHandler: true,
      HTMLAttributes: {},
      inline: false,
      theme: 'light',
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(TweetComponent, {
      attrs: this.options.HTMLAttributes,
    });
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('data-src'),
        renderHTML: attributes => ({
          'data-src': attributes.src,
        }),
      },
      theme: {
        default: this.options.theme,
        parseHTML: element => element.getAttribute('data-theme'),
        renderHTML: attributes => ({
          'data-theme': attributes.theme,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-twitter]',
      },
      {
        tag: 'div[data-tweet-id]',
      },
    ];
  },

  addCommands() {
    return {
      setTweet:
        (options: SetTweetOptions) =>
        ({ commands }) => {
          if (!isValidTwitterUrl(options.src)) {
            console.warn('Invalid Twitter URL:', options.src);
            return false;
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              theme: this.options.theme,
            },
          });
        },
    };
  },

  addPasteRules() {
    if (!this.options.addPasteHandler) {
      return [];
    }

    return [
      nodePasteRule({
        find: TWITTER_REGEX_GLOBAL,
        type: this.type,
        getAttributes: match => {
          return { src: match.input };
        },
      }),
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-twitter': '',
      }),
    ];
  },
});
