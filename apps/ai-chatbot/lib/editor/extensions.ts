import { AIHighlight } from '@repo/editing/extensions/ai-highlight';
import { DragHandle } from '@repo/editing/extensions/drag-handle';
import { Markdown } from '@repo/editing/extensions/markdown';
import { Mathematics } from '@repo/editing/extensions/mathematics';
import { Twitter } from '@repo/editing/extensions/twitter';
import { YoutubeEnhanced } from '@repo/editing/extensions/youtube';
import type { AnyExtension } from '@tiptap/core';

// Standard TipTap extensions
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';

import { cx } from 'class-variance-authority';
import { common, createLowlight } from 'lowlight';

//TODO I am using cx here to get tailwind autocomplete working, idk if someone else can write a regex to just capture the class key in objects
const aiHighlight = AIHighlight;
//You can overwrite the placeholder with your own configuration
const placeholder = Placeholder;
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      'text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer',
    ),
  },
});

const tiptapImage = TiptapImage.configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cx('rounded-lg border border-muted'),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx('not-prose pl-2 '),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx('flex gap-2 items-start my-4'),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx('mt-4 mb-6 border-t border-muted-foreground'),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx('list-disc list-outside leading-3 -mt-2'),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx('list-decimal list-outside leading-3 -mt-2'),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx('leading-normal -mb-2'),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx('border-l-4 border-primary'),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx('rounded-md bg-muted text-muted-foreground border p-5 font-mono font-medium'),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx('rounded-md bg-muted  px-1.5 py-1 font-mono font-medium'),
      spellcheck: 'false',
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: '#DBEAFE',
    width: 4,
  },
  gapcursor: false,
});

const codeBlockLowlight = CodeBlockLowlight.configure({
  // configure lowlight: common /  all / use highlightJS in case there is a need to specify certain language grammars only
  // common: covers 37 language grammars which should be good enough in most cases
  lowlight: createLowlight(common),
});

const youtube = YoutubeEnhanced.configure({
  HTMLAttributes: {
    class: cx('rounded-lg border border-muted'),
  },
  inline: false,
});

const twitter = Twitter.configure({
  HTMLAttributes: {
    class: cx('not-prose'),
  },
  inline: false,
});

const mathematics = Mathematics.configure({
  HTMLAttributes: {
    class: cx('text-foreground rounded p-1 hover:bg-accent cursor-pointer'),
  },
  katexOptions: {
    throwOnError: false,
  },
});

const characterCount = CharacterCount.configure();

const markdownExtension = Markdown.configure({
  html: true,
  tightLists: true,
  tightListClass: 'tight',
  bulletListMarker: '-',
  linkify: false,
  breaks: false,
  transformPastedText: false,
  transformCopiedText: false,
});

export const defaultExtensions: AnyExtension[] = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  taskList,
  taskItem,
  horizontalRule,
  aiHighlight,
  codeBlockLowlight,
  youtube,
  twitter,
  mathematics,
  characterCount,
  Underline,
  markdownExtension,
  Highlight,
  TextStyle,
  Color,
  DragHandle,
];
