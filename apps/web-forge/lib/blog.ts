// Hello World implementation to replace basehub functionality

export interface BlogPost {
  _slug: string;
  _title: string;
  author: string;
  body: {
    content: string;
    readingTime: number;
  };
  date: string;
  description: string;
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
}

export async function getPosts(): Promise<BlogPost[]> {
  // Hello World implementation - returns mock data
  return [
    {
      _slug: 'hello-world',
      _title: 'Hello World',
      author: 'Test Author',
      body: {
        content: 'Hello World! This is a test blog post.',
        readingTime: 1,
      },
      date: new Date().toISOString(),
      description: 'This is a test blog post',
      image: {
        width: 1200,
        url: '/placeholder.jpg',
        alt: 'Placeholder image',
        height: 600,
      },
    },
  ];
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const posts = await getPosts();
  return posts.find((post) => post._slug === slug) || null;
}

// Compatibility functions to match the CMS API
export const blog = {
  getPost,
  getPosts,
  postQuery: (_slug: string) => ({
    /* placeholder for compatibility */
  }),
  postsQuery: {
    /* placeholder for compatibility */
  },
};
