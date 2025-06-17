# Storage Integration Plan: Signed URLs for Product Photos

## Overview

This plan outlines how to integrate the storage package with signed URL functionality for product photos across backstage PIM3 (admin) and web-template (customer-facing) applications.

## Key Requirements

✅ **Product photos must use signed URLs** for security and asset protection  
✅ **Centralized storage actions** in `@repo/storage/server/next`  
✅ **Support both admin and customer contexts**  
✅ **Follow established database server actions pattern**  

## Architecture

### Storage Actions Layer
```
@repo/storage/server/next
├── Basic Storage Actions (mediaActions.ts)
│   ├── uploadMediaAction()
│   ├── getMediaUrlAction() ← Auto-signs product photos
│   ├── getProductMediaUrlsAction() ← Bulk signed URLs
│   └── deleteMediaAction()
└── Business Logic Actions (productMediaActions.ts)
    ├── uploadProductMediaAction() ← Handles permissions + DB
    ├── getProductMediaAction() ← Gets media with signed URLs
    ├── deleteProductMediaAction() ← Soft delete + cleanup
    └── getProductUploadPresignedUrlsAction()
```

### URL Security Policy
```typescript
// Automatic signed URL rules:
- /products/** → Always signed (1 hour expiration)
- Admin context → Signed (30 min expiration)  
- User uploads → Signed (30 min expiration)
- Public assets → Direct URLs (optional signing)
```

## Implementation Steps

### Phase 1: Storage Actions Setup ✅

**Status**: Complete - Actions implemented with signed URL support

**Key Features**:
- `getMediaUrlAction()` automatically signs product photos
- `getProductMediaUrlsAction()` for bulk operations
- `uploadProductMediaAction()` with business logic
- Configurable expiration times by context

### Phase 2: Backstage PIM3 Integration

#### 2.1 Replace Mock Upload in Media Actions
**File**: `/apps/backstage/app/(authenticated)/pim3/media/actions.ts`

```typescript
// Before (line 517):
const mockUrl = URL.createObjectURL(file);

// After:
import { uploadProductMediaAction, getProductMediaAction } from '@repo/storage/server/next';

export async function handleUpload(formData: FormData) {
  const files = formData.getAll('files') as File[];
  const productId = formData.get('productId') as string;
  
  // Convert files to the format expected by storage action
  const fileData = files.map(file => ({
    filename: file.name,
    contentType: file.type,
    data: file,
  }));
  
  // Upload using storage action (includes database integration)
  const result = await uploadProductMediaAction(productId, fileData, {
    context: 'admin',
    altText: formData.get('altText') as string,
    description: formData.get('description') as string,
  });
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  // Return signed URLs for immediate use
  return result.data;
}
```

#### 2.2 Update Product Asset Uploader
**File**: `/apps/backstage/app/(authenticated)/pim3/product-assets/components/ProductAssetUploader.tsx`

```typescript
// Replace mock implementation
import { uploadProductMediaAction } from '@repo/storage/server/next';

export async function uploadProductAsset(formData: FormData) {
  const file = formData.get('file') as File;
  const productId = formData.get('productId') as string;
  
  const result = await uploadProductMediaAction(productId, [{
    filename: file.name,
    contentType: file.type,
    data: file,
  }], {
    context: 'admin',
  });
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data[0]; // First uploaded file
}
```

#### 2.3 Update Media Display Components
**File**: `/apps/backstage/app/(authenticated)/pim3/components/MediaManagement.tsx`

```typescript
import { getProductMediaAction } from '@repo/storage/server/next';

export async function ProductMediaGrid({ productId }: { productId: string }) {
  // Get media with signed URLs
  const mediaResult = await getProductMediaAction(productId, {
    context: 'admin',
    expiresIn: 7200, // 2 hours for admin
  });
  
  if (!mediaResult.success) {
    return <div>Error loading media: {mediaResult.error}</div>;
  }
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {mediaResult.data.map((media) => (
        <div key={media.id} className="relative">
          <img 
            src={media.url} // This is now a signed URL
            alt={media.altText}
            className="w-full h-32 object-cover rounded"
          />
          <div className="absolute top-2 right-2">
            <MediaActions mediaId={media.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Phase 3: Web-Template Integration

#### 3.1 Product Display Pages
**File**: `/apps/web-template/app/[locale]/(main)/(other-pages)/products/[handle]/page.tsx`

```typescript
import { getProductMediaAction } from '@repo/storage/server/next';

