export const defaultEditorContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Start writing...' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: "Click here to begin or type '/' for commands",
        },
      ],
    },
  ],
};
