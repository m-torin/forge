# API Documentation

This is the backend API service for the Forge Ahead application. It provides RESTful endpoints for
managing resources and integrates with Better Auth for authentication.

## Base URL

- Development: `http://localhost:3300`
- Production: `https://api.your-domain.com`

## Authentication

The API supports two authentication methods:

### 1. Session-based Authentication

Use cookies from the main application for authentication. This is automatically handled when making
requests from the frontend.

### 2. API Key Authentication

Use API keys for programmatic access. Include your API key in the request headers:

```bash
x-api-key: your_api_key_here
```

## Creating API Keys

1. Navigate to the API Keys page in the main application: `/api-keys`
2. Click "Create API Key"
3. Configure permissions and settings
4. Copy the generated key (you won't be able to see it again)

## API Key Permissions

API keys can have different permission levels:

- `read:user` - Read user data
- `write:user` - Modify user data
- `read:organization` - Read organization data
- `write:organization` - Modify organization data

## Rate Limiting

API keys are rate-limited to 100 requests per day by default. This can be configured when creating
the key.

## Endpoints

### Public Endpoints (No Authentication Required)

#### Health Check

```
GET /public/health
```

Returns the API health status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-05-19T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### Protected Endpoints (Authentication Required)

#### Protected Root

```
GET /protected
```

Returns information about available protected endpoints.

**Headers:**

- `x-api-key`: Your API key (optional if using session auth)

**Response:**

```json
{
  "message": "Welcome to the protected API",
  "endpoints": {
    "/protected/example": "Example protected endpoint",
    "/protected/user": "Get user information",
    "/protected/organization": "Get organization information"
  },
  "authentication": {
    "method": "api_key",
    "userId": "user_123"
  }
}
```

#### Get User Information

```
GET /protected/user
```

Returns the authenticated user's information.

**Headers:**

- `x-api-key`: Your API key with `read:user` permission

**Response:**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://example.com/avatar.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "emailVerified": true
  }
}
```

#### Update User Information

```
PATCH /protected/user
```

Updates the authenticated user's information.

**Headers:**

- `x-api-key`: Your API key with `write:user` permission
- `Content-Type`: `application/json`

**Request Body:**

```json
{
  "name": "Jane Doe",
  "image": "https://example.com/new-avatar.jpg"
}
```

**Response:**

```json
{
  "message": "User updated successfully",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "Jane Doe",
    "image": "https://example.com/new-avatar.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "emailVerified": true
  }
}
```

#### Example Protected Endpoint

```
GET /protected/example
POST /protected/example
```

Example endpoints demonstrating API key usage and permissions.

## Error Responses

The API returns standard HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

Error Response Format:

```json
{
  "error": "Error message",
  "code": "error_code",
  "details": {}
}
```

## Code Examples

### cURL

```bash
# Get user information
curl -H "x-api-key: forge_abc123..." \
     https://api.your-domain.com/protected/user

# Update user
curl -X PATCH \
     -H "x-api-key: forge_abc123..." \
     -H "Content-Type: application/json" \
     -d '{"name": "New Name"}' \
     https://api.your-domain.com/protected/user
```

### JavaScript/TypeScript

```typescript
// Get user information
const response = await fetch('https://api.your-domain.com/protected/user', {
  headers: {
    'x-api-key': 'forge_abc123...',
  },
});
const data = await response.json();

// Update user
const response = await fetch('https://api.your-domain.com/protected/user', {
  method: 'PATCH',
  headers: {
    'x-api-key': 'forge_abc123...',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'New Name',
  }),
});
```

### Python

```python
import requests

# Get user information
response = requests.get(
    'https://api.your-domain.com/protected/user',
    headers={'x-api-key': 'forge_abc123...'}
)
data = response.json()

# Update user
response = requests.patch(
    'https://api.your-domain.com/protected/user',
    headers={'x-api-key': 'forge_abc123...'},
    json={'name': 'New Name'}
)
```

## Development

To run the API locally:

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Security

- Never expose your API keys in client-side code
- Rotate API keys regularly
- Use environment-specific keys
- Set appropriate permissions for each key
- Monitor API key usage

## Support

For support, please contact the development team or create an issue in the repository.
