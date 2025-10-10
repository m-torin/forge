/**
 * Tailwind v4 RSC Data Export Request
 * 100% React Server Component for requesting user data exports
 */

import { useFormState } from "react-dom";
import type { BaseProps, FormState } from "../types";
import { createInitialActionState } from "../types";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";

import {
  cancelExportRequestAction,
  downloadExportAction,
  requestDataExportAction,
} from "./actions";

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  fileExtension: string;
  size?: string;
}

interface ExportRequest {
  id: string;
  format: string;
  status: "pending" | "processing" | "completed" | "failed" | "expired";
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt?: string;
  fileSize?: string;
  error?: string;
}

interface DataCategory {
  id: string;
  name: string;
  description: string;
  included: boolean;
  required: boolean;
  estimatedRecords?: number;
}

interface DataExportRequestProps extends BaseProps {
  availableFormats: ExportFormat[];
  dataCategories: DataCategory[];
  recentExports: ExportRequest[];
  title?: string;
  subtitle?: string;
  maxConcurrentExports?: number;
  retentionDays?: number;
  onExportRequested?: (exportId: string) => void;
  onExportDownloaded?: (exportId: string) => void;
}

const _initialState: FormState = { success: false };

export function DataExportRequest({
  availableFormats,
  dataCategories,
  recentExports,
  title = "Export Your Data",
  subtitle = "Download a copy of your personal data",
  maxConcurrentExports = 3,
  retentionDays = 7,
  onExportRequested: _onExportRequested,
  onExportDownloaded,
  className = "",
}: DataExportRequestProps) {
  const [requestState, requestAction] = useFormState(
    requestDataExportAction,
    createInitialActionState(),
  );
  const [cancelState, cancelAction] = useFormState(
    cancelExportRequestAction,
    createInitialActionState(),
  );
  const [downloadState, _downloadAction] = useFormState(
    downloadExportAction,
    createInitialActionState(),
  );

  const pendingExports = recentExports.filter(
    (exp) => exp.status === "pending" || exp.status === "processing",
  );
  const _completedExports = recentExports.filter(
    (exp) => exp.status === "completed",
  );

  const getStatusColor = (status: ExportRequest["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: ExportRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <svg
            className="h-4 w-4 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "processing":
        return (
          <svg
            className="h-4 w-4 animate-spin text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case "completed":
        return (
          <svg
            className="h-4 w-4 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "failed":
        return (
          <svg
            className="h-4 w-4 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "expired":
        return (
          <svg
            className="h-4 w-4 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const canRequestExport = pendingExports.length < maxConcurrentExports;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
      </div>

      {(requestState?.error || cancelState?.error || downloadState?.error) && (
        <Alert variant="destructive">
          {requestState?.error || cancelState?.error || downloadState?.error}
        </Alert>
      )}

      {(requestState?.success ||
        cancelState?.success ||
        downloadState?.success) && (
        <Alert variant="success">
          {requestState?.message ||
            cancelState?.message ||
            downloadState?.message}
        </Alert>
      )}

      {canRequestExport && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              Request New Export
            </h2>
          </CardHeader>
          <CardContent>
            <form action={requestAction} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Export Format
                </label>
                <div className="grid gap-3">
                  {availableFormats.map((format) => (
                    <label
                      key={format.id}
                      className="flex cursor-pointer items-start space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.id}
                        className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        required
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {format.name} (.{format.fileExtension})
                          </h3>
                          {format.size && (
                            <span className="text-xs text-gray-500">
                              ~{format.size}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {format.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {requestState?.errors?.format && (
                  <p className="mt-1 text-sm text-red-600">
                    {requestState.errors.format[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Data Categories
                </label>
                <div className="grid gap-2">
                  {dataCategories.map((category) => (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-start space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        name="categories"
                        value={category.id}
                        defaultChecked={category.included}
                        disabled={category.required}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {category.name}
                            {category.required && (
                              <span className="ml-1 text-red-600">*</span>
                            )}
                          </h3>
                          {category.estimatedRecords && (
                            <span className="text-xs text-gray-500">
                              ~{category.estimatedRecords.toLocaleString()}{" "}
                              records
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {requestState?.errors?.categories && (
                  <p className="mt-1 text-sm text-red-600">
                    {requestState.errors.categories[0]}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="mb-3 text-sm font-medium text-gray-700">
                  Additional Options
                </h3>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="includePersonalData"
                      defaultChecked={true}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Include Personal Data
                      </span>
                      <p className="text-sm text-gray-600">
                        Name, email, profile information, preferences
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="includeActivityData"
                      defaultChecked={false}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Include Activity Data
                      </span>
                      <p className="text-sm text-gray-600">
                        Login history, usage analytics, session logs
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start">
                  <svg
                    className="mr-3 mt-0.5 h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <h4 className="mb-2 font-medium">Export Information</h4>
                    <ul className="list-inside list-disc space-y-1">
                      <li>
                        Processing may take several hours for large datasets
                      </li>
                      <li>You'll receive an email when your export is ready</li>
                      <li>
                        Downloads are available for {retentionDays} days after
                        completion
                      </li>
                      <li>
                        You can have up to {maxConcurrentExports} active export
                        requests
                      </li>
                      <li>
                        All exports are encrypted and require authentication to
                        download
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={requestState === undefined}
              >
                {requestState === undefined
                  ? "Processing Request..."
                  : "Request Data Export"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!canRequestExport && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <svg
                className="mr-3 mt-0.5 h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-yellow-800">
                <h4 className="mb-1 font-medium">Export Limit Reached</h4>
                <p>
                  You have reached the maximum of {maxConcurrentExports}{" "}
                  concurrent export requests. Please wait for existing exports
                  to complete before requesting new ones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {recentExports.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              Recent Exports
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExports.map((exportReq) => (
                <div
                  key={exportReq.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 flex-shrink-0">
                      {getStatusIcon(exportReq.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {exportReq.format.toUpperCase()} Export
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(exportReq.status)}`}
                        >
                          {exportReq.status.charAt(0).toUpperCase() +
                            exportReq.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          Requested:{" "}
                          {new Date(exportReq.requestedAt).toLocaleString()}
                        </p>
                        {exportReq.completedAt && (
                          <p>
                            Completed:{" "}
                            {new Date(exportReq.completedAt).toLocaleString()}
                          </p>
                        )}
                        {exportReq.fileSize && (
                          <p>Size: {exportReq.fileSize}</p>
                        )}
                        {exportReq.expiresAt &&
                          exportReq.status === "completed" && (
                            <p className="text-orange-600">
                              Expires:{" "}
                              {new Date(exportReq.expiresAt).toLocaleString()}
                            </p>
                          )}
                        {exportReq.error && (
                          <p className="text-red-600">
                            Error: {exportReq.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {exportReq.status === "completed" &&
                      exportReq.downloadUrl && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            window.open(exportReq.downloadUrl, "_blank");
                            if (onExportDownloaded) {
                              onExportDownloaded(exportReq.id);
                            }
                          }}
                        >
                          Download
                        </Button>
                      )}

                    {(exportReq.status === "pending" ||
                      exportReq.status === "processing") && (
                      <form action={cancelAction} className="inline">
                        <input
                          type="hidden"
                          name="exportId"
                          value={exportReq.id}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          disabled={cancelState === undefined}
                        >
                          Cancel
                        </Button>
                      </form>
                    )}

                    {exportReq.status === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Could trigger a retry action
                          // console.log('Retry export:', exportReq.id);
                        }}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-900">
            About Data Exports
          </h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>
              • Data exports include all personal information stored in your
              account
            </p>
            <p>
              • Exports are provided in machine-readable formats for portability
            </p>
            <p>• Processing time varies based on data volume and system load</p>
            <p>• Download links are secure and expire automatically</p>
            <p>• Contact support if you need assistance with your export</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
