const config = {
  defaultShowCopyCode: true,
  latex: true,
  contentDirBasePath: '/',
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
  theme: {
    toc: true,
    sidebar: true,
  },
  search: {
    codeblocks: true,
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s | Forge Documentation',
    };
  },
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { property: 'og:title', content: 'Forge Documentation' }],
    ['meta', { property: 'og:description', content: 'Forge is a modern, production-ready monorepo template for building scalable Next.js applications with TypeScript, authentication, payments, and more.' }],
  ],
};

export default config;