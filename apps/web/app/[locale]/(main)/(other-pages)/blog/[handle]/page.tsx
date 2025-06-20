import { type Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { metadataTemplates, structuredData } from '@repo/seo/server/next';
import { StreamingJsonLd } from '@repo/seo/client/next';

import {
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  Divider,
  SocialsList,
  Textarea,
} from '@/components/ui';

import { getArticles, getArticleByHandle } from '@/actions/articles';
import { transformDatabaseArticleToTBlogPost } from '@/types/database';

// Temporary components until proper blog components are created
const Badge = ({
  children,
  className = '',
  color = 'blue',
  name,
  href,
}: {
  children?: React.ReactNode;
  className?: string;
  color?: string;
  name?: string;
  href?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
  };

  const content = (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} ${className}`}
    >
      {name || children}
    </span>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
};

const Tag = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span
    className={`inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ${className}`}
  >
    {children}
  </span>
);

const PostCard1 = ({ post, size: _size = 'sm' }: { post: any; size?: string }) => (
  <article className="flex flex-col overflow-hidden rounded-lg shadow-lg">
    {post.featuredImage && (
      <div className="flex-shrink-0">
        <Image
          className="h-48 w-full object-cover"
          src={post.featuredImage.src}
          alt={post.featuredImage.alt || post.title}
          width={400}
          height={200}
        />
      </div>
    )}
    <div className="flex flex-1 flex-col justify-between bg-white p-6">
      <div className="flex-1">
        <p className="text-sm font-medium text-indigo-600">{post.category}</p>
        <h3 className="mt-2 text-xl font-semibold text-gray-900">{post.title}</h3>
        <p className="mt-3 text-base text-gray-500">{post.description}</p>
      </div>
    </div>
  </article>
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>;
}): Promise<Metadata> {
  const { handle, locale } = await params;
  const articleData = await getArticleByHandle(handle);
  const post = articleData ? transformDatabaseArticleToTBlogPost(articleData) : null;

  if (!post) {
    return {
      title: 'Blog',
      description:
        'Stay up-to-date with the latest industry news as our marketing teams finds new ways to re-purpose old CSS tricks articles.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const articleUrl = `${baseUrl}/${locale}/blog/${handle}`;

  return {
    ...metadataTemplates.article({
      title: post.title,
      description: post.excerpt || '',
      author:
        typeof post.author === 'string' ? post.author : post.author?.name || 'Web Template Team',
      publishedTime: new Date(post.date),
      modifiedTime: undefined,
      image: post.featuredImage?.src || '',
      tags: post.tags,
      section: 'Blog',
    }),
    alternates: {
      canonical: articleUrl,
      languages: {
        en: `${baseUrl}/en/blog/${handle}`,
        es: `${baseUrl}/es/blog/${handle}`,
        fr: `${baseUrl}/fr/blog/${handle}`,
        de: `${baseUrl}/de/blog/${handle}`,
        pt: `${baseUrl}/pt/blog/${handle}`,
      },
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>;
}) {
  const { handle, locale } = await params;
  const articleData = await getArticleByHandle(handle);
  const post = articleData ? transformDatabaseArticleToTBlogPost(articleData) : null;

  if (!post) {
    return notFound();
  }

  const {
    id: _id,
    author,
    content: _content,
    date,
    excerpt,
    featuredImage,
    tags,
    timeToRead,
    title,
  } = post;

  // only get the first 4 posts demo
  const articlesResult = await getArticles({ status: 'PUBLISHED', page: 1, limit: 4 });
  const relatedPosts = (articlesResult.data || []).map(transformDatabaseArticleToTBlogPost);

  // Extract author name for structured data
  const authorName = typeof author === 'string' ? author : author?.name || 'Anonymous';
  const authorSlug = authorName.toLowerCase().replace(/ /g, '-');

  // Article structured data for SEO
  const articleDataPromise = Promise.resolve(
    structuredData.article({
      headline: title,
      description: excerpt,
      author: {
        name: authorName,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/authors/${authorSlug}`,
      },
      datePublished: date,
      dateModified: date,
      image: featuredImage?.src ? [featuredImage.src] : [],
      publisher: {
        name: 'Web Template',
        logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/logo.png`,
      },
      mainEntityOfPage: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/${locale}/blog/${handle}`,
    }),
  );

  const renderHeader = () => {
    return (
      <header className="container rounded-xl">
        <div className="max-w-(--breakpoint-md) mx-auto flex w-full flex-col items-start gap-y-5">
          <Badge href="#" color="purple" name="Article" />
          <h1
            className="md:leading-[120%]! max-w-4xl text-3xl font-semibold text-neutral-900 md:text-4xl lg:text-4xl dark:text-neutral-100"
            title="Quiet ingenuity: 120,000 lunches and counting"
          >
            {title}
          </h1>
          <span className="block pb-1 text-base text-neutral-500 md:text-lg dark:text-neutral-400">
            {excerpt}
          </span>

          <Divider />
          <div className="flex w-full flex-wrap justify-between gap-2.5">
            <div className="nc-PostMeta2 flex shrink-0 flex-wrap items-center text-left text-sm leading-none text-neutral-700 dark:text-neutral-200">
              <Avatar containerClassName="shrink-0" sizeClass="w-8 h-8 sm:h-11 sm:w-11 " />
              <div className="ml-3">
                <div className="flex items-center">
                  <a href="##" className="block font-semibold">
                    {typeof author === 'string' ? author : author?.name || 'Anonymous'}
                  </a>
                </div>
                <div className="mt-[6px] text-xs">
                  <span className="text-neutral-700 dark:text-neutral-300">{date}</span>
                  <span className="mx-2 font-semibold">·</span>
                  <span className="text-neutral-700 dark:text-neutral-300">{timeToRead} </span>
                </div>
              </div>
            </div>
            <div className="ms-auto mt-3 sm:mt-1.5">
              <SocialsList />
            </div>
          </div>
        </div>
      </header>
    );
  };

  const renderContent = () => {
    // render your content here / [content]
    // this for the demo purpose only
    return (
      <div
        id="single-entry-content"
        className="prose prose-sm max-w-(--breakpoint-md)! sm:prose lg:prose-lg dark:prose-invert mx-auto"
      >
        {/* Your content will render here  {content} */}

        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iure vel officiis ipsum placeat
          itaque neque dolorem modi perspiciatis dolor distinctio veritatis sapiente, minima
          corrupti dolores necessitatibus suscipit accusantium dignissimos culpa cumque.
        </p>
        <p>
          It is a long established fact that a <strong>reader</strong> will be distracted by the
          readable content of a page when looking at its <strong>layout</strong>. The point of using
          Lorem Ipsum is that it has a more-or-less normal{' '}
          <a href="/#" rel="noopener noreferrer" target="_blank">
            distribution of letters.
          </a>{' '}
        </p>
        <ol>
          <li>We want everything to look good out of the box.</li>
          <li>{`Really just the first reason, that's the whole point of the plugin.`}</li>
          <li>
            {`Here's a third pretend reason though a list with three items looks
            more realistic than a list with two items.`}
          </li>
        </ol>
        <h3>Typography should be easy</h3>
        <p>
          {`So that's a header for you — with any luck if we've done our job
          correctly that will look pretty reasonable.`}
        </p>
        <p>Something a wise person once told me about typography is:</p>
        <blockquote>
          <p>
            {`Typography is pretty important if you don't want your stuff to look
            like trash. Make it good then it won't be bad.`}
          </p>
        </blockquote>
        <p>{`It's probably important that images look okay here by default as well:`}</p>
        <figure>
          <Image
            width={1260}
            className="rounded-2xl object-cover"
            alt="nc blog"
            height={750}
            src="https://images.pexels.com/photos/6802060/pexels-photo-6802060.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          />
          <figcaption>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iure vel officiis ipsum
            placeat itaque neque dolorem modi perspiciatis dolor distinctio veritatis sapiente
          </figcaption>
        </figure>
        <p>
          {` Now I'm going to show you an example of an unordered list to make sure
          that looks good, too:`}
        </p>
        <ul>
          <li>So here is the first item in this list.</li>
          <li>{`In this example we're keeping the items short.`}</li>
          <li>{`Later, we'll use longer, more complex list items.`}</li>
        </ul>
        <p>{`And that's the end of this section.`}</p>
        <h2>Code should look okay by default.</h2>
        <p>
          I think most people are going to use <a href="https://highlightjs.org/">highlight.js</a>{' '}
          or <a href="https://prismjs.com/">Prism</a>{' '}
          {`or something if they want to
          style their code blocks but it wouldn't hurt to make them look`}{' '}
          <em>okay</em> out of the box, even with no syntax highlighting.
        </p>
        <p>
          {`What I've written here is probably long enough, but adding this final
          sentence can't hurt.`}
        </p>

        <p>Hopefully that looks good enough to you.</p>
        <h3>We still need to think about stacked headings though.</h3>
        <h4>
          {`Let's make sure we don't screw that up with`} <code>h4</code> elements, either.
        </h4>
        <p>
          Phew, with any luck we have styled the headings above this text and they look pretty good.
        </p>
        <p>
          {`Let's add a closing paragraph here so things end with a decently sized
          block of text. I can't explain why I want things to end that way but I
          have to assume it's because I think things will look weird or
          unbalanced if there is a heading too close to the end of the document.`}
        </p>
        <p>
          {`What I've written here is probably long enough, but adding this final
          sentence can't hurt.`}
        </p>
      </div>
    );
  };

  const renderTags = () => {
    return (
      <div className="max-w-(--breakpoint-md) mx-auto flex w-full flex-wrap gap-2">
        {tags?.map((tag: any) => (
          <Tag key={tag} className="mb-2">
            {tag}
          </Tag>
        ))}
      </div>
    );
  };

  const renderAuthor = () => {
    return (
      <div className="max-w-(--breakpoint-md) mx-auto w-full">
        <div className="nc-SingleAuthor flex">
          <Avatar sizeClass="w-11 h-11 md:w-24 md:h-24" />
          <div className="ml-3 flex max-w-lg flex-col gap-y-1 sm:ml-5">
            <span className="text-xs uppercase tracking-wider text-neutral-400">written by</span>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200">
              <span>{typeof author === 'string' ? author : author?.name || 'Anonymous'}</span>
            </h2>
            <span className="text-sm text-neutral-500 sm:text-base dark:text-neutral-300">
              Content writer and fashion enthusiast
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCommentForm = () => {
    return (
      <div className="max-w-(--breakpoint-md) mx-auto w-full pt-5">
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          Comments (14)
        </h3>
        <form className="mt-5">
          <Textarea rows={8} />
          <div className="mt-6 flex gap-x-3">
            <ButtonPrimary>Submit</ButtonPrimary>
            <ButtonSecondary>Cancel</ButtonSecondary>
          </div>
        </form>
      </div>
    );
  };

  const renderRelatedPosts = () => {
    return (
      <div className="mt-16 bg-neutral-100 py-16 lg:mt-24 lg:py-24 dark:bg-neutral-800">
        <div className="container">
          <h2 className="text-3xl font-semibold">Related posts</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {relatedPosts.map((post) => (
              <PostCard1 key={post.id} post={post} size="md" />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-8 lg:pt-16">
      {/* Article Structured Data for SEO */}
      <StreamingJsonLd dataPromise={articleDataPromise} id={`article-${handle}`} />

      {renderHeader()}

      <div className="container my-10 sm:my-12">
        {featuredImage?.src && (
          <Image
            width={featuredImage?.width}
            className="rounded-xl"
            alt={title || ''}
            height={featuredImage?.height}
            src={featuredImage?.src}
          />
        )}
      </div>

      <div className="container flex flex-col gap-y-10">
        {renderContent()}
        {renderTags()}
        <div className="max-w-(--breakpoint-md) mx-auto w-full border-b border-t border-neutral-100 dark:border-neutral-700" />
        {renderAuthor()}
        {renderCommentForm()}
      </div>

      {renderRelatedPosts()}
    </div>
  );
}
