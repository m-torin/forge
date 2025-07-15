'use client';

import {
  bulkDeleteMediaAction,
  deleteMediaAction,
  getMediaUrlAction,
  listMediaAction,
  uploadMediaAction,
} from '@repo/storage/server/next';
import React, { useState } from 'react';

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
      const result = await uploadMediaAction(`uploads/${Date.now()}-${file.name}`, buffer, {
        contentType: file.type,
      });

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
          result.data.map(async (file: { key: string }) => {
            const urlResult = await getMediaUrlAction(file.key);
            return {
              key: file.key,
              url: urlResult.success && urlResult.data ? urlResult.data : '',
            };
          }),
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
      const keys = files.map((f: { key: string; url: string }) => f.key);
      const result = await bulkDeleteMediaAction(keys);

      if (result.success && result.data) {
        setMessage(
          `Deleted ${result.data.succeeded.length} files, ` + `${result.data.failed.length} failed`,
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
    <div className="mx-auto max-w-2xl p-4">
      <h2 className="mb-4 text-2xl font-bold">Storage Server Actions Example</h2>

      {/* Upload Section */}
      <div className="mb-6 rounded border p-4">
        <h3 className="mb-2 text-lg font-semibold">Upload File</h3>
        <input type="file" onChange={handleUpload} disabled={loading} className="mb-2" />
        <p className="text-sm text-gray-600">
          Files will be uploaded to the &apos;uploads/&apos; prefix
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6 space-x-2">
        <button
          onClick={refreshFileList}
          disabled={loading}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Refresh List
        </button>
        <button
          onClick={handleDeleteAll}
          disabled={loading || files.length === 0}
          className="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Delete All
        </button>
      </div>

      {/* Status Message */}
      {message && <div className="mb-4 rounded bg-gray-100 p-3">{message}</div>}

      {/* File List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Files</h3>
        {files.length === 0 ? (
          <p className="text-gray-500">No files found</p>
        ) : (
          files.map((file: { key: string; url: string }) => (
            <div key={file.key} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-mono text-sm">{file.key}</p>
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View file
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDelete(file.key)}
                disabled={loading}
                className="rounded bg-red-500 px-3 py-1 text-sm text-white disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded bg-white p-4">Loading...</div>
        </div>
      )}
    </div>
  );
}