export default async function ProductPage({ params }: { params: { handle: string } }) {
  // Get product data (existing logic)
  const product = await getProductByHandle(params.handle);
  
  // Get media with signed URLs for customer context
  const mediaResult = await getProductMediaAction(product.id, {
    context: 'customer',
    variant: 'public', // Use public variant for customer display
    expiresIn: 3600, // 1 hour for customer URLs
  });
  
  const productMedia = mediaResult.success ? mediaResult.data : [];
  
  return (
    <div>
      <ProductImageGallery images={productMedia} />
      <ProductDetails product={product} />
    </div>
  );
}
```

#### 3.2 Review Photo Uploads (Customer-facing)
**File**: `/apps/web-template/src/components/reviews/ReviewPhotoUpload.tsx`

```typescript
'use client';

import { uploadMediaAction } from '@repo/storage/server/next';

export function ReviewPhotoUpload({ reviewId }: { reviewId: string }) {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (files: File[]) => {
    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const key = `reviews/${reviewId}/${Date.now()}-${file.name}`;
        return uploadMediaAction(key, file, {
          contentType: file.type,
          context: 'user', // This will trigger signed URLs
        });
      });
      
      const results = await Promise.all(uploadPromises);
      
      // Handle success - URLs are already signed
      const uploadedUrls = results
        .filter(r => r.success)
        .map(r => r.data!.url);
        
      onUploadComplete(uploadedUrls);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Dropzone onDrop={handleUpload} disabled={uploading}>
      {/* Upload UI */}
    </Dropzone>
  );
}
```

### Phase 4: Database Integration

#### 4.1 Product Media Model Updates
```prisma
// If needed, add storage metadata to existing Media model
model Media {
  id          String   @id @default(cuid())
  // ... existing fields
  storageKey  String?  // Storage provider key
  storageProvider String? // Provider name
  expiresAt   DateTime? // For temporary signed URLs
  
  // Relations (existing)
  productId   String?
  product     Product? @relation(fields: [productId], references: [id])
  // ... other relations
}
```

#### 4.2 Business Logic Functions
**File**: `/packages/storage/src/actions/productMediaActions.ts` (enhance existing)

```typescript
// Add actual database integration
import { prisma } from '@repo/database';
import { auth } from '@repo/auth/server/next';

export async function uploadProductMediaAction(
  productId: string,
  files: Array<{ filename: string; contentType: string; data: File }>,
  options?: { context: 'admin' | 'vendor'; altText?: string; }
) {
  // Add real authentication
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  
  // Check product access permissions
  const canManage = await canUserManageProduct(session.user.id, productId);
  if (!canManage) throw new Error('Insufficient permissions');
  
  const storage = getStorage();
  const results = [];
  
  for (const [index, file] of files.entries()) {
    const key = `products/${productId}/images/${Date.now()}-${index}-${file.filename}`;
    
    // Upload to storage
    const uploadResult = await storage.upload(key, file.data, {
      contentType: file.contentType,
    });
    
    // Create database record
    const mediaRecord = await prisma.media.create({
      data: {
        productId,
        type: 'IMAGE',
        url: uploadResult.url,
        storageKey: key,
        storageProvider: 'cloudflare', // or detect from storage config
        mimeType: file.contentType,
        size: uploadResult.size,
        altText: options?.altText,
        sortOrder: index,
        userId: session.user.id,
      },
    });
    
    // Generate signed URL for immediate use
    const signedUrl = await storage.getUrl(key, { expiresIn: 3600 });
    
    results.push({
      key,
      url: signedUrl,
      mediaId: mediaRecord.id,
    });
  }
  
  return { success: true, data: results };
}
```

## Security & Performance Considerations

### URL Expiration Strategy
```typescript
const URL_EXPIRATION = {
  'product-customer': 3600,    // 1 hour for customer-facing product photos
  'product-admin': 7200,       // 2 hours for admin product management
  'review-photos': 1800,       // 30 minutes for user review photos
  'user-uploads': 1800,        // 30 minutes for user profile images
  'presigned-upload': 900,     // 15 minutes for upload URLs
};
```

### Caching Strategy
```typescript
// Cache signed URLs on the client side until near expiration
// Implement automatic refresh before expiration
// Use service worker for background refresh

