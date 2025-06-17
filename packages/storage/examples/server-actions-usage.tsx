'use client';

import { useState } from 'react';
import {
  uploadMediaAction,
  listMediaAction,
  deleteMediaAction,
  getMediaUrlAction,
  bulkDeleteMediaAction,
} from '@repo/storage/server/next';

/**
 * Example component demonstrating how to use storage server actions in a Next.js app
 */
export function StorageActionsExample() {
  const [files, setFiles] = useState<Array<{ key: string; url: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('Uploading...');

    try {
      // Convert file to ArrayBuffer
      const buffer = await file.arrayBuffer();
      
      // Upload using server action
      const result = await uploadMediaAction(
        `uploads/${Date.now()}-${file.name}`,
        buffer,
        {
          contentType: file.type,
        }
      );

      if (result.success && result.data) {
        setMessage('Upload successful!');
        await refreshFileList();
      } else {
        setMessage(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Refresh file list
  const refreshFileList = async () => {
    setLoading(true);
    try {
      const result = await listMediaAction({ prefix: 'uploads/' });
      
      if (result.success && result.data) {
        // Get URLs for each file
        const filesWithUrls = await Promise.all(
          result.data.map(async (file) => {
            const urlResult = await getMediaUrlAction(file.key);
            return {
              key: file.key,
              url: urlResult.success && urlResult.data ? urlResult.data : '',
            };
          })
        );
        
        setFiles(filesWithUrls);
        setMessage(`Found ${filesWithUrls.length} files`);
      } else {
        setMessage(`Failed to list files: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete a single file
  const handleDelete = async (key: string) => {
    setLoading(true);
    try {
      const result = await deleteMediaAction(key);
      
      if (result.success) {
        setMessage(`Deleted ${key}`);
        await refreshFileList();
      } else {
        setMessage(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete all files
  const handleDeleteAll = async () => {
    if (files.length === 0) return;
    
    setLoading(true);
    try {
      const keys = files.map(f => f.key);
      const result = await bulkDeleteMediaAction(keys);
      
      if (result.success && result.data) {
        setMessage(
          `Deleted ${result.data.succeeded.length} files, ` +
          `${result.data.failed.length} failed`
        );
        await refreshFileList();
      } else {
        setMessage(`Bulk delete failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Storage Server Actions Example</h2>
      
      {/* Upload Section */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Upload File</h3>
        <input
          type="file"
          onChange={handleUpload}
          disabled={loading}
          className="mb-2"
        />
        <p className="text-sm text-gray-600">
          Files will be uploaded to the 'uploads/' prefix
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6 space-x-2">
        <button
          onClick={refreshFileList}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Refresh List
        </button>
        <button
          onClick={handleDeleteAll}
          disabled={loading || files.length === 0}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Delete All
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          {message}
        </div>
      )}

      {/* File List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Files</h3>
        {files.length === 0 ? (
          <p className="text-gray-500">No files found</p>
        ) : (
          files.map((file) => (
            <div key={file.key} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-mono text-sm">{file.key}</p>
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline"
                  >
                    View file
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDelete(file.key)}
                disabled={loading}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            Loading...
          </div>
        </div>
      )}
    </div>
  );
}