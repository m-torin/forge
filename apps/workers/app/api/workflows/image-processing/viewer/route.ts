import { type NextRequest, NextResponse } from 'next/server';

import { createWorkflowClient } from '@repo/orchestration/client';

/**
 * Image Processing Results Viewer API
 *
 * Fetches the results of an image processing workflow and returns
 * an HTML page displaying all processed images
 */

const client = createWorkflowClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workflowRunId = searchParams.get('id');

  if (!workflowRunId) {
    return new NextResponse('Missing workflow run ID', { status: 400 });
  }

  try {
    // Fetch workflow logs
    const logs = await client.logs({ workflowRunId });

    if (!logs.runs.length) {
      return new NextResponse('Workflow not found', { status: 404 });
    }

    const run = logs.runs[0];

    // Check if workflow is complete
    if (run.workflowState === 'RUN_STARTED') {
      return new NextResponse(generatePendingHTML(workflowRunId), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Extract the response data
    const response = run.workflowRunResponse;

    if (!response || run.workflowState === 'RUN_FAILED') {
      return new NextResponse(generateErrorHTML(workflowRunId, run.workflowState), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Parse the response to get image URLs
    const result = typeof response === 'string' ? JSON.parse(response) : response;

    return new NextResponse(generateGalleryHTML(workflowRunId, result), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    return new NextResponse(generateErrorHTML(workflowRunId, 'ERROR', error), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function generatePendingHTML(workflowRunId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Processing Images...</title>
  <meta http-equiv="refresh" content="3">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
    }
    .loading {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <h1>Processing Images...</h1>
    <p>Workflow ID: ${workflowRunId}</p>
    <p>This page will refresh automatically.</p>
  </div>
</body>
</html>
  `;
}

function generateErrorHTML(workflowRunId: string, state: string, error?: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Processing Error</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
    }
    .error {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #e74c3c;
    }
    pre {
      background: #f8f8f8;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="error">
    <h1>Processing Error</h1>
    <p>Workflow ID: ${workflowRunId}</p>
    <p>State: ${state}</p>
    ${error ? `<pre>${JSON.stringify(error, null, 2)}</pre>` : ''}
  </div>
</body>
</html>
  `;
}

function generateGalleryHTML(workflowRunId: string, result: any): string {
  const images = result.urls || [];
  const processed = images.filter((img: any) => img.type === 'processed');
  const thumbnails = images.filter((img: any) => img.type === 'thumbnail');

  // Group images by resolution
  const byResolution = processed.reduce((acc: any, img: any) => {
    const key = img.resolution || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(img);
    return acc;
  }, {});

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Image Processing Results</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
    }
    h1, h2 {
      color: #333;
    }
    .stats {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .stat {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #3498db;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #666;
    }
    .resolution-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .image-card {
      background: #f8f9fa;
      border-radius: 4px;
      overflow: hidden;
      transition: transform 0.2s;
    }
    .image-card:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .image-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      cursor: pointer;
    }
    .image-info {
      padding: 0.75rem;
      font-size: 0.875rem;
    }
    .filter-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      font-size: 0.75rem;
      margin-right: 0.5rem;
    }
    .size-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      background: #f3e5f5;
      color: #7b1fa2;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .thumbnails {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .thumb-grid {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    .thumb {
      border: 2px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.9);
    }
    .modal-content {
      margin: auto;
      display: block;
      max-width: 90%;
      max-height: 90%;
      margin-top: 2%;
    }
    .close {
      position: absolute;
      top: 15px;
      right: 35px;
      color: #f1f1f1;
      font-size: 40px;
      font-weight: bold;
      cursor: pointer;
    }
    .close:hover {
      color: #bbb;
    }
  </style>
</head>
<body>
  <h1>Image Processing Results</h1>
  
  <div class="stats">
    <h2>Processing Summary</h2>
    <div class="stats-grid">
      <div class="stat">
        <div class="stat-value">${result.results?.totalImages || 0}</div>
        <div class="stat-label">Total Images</div>
      </div>
      <div class="stat">
        <div class="stat-value">${result.results?.totalSizeMB || 0} MB</div>
        <div class="stat-label">Total Size</div>
      </div>
      <div class="stat">
        <div class="stat-value">${result.processingTime ? (result.processingTime / 1000).toFixed(1) : 0}s</div>
        <div class="stat-label">Processing Time</div>
      </div>
      <div class="stat">
        <div class="stat-value">${result.processed?.filters?.length || 0}</div>
        <div class="stat-label">Filters Applied</div>
      </div>
    </div>
  </div>

  ${
    thumbnails.length > 0
      ? `
  <div class="thumbnails">
    <h2>Thumbnails</h2>
    <div class="thumb-grid">
      ${thumbnails
        .map(
          (thumb: any) => `
        <div class="thumb">
          <img src="${thumb.dataUrl}" alt="Thumbnail ${thumb.size}px" width="${thumb.size}" height="${thumb.size}" />
        </div>
      `,
        )
        .join('')}
    </div>
  </div>
  `
      : ''
  }

  ${Object.entries(byResolution)
    .map(
      ([resolution, imgs]: [string, any]) => `
    <div class="resolution-section">
      <h2>${resolution}px Resolution</h2>
      <div class="image-grid">
        ${imgs
          .map(
            (img: any) => `
          <div class="image-card">
            <img 
              src="${img.dataUrl}" 
              alt="${img.filter} - ${resolution}px"
              onclick="openModal(this)"
            />
            <div class="image-info">
              <span class="filter-badge">${img.filter}</span>
              <span class="size-badge">${(img.bytes / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>
  `,
    )
    .join('')}

  <div id="imageModal" class="modal" onclick="closeModal()">
    <span class="close">&times;</span>
    <img class="modal-content" id="modalImage">
  </div>

  <script>
    function openModal(img) {
      const modal = document.getElementById('imageModal');
      const modalImg = document.getElementById('modalImage');
      modal.style.display = 'block';
      modalImg.src = img.src;
    }

    function closeModal() {
      document.getElementById('imageModal').style.display = 'none';
    }
  </script>
</body>
</html>
  `;
}