const useSignedUrl = (key: string, context: string) => {
  const [url, setUrl] = useState<string>();
  
  useEffect(() => {
    const refreshUrl = async () => {
      const result = await getMediaUrlAction(key, { context });
      if (result.success) {
        setUrl(result.data);
        // Schedule refresh before expiration
        setTimeout(refreshUrl, (expiresIn - 300) * 1000); // 5 min buffer
      }
    };
    
    refreshUrl();
  }, [key, context]);
  
  return url;
};
```

### Storage Provider Configuration
```env
# Environment variables for production
STORAGE_PROVIDER=multi

# Cloudflare R2 for product documents/assets
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key  
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=product-assets

# Cloudflare Images for optimized product photos
CLOUDFLARE_IMAGES_ACCOUNT_ID=your_account_id
CLOUDFLARE_IMAGES_API_TOKEN=your_api_token
CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net/your_account
CLOUDFLARE_IMAGES_SIGNING_KEY=your_signing_key

# Multi-storage routing
STORAGE_CONFIG='{"providers":{"images":{"provider":"cloudflare-images"},"documents":{"provider":"cloudflare-r2"}},"routing":{"images":"images","documents":"documents"}}'
```

## Testing Strategy

### Unit Tests
```typescript
// Test signed URL generation
test('product photos get signed URLs automatically', async () => {
  const result = await getMediaUrlAction('products/123/hero.jpg', {
    context: 'product'
  });
  
  expect(result.success).toBe(true);
  expect(result.data).toMatch(/signed-url-pattern/);
});

// Test permission enforcement
test('unauthorized users cannot upload product media', async () => {
  // Mock no session
  const result = await uploadProductMediaAction('prod-123', files, {
    context: 'admin'
  });
  
  expect(result.success).toBe(false);
  expect(result.error).toBe('Unauthorized');
});
```

### Integration Tests
```typescript
// Test end-to-end workflow
test('admin can upload and retrieve product photos', async () => {
  // 1. Upload product photo
  const uploadResult = await uploadProductMediaAction(productId, [testFile], {
    context: 'admin'
  });
  
  expect(uploadResult.success).toBe(true);
  
  // 2. Retrieve with signed URLs  
  const mediaResult = await getProductMediaAction(productId, {
    context: 'admin'
  });
  
  expect(mediaResult.success).toBe(true);
  expect(mediaResult.data[0].url).toMatch(/signed-url/);
});
```

## Migration Plan

### Step 1: Deploy Storage Actions
1. Deploy updated `@repo/storage` package with signed URL actions
2. Configure environment variables for storage providers
3. Test storage actions in isolation

### Step 2: Migrate Backstage PIM3
1. Update media upload actions to use storage package
2. Update media display components to handle signed URLs
3. Test admin workflows

### Step 3: Migrate Web-Template  
1. Update product display pages to use signed URLs
2. Add customer review photo upload functionality
3. Test customer workflows

### Step 4: Database Integration
1. Run database migrations for storage metadata
2. Update storage actions to create/update database records
3. Implement proper authentication and permissions

### Step 5: Production Deployment
1. Configure production storage providers
2. Monitor signed URL performance and expiration
3. Set up caching and refresh strategies

## Benefits

✅ **Security**: Product photos protected with time-limited signed URLs  
✅ **Centralization**: All storage logic in one package  
✅ **Consistency**: Same API for admin and customer use cases  
✅ **Performance**: Configurable caching and expiration  
✅ **Scalability**: Multi-provider support with intelligent routing  
✅ **Type Safety**: Full TypeScript support throughout  

## Next Steps

1. **Complete Phase 2**: Replace mock implementations in backstage PIM3
2. **Add Authentication**: Integrate with `@repo/auth` for permission checks
3. **Database Integration**: Connect storage actions with prisma database operations
4. **Testing**: Add comprehensive test coverage for all workflows
5. **Performance Optimization**: Implement caching and background refresh strategies