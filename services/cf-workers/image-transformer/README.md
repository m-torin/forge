# Image Transformer Worker

A Cloudflare Worker that handles image transformation, resizing, and delivery with CDN-style URL parameters.

## Features

- **CDN-Style URLs**: Transform images using URL parameters like `/cdn-cgi/image/width=200,format=auto/images/path`
- **Direct Access**: Secure direct image access with signature verification
- **Multiple Formats**: Support for WebP, AVIF, JPEG, PNG, GIF
- **Flexible Sizing**: Width, height, and fit options
- **Quality Control**: Adjustable compression quality
- **Caching**: Aggressive caching for transformed images

## API Endpoints

### GET `/cdn-cgi/image/{params}/images/{path}`
Transform and serve images with CDN-style parameters.

**Parameters:**
- `width` - Image width in pixels
- `height` - Image height in pixels
- `format` - Output format (auto, webp, avif, jpeg, png, gif)
- `quality` - Compression quality (1-100)
- `fit` - How to fit the image (cover, contain, fill, inside, outside, scale-down)
- `background` - Background color for transparent images

**Example:**
```
/cdn-cgi/image/width=300,height=200,format=webp,quality=80/images/2024/01/15/photo.jpg
```

### GET `/images/{path}?sig={signature}&exp={expiration}`
Direct image access with signature verification.

**Query Parameters:**
- `sig` - HMAC-SHA256 signature
- `exp` - Unix timestamp expiration

## Environment Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `IMAGES` | R2Bucket | Yes | R2 bucket containing source images |
| `SIGNING_KEY` | string | Yes | Secret key for signature verification |
| `IMAGE_METADATA` | KVNamespace | No | KV namespace for metadata (optional) |

## URL Examples

### CDN-Style Transformations
```
# Resize to 300px width, auto height
/cdn-cgi/image/width=300/images/photo.jpg

# Square thumbnail with WebP format
/cdn-cgi/image/width=150,height=150,format=webp,fit=cover/images/photo.jpg

# High quality JPEG with specific dimensions
/cdn-cgi/image/width=800,height=600,format=jpeg,quality=90/images/photo.jpg

# Auto format with quality control
/cdn-cgi/image/width=400,format=auto,quality=75/images/photo.jpg
```

### Direct Access
```
# Signed URL for direct access
/images/2024/01/15/photo.jpg?sig=abc123&exp=1705123456
```

## Development

### Prerequisites
- Node.js 18+
- pnpm
- Wrangler CLI

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

### Environment Setup
1. Create a `wrangler.toml` with your bindings
2. Set up R2 bucket with source images
3. Set `SIGNING_KEY` secret
4. Configure routes in Cloudflare dashboard

## Supported Transformations

### Fit Options
- `cover` - Crop to fill dimensions (default)
- `contain` - Scale to fit within dimensions
- `fill` - Stretch to fill dimensions
- `inside` - Scale down to fit inside dimensions
- `outside` - Scale up to fill dimensions
- `scale-down` - Scale down only

### Format Options
- `auto` - Automatically choose best format
- `webp` - WebP format
- `avif` - AVIF format
- `jpeg` - JPEG format
- `png` - PNG format
- `gif` - GIF format

## Caching

- Transformed images cached for 1 year
- Direct access images cached for 1 hour
- ETags used for efficient cache validation
- Cache-Control headers properly set

## Security

- Direct access requires valid signature
- Signature includes expiration time
- HMAC-SHA256 signature verification
- CORS headers properly configured
