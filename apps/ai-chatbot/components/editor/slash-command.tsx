import { SlashCommand, createSuggestionItems, renderItems } from '@repo/editing';
import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  MessageSquarePlus,
  Text,
  TextQuote,
  Twitter,
  Youtube,
} from 'lucide-react';
import { uploadFn } from './image-upload';

const ensureUrl = (input: string) =>
  input.startsWith('http://') || input.startsWith('https://') ? input : `https://${input}`;

const isValidYouTubeLink = (input: string) => {
  try {
    const url = new URL(ensureUrl(input));
    const hostname = url.hostname.replace(/^www\./, '');
    const allowedHosts = ['youtube.com', 'm.youtube.com', 'youtu.be'];

    if (!allowedHosts.includes(hostname)) {
      return false;
    }

    if (hostname === 'youtu.be') {
      return url.pathname.length > 1;
    }

    if (url.pathname.startsWith('/watch')) {
      return url.searchParams.has('v');
    }

    const validPrefixes = ['/embed/', '/v/'];
    return validPrefixes.some(prefix => url.pathname.startsWith(prefix));
  } catch {
    return false;
  }
};

const isValidTweetLink = (input: string) => {
  try {
    const url = new URL(ensureUrl(input));
    const hostname = url.hostname.replace(/^www\./, '');

    if (!['x.com', 'twitter.com'].includes(hostname)) {
      return false;
    }

    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length < 3) {
      return false;
    }

    const [username, statusSegment, tweetId] = segments;

    if (statusSegment !== 'status') {
      return false;
    }

    if (!/^[a-zA-Z0-9_]{1,15}$/.test(username)) {
      return false;
    }

    return /^[0-9]+$/.test(tweetId ?? '');
  } catch {
    return false;
  }
};

export const suggestionItems = createSuggestionItems([
  {
    title: 'Send Feedback',
    description: 'Let us know how we can improve.',
    icon: <MessageSquarePlus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      window.open('/feedback', '_blank');
    },
  },
  {
    title: 'Text',
    description: 'Just start typing with plain text.',
    searchTerms: ['p', 'paragraph'],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').run();
    },
  },
  {
    title: 'To-do List',
    description: 'Track tasks with a to-do list.',
    searchTerms: ['todo', 'task', 'list', 'check', 'checkbox'],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Big section heading.',
    searchTerms: ['title', 'big', 'large'],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading.',
    searchTerms: ['subtitle', 'medium'],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading.',
    searchTerms: ['subtitle', 'small'],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list.',
    searchTerms: ['unordered', 'point'],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a list with numbering.',
    searchTerms: ['ordered'],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote.',
    searchTerms: ['blockquote'],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode('paragraph', 'paragraph')
        .toggleBlockquote()
        .run(),
  },
  {
    title: 'Code',
    description: 'Capture a code snippet.',
    searchTerms: ['codeblock'],
    icon: <Code size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: 'Image',
    description: 'Upload an image from your computer.',
    searchTerms: ['photo', 'picture', 'media'],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // upload image
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0];
          const pos = editor.view.state.selection.from;
          uploadFn(file, editor.view, pos);
        }
      };
      input.click();
    },
  },
  {
    title: 'Youtube',
    description: 'Embed a Youtube video.',
    searchTerms: ['video', 'youtube', 'embed'],
    icon: <Youtube size={18} />,
    command: ({ editor, range }) => {
      const videoLink = prompt('Please enter Youtube Video Link');
      if (!videoLink) return;

      if (isValidYouTubeLink(videoLink)) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setYoutubeVideo({
            src: videoLink,
          })
          .run();
      } else {
        alert('Please enter a correct Youtube Video Link');
      }
    },
  },
  {
    title: 'Twitter',
    description: 'Embed a Tweet.',
    searchTerms: ['twitter', 'embed'],
    icon: <Twitter size={18} />,
    command: ({ editor, range }) => {
      const tweetLink = prompt('Please enter Twitter Link');
      if (!tweetLink) return;

      if (isValidTweetLink(tweetLink)) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setTweet({
            src: tweetLink,
          })
          .run();
      } else {
        alert('Please enter a correct Twitter Link');
      }
    },
  },
]);

export const slashCommand = SlashCommand.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
