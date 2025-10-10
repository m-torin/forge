# Image Processor Worker

A Cloudflare Worker that handles image upload, processing, and AI classification.

## Features

- **Image Upload**: Accepts multipart form data with image files
- **AI Classification**: Uses Cloudflare AI to classify uploaded images
- **Metadata Storage**: Stores image metadata and AI results in KV
- **Signed URLs**: Generates secure, time-limited URLs for image access
- **CORS Support**: Handles cross-origin requests properly

## API Endpoints

### POST `/process`
Upload and process an image.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (image file)

**Response:**
```json
{
  "success": true,
  "imageId": "uuid",
  "url": "/images/path?sig=signature&exp=expiration",
  "key": "images/2024/01/15/uuid.jpg",
  "contentType": "image/jpeg"
}
```

### GET `/metadata/{imageId}`
Retrieve image metadata and AI classification results.

**Response:**
```json
{
  "classification": {
    "result": "cat",
    "confidence": 0.95
  },
  "timestamp": 1705123456789,
  "contentType": "image/jpeg"
}
```

### PUT `/metadata/{imageId}`
Update image metadata.

**Request:**
```json
{
  "tags": ["nature", "outdoor"],
  "description": "Beautiful landscape"
}
```

## Environment Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `IMAGES` | R2Bucket | Yes | R2 bucket for storing images |
| `SIGNING_KEY` | string | Yes | Secret key for URL signing |
| `IMAGE_METADATA` | KVNamespace | No | KV namespace for metadata storage |
| `AI` | any | No | Cloudflare AI binding for classification |

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
2. Set up R2 bucket and KV namespace
3. Configure AI binding if needed
4. Set `SIGNING_KEY` secret

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)
- AVIF (.avif)

## Error Handling

The worker gracefully handles:
- Missing file uploads (400)
- Invalid file types (400)
- Missing KV bindings (503)
- AI classification failures (logged, doesn't fail upload)
- R2 upload failures (500)

## Security

- All direct image access requires signed URLs
- CORS headers properly configured
- Input validation on file types
- Secure HMAC-SHA256 URL signing
