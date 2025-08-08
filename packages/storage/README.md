# @repo/storage

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`
  - **Utilities**: `./keys`

- _AI Hints:_

  ```typescript
  // Primary: File storage operations with key management
  import { upload, download } from "@repo/storage/server/next";
  // Client: import { useStorage } from "@repo/storage/client/next"
  // ❌ NEVER: Store sensitive files without proper access controls
  ```

- _Key Features:_
  - **Multi-Provider Support**: Cloudflare R2, Cloudflare Images, Vercel Blob
  - **Advanced Uploads**: Multipart uploads, streaming, progress tracking,
    concurrent uploads
  - **Image Optimization**: Automatic transformations, variants, CDN delivery
  - **Presigned URLs**: Secure client-side uploads without exposing credentials
  - **24 Server Actions**: Complete Next.js App Router integration

- _Environment Variables:_

  ```bash
  STORAGE_PROVIDER=vercel-blob # or cloudflare-r2, cloudflare-images, multi
  BLOB_READ_WRITE_TOKEN=your-token
  CLOUDFLARE_IMAGES_ACCOUNT_ID=your-account-id
  CLOUDFLARE_IMAGES_API_TOKEN=your-api-token
  R2_ACCOUNT_ID=your-account-id
  R2_ACCESS_KEY_ID=your-access-key
  R2_SECRET_ACCESS_KEY=your-secret-key
  ```

- _Quick Start:_

  ```typescript
  import { upload, download } from "@repo/storage/server/next";
  // Server Actions available: uploadMediaAction, bulkImportFromUrlsAction
  ```

- _Documentation:_ **[Storage Package](../../apps/docs/packages/storage.mdx)**
