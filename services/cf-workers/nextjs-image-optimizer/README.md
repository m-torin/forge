# Next.js Image Optimizer Worker

A Cloudflare Worker that provides compatibility with Next.js Image component for optimized image delivery.

## Features

- **Next.js Compatibility**: Works with Next.js `<Image>` component
- **Automatic Optimization**: Handles Next.js image optimization parameters
- **Format Detection**: Automatically serves optimal image formats
- **Responsive Images**: Supports Next.js responsive image features
- **Caching**: Aggressive caching for optimized images

## API Endpoints

### GET `/api/_next/image`
Next.js image optimization endpoint.

**Query Parameters:**
- `url` - Source image URL (URL encoded)
- `w` - Width in pixels (required)
- `q` - Quality (1-100, default: 75)
- `fit` - Fit mode (cover, contain, fill, inside, outside)

**Example:**
```
/api/_next/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg&w=300&q=80&fit=cover
```

## URL Formats Supported

### Full URLs
```
https://images.example.com/api/_next/image?url=https%3A%2F%2Fcdn.example.com%2Fphoto.jpg&w=400
```

### Relative URLs
```
https://images.example.com/api/_next/image?url=%2Fimages%2Fphoto.jpg&w=300
```

### Image IDs (UUID)
```
https://images.example.com/api/_next/image?url=123e4567-e89b-12d3-a456-426614174000&w=500
```

## Environment Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `IMAGES` | R2Bucket | Yes | R2 bucket containing source images |
| `SIGNING_KEY` | string | Yes | Secret key for URL signing (if needed) |
| `IMAGE_METADATA` | KVNamespace | No | KV namespace for metadata lookup |

## Next.js Integration

### Basic Usage
```tsx
import Image from 'next/image'

export default function MyComponent() {
  return (
    <Image
      src="/images/photo.jpg"
      alt="Description"
      width={300}
      height={200}
      quality={80}
    />
  )
}
```

### With Custom Domain
```tsx
// next.config.js
module.exports = {
  images: {
    domains: ['images.example.com'],
    path: 'https://images.example.com/api/_next/image',
  },
}
```

### Advanced Configuration
```tsx
<Image
  src="https://cdn.example.com/image.jpg"
  alt="Description"
  width={800}
  height={600}
  quality={90}
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## Development

### Prerequisites
- Node.js 18+
- pnpm
- Wrangler CLI
- Next.js project (for testing)

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare
pnpm deploy
```

### Testing with Next.js
1. Configure your Next.js app to use the worker URL
2. Add the worker domain to `next.config.js`
3. Test with various image sources and parameters

## Supported Parameters

### Width (`w`)
- Required parameter
- Specifies target width in pixels
- Worker will maintain aspect ratio

### Quality (`q`)
- Optional parameter (default: 75)
- Range: 1-100
- Controls compression quality

### Fit (`fit`)
- Optional parameter (default: cover)
- Values: cover, contain, fill, inside, outside
- Controls how image is fitted to dimensions

## Caching Strategy

- Optimized images cached for 1 year
- ETags for efficient cache validation
- Cache-Control headers optimized for CDN
- Automatic cache invalidation on updates

## Error Handling

- Invalid parameters return 400 Bad Request
- Missing images return 404 Not Found
- Server errors return 500 Internal Server Error
- Proper error responses with CORS headers

## Performance

- Images served from Cloudflare's global CDN
- Automatic format optimization (WebP, AVIF)
- Lazy loading support
- Responsive image generation
- Minimal processing overhead
