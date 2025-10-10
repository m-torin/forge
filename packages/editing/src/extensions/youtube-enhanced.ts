import { mergeAttributes } from '@tiptap/core';
import Youtube from '@tiptap/extension-youtube';

export interface YoutubeEnhancedOptions {
  /** Allow fullscreen */
  allowFullscreen: boolean;
  /** Auto-play on load */
  autoplay: boolean;
  /** Show video controls */
  controls: boolean;
  /** Disable keyboard controls */
  disableKBcontrols: boolean;
  /** Enable JS API */
  enableIFrameApi: boolean;
  /** End time in seconds */
  endTime: number;
  /** Default height */
  height: number;
  /** Interface language */
  interfaceLanguage: string;
  /** Enable IV load policy */
  ivLoadPolicy: number;
  /** Loop video */
  loop: boolean;
  /** Show modest branding */
  modestBranding: boolean;
  /** Origin for security */
  origin: string;
  /** Playlist */
  playlist: string;
  /** Progress bar color */
  progressBarColor: string;
  /** Default width */
  width: number;
  /** Enable inline playback on iOS */
  HTMLAttributes: Record<string, any>;
  /** Enable paste handler */
  addPasteHandler: boolean;
  /** Render inline instead of block */
  inline?: boolean;
}

/**
 * Enhanced YouTube extension for TipTap v3
 *
 * Extends the official @tiptap/extension-youtube with additional features
 */
export const YoutubeEnhanced = Youtube.extend<YoutubeEnhancedOptions>({
  name: 'youtubeEnhanced',

  addOptions() {
    return {
      ...this.parent?.(),
      allowFullscreen: true,
      autoplay: false,
      controls: true,
      disableKBcontrols: false,
      enableIFrameApi: false,
      endTime: 0,
      height: 480,
      interfaceLanguage: 'en',
      ivLoadPolicy: 0,
      loop: false,
      modestBranding: true,
      origin: '',
      playlist: '',
      progressBarColor: 'red',
      width: 640,
      HTMLAttributes: {},
      addPasteHandler: true,
      inline: false,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: this.options.width,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => ({
          width: attributes.width,
        }),
      },
      height: {
        default: this.options.height,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => ({
          height: attributes.height,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-youtube-enhanced': '',
      }),
      [
        'iframe',
        {
          src: HTMLAttributes.src,
          width: HTMLAttributes.width || this.options.width,
          height: HTMLAttributes.height || this.options.height,
          allowfullscreen: this.options.allowFullscreen,
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        },
      ],
    ];
  },
});

/**
 * Extract YouTube video ID from URL
 */
export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Validate YouTube URL
 */
export function isValidYoutubeUrl(url: string): boolean {
  return extractYoutubeId(url) !== null;
}
