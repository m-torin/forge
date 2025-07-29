/**
 * Test data for scraping tests
 */

export const scrapingTestData = {
  simpleHtml: `
    <html>
      <head>
        <title>Test Page</title>
        <meta name="description" content="Test description">
      </head>
      <body>
        <h1>Test Heading</h1>
        <div class="content">Test content</div>
        <p>Test paragraph</p>
      </body>
    </html>
  `,

  complexHtml: `
    <html>
      <head>
        <title>Complex Test Page</title>
        <meta name="description" content="Complex test description">
        <meta name="keywords" content="test, scraping, data">
        <meta property="og:title" content="OG Title">
        <meta property="og:description" content="OG Description">
      </head>
      <body>
        <header>
          <h1>Main Title</h1>
          <nav>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <article>
            <h2>Article Title</h2>
            <p>Article content goes here.</p>
            <div class="author">By John Doe</div>
            <time datetime="2024-01-01">January 1, 2024</time>
          </article>
          <aside>
            <h3>Related Links</h3>
            <ul>
              <li><a href="/related1">Related 1</a></li>
              <li><a href="/related2">Related 2</a></li>
            </ul>
          </aside>
        </main>
        <footer>
          <p>&copy; 2024 Test Site</p>
        </footer>
      </body>
    </html>
  `,

  ecommerceHtml: `
    <html>
      <head>
        <title>Product Page</title>
        <meta name="description" content="Product description">
      </head>
      <body>
        <div class="product">
          <h1 class="product-title">Test Product</h1>
          <div class="product-price">$99.99</div>
          <div class="product-description">This is a test product description.</div>
          <div class="product-images">
            <img src="/image1.jpg" alt="Product Image 1">
            <img src="/image2.jpg" alt="Product Image 2">
          </div>
          <div class="product-reviews">
            <div class="review">
              <div class="review-author">User 1</div>
              <div class="review-rating">5 stars</div>
              <div class="review-text">Great product!</div>
            </div>
            <div class="review">
              <div class="review-author">User 2</div>
              <div class="review-rating">4 stars</div>
              <div class="review-text">Good product.</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,
};

export const testPatterns = {
  simple: {
    title: 'h1',
    description: { selector: 'meta[name="description"]', attribute: 'content' },
    content: '.content',
  },

  complex: {
    title: 'h1',
    description: { selector: 'meta[name="description"]', attribute: 'content' },
    keywords: { selector: 'meta[name="keywords"]', attribute: 'content' },
    ogTitle: { selector: 'meta[property="og:title"]', attribute: 'content' },
    ogDescription: { selector: 'meta[property="og:description"]', attribute: 'content' },
    articleTitle: 'article h2',
    author: '.author',
    date: { selector: 'time', attribute: 'datetime' },
    links: 'nav a',
    footer: 'footer p',
  },

  ecommerce: {
    title: '.product-title',
    price: '.product-price',
    description: '.product-description',
    images: '.product-images img',
    reviews: '.review',
    reviewAuthor: '.review-author',
    reviewRating: '.review-rating',
    reviewText: '.review-text',
  },

  htmlFixtures: {
    withScript: '<html><body><script>alert("test")</script><h1>Title</h1></body></html>',
    complex:
      '<html><head><title>Complex</title><meta name="description" content="Complex desc"></head><body><h1>Title</h1><article><h2>Article</h2><p>Content</p></article></body></html>',
    withStructuredData:
      '<html><body><script type="application/ld+json">{"@type":"Product","name":"Test Product"}</script><h1>Title</h1></body></html>',
  },

  textPatterns: {
    emails: ['test@example.com', 'user@domain.org', 'contact@company.net'],
    phoneNumbers: ['+1-555-123-4567', '(555) 987-6543', '555.123.4567'],
    urls: ['https://example.com', 'http://test.org', 'https://demo.net/path'],
  },
};

export const createTestData = {
  browserOptions: (overrides = {}) => ({
    headless: true,
    devtools: false,
    timeout: 30000,
    ...overrides,
  }),
};

export const edgeCases = {
  unicode: {
    content:
      '<html><body><h1>Unicode: 你好世界 🌍</h1><p>Special chars: &amp; &lt; &gt; &quot;</p></body></html>',
  },
  empty: {
    content: '<html><body></body></html>',
  },
  malformed: {
    content: '<html><body><h1>Title<p>Unclosed tag<div>Nested</div></body>',
  },
};
