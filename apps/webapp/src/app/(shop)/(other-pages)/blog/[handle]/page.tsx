import { Divider } from '@/components/Divider';
import { Link } from '@/components/Link';
import PostCard1 from '@/components/blog/PostCard1';
import { getBlogPosts, getBlogPostsByHandle } from '@/data/data';
import Avatar from '@/shared/Avatar/Avatar';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import SocialsList from '@/shared/SocialsList/SocialsList';
import Tag from '@/shared/Tag';
import { Badge } from '@/shared/badge';
import { Textarea } from '@/shared/textarea';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const post = await getBlogPostsByHandle(handle);
  if (!post) {
    return {
      title: 'Blog',
      description:
        'Stay up-to-date with the latest industry news as our marketing teams finds new ways to re-purpose old CSS tricks articles.',
    };
  }
  const { title, excerpt } = post;
  return { title, description: excerpt };
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const blogPost = await getBlogPostsByHandle(handle);

  if (!blogPost || !blogPost.id) {
    return notFound();
  }

  const {
    featuredImage,
    id: _id,
    author,
    content: _content,
    date,
    title,
    timeToRead,
    category,
    excerpt,
    tags,
  } = blogPost;

  // only get the first 4 posts demo
  const relatedPosts = (await getBlogPosts()).slice(0, 4);

  const renderHeader = () => {
    return (
      <header className="container rounded-xl">
        <div className="max-w-(--breakpoint-md) mx-auto flex w-full flex-col items-start gap-y-5">
          {category?.title && <Badge color="blue">{category.title}</Badge>}
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
              <Avatar
                imgUrl={author?.avatar.src}
                containerClassName="shrink-0"
                sizeClass="w-8 h-8 sm:h-11 sm:w-11 "
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <a className="block font-semibold" href="##">
                    {author?.name}
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
        className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-(--breakpoint-md)! mx-auto"
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
          <a href="/#" target="_blank" rel="noopener noreferrer">
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
            src="https://images.pexels.com/photos/6802060/pexels-photo-6802060.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="nc blog"
            className="rounded-2xl object-cover"
            width={1260}
            height={750}
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
    if (!tags || tags.length === 0) {
      return null;
    }

    return (
      <div className="max-w-(--breakpoint-md) mx-auto flex w-full flex-wrap gap-2">
        {tags.map(tag => (
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
          <Avatar imgUrl={author?.avatar.src} sizeClass="w-11 h-11 md:w-24 md:h-24" />
          <div className="ml-3 flex max-w-lg flex-col gap-y-1 sm:ml-5">
            <span className="text-xs uppercase tracking-wider text-neutral-400">written by</span>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200">
              <Link href={`/author/${author?.name || ''}`}>{author?.name}</Link>
            </h2>
            <span className="text-sm text-neutral-500 sm:text-base dark:text-neutral-300">
              {author?.description}
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
          <Textarea rows={6} name="comment" />
          <ButtonPrimary className="mt-5">Submit the comment</ButtonPrimary>
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
            {relatedPosts.map(post => (
              <PostCard1 size="sm" key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-8 lg:pt-16">
      {renderHeader()}

      <div className="container my-10 sm:my-12">
        {featuredImage?.src && (
          <Image
            alt={title || ''}
            src={featuredImage?.src}
            width={featuredImage?.width}
            height={featuredImage?.height}
            className="rounded-xl"
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
