# Chart Sitemaps Workflow

Process and analyze chart sitemaps for data extraction.

## Overview

This workflow processes sitemap files to extract chart-related data and metadata.

## Payload

```typescript
interface ChartSitemapsPayload {
  message?: string;
  url?: string;
}
```

## Tags

- `jollyRoger`
- `etl`

## Usage

### Via API

```bash
curl -X POST http://localhost:3400/api/workflows/chart-sitemaps \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Processing charts",
    "url": "https://example.com/sitemap.xml"
  }'
```

### Via Server Action

```typescript
import { runChartSitemapsWorkflow } from '@/workflows/chart-sitemaps/actions';

const result = await runChartSitemapsWorkflow({
  message: 'Processing charts',
  url: 'https://example.com/sitemap.xml'
});
```