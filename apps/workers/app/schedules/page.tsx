'use client';

import { useEffect, useState } from 'react';

/**
 * Schedule Management Page
 *
 * Simple UI for managing the Kitchen Sink daily schedule
 */
export default function SchedulesPage() {
  const [scheduleStatus, setScheduleStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check schedule status on load
  useEffect(() => {
    checkScheduleStatus();
  }, []);

  const checkScheduleStatus = async () => {
    try {
      const response = await fetch('/api/schedules/kitchen-sink');
      const data = await response.json();
      setScheduleStatus(data);
    } catch (_error) {
      console.error('Failed to check schedule status:', _error);
    }
  };

  const createSchedule = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/schedules/kitchen-sink', {
        body: JSON.stringify({
          cron: '0 9 * * *', // 9 AM UTC daily
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const data = await response.json();
      setMessage(data.message || 'Schedule created successfully');
      await checkScheduleStatus();
    } catch {
      setMessage('Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const pauseSchedule = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/schedules/kitchen-sink', {
        body: JSON.stringify({ action: 'pause' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      });
      const data = await response.json();
      setMessage(data.message || 'Schedule paused');
      await checkScheduleStatus();
    } catch {
      setMessage('Failed to pause schedule');
    } finally {
      setLoading(false);
    }
  };

  const resumeSchedule = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/schedules/kitchen-sink', {
        body: JSON.stringify({ action: 'resume' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      });
      const data = await response.json();
      setMessage(data.message || 'Schedule resumed');
      await checkScheduleStatus();
    } catch {
      setMessage('Failed to resume schedule');
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async () => {
    if (!confirm('Are you sure you want to delete the schedule?')) return;

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/schedules/kitchen-sink', {
        method: 'DELETE',
      });
      const data = await response.json();
      setMessage(data.message || 'Schedule deleted');
      await checkScheduleStatus();
    } catch {
      setMessage('Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Workflow Schedule Management</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Kitchen Sink Daily Schedule</h2>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            The Kitchen Sink workflow demonstrates all QStash and Upstash Workflow features.
            Configure it to run automatically once per day.
          </p>

          <div className="bg-gray-100 rounded p-4">
            <p className="font-mono text-sm">
              Status:{' '}
              <span
                className={scheduleStatus?.status === 'active' ? 'text-green-600' : 'text-gray-600'}
              >
                {scheduleStatus?.status || 'Not configured'}
              </span>
            </p>
            {scheduleStatus?.schedule && (
              <>
                <p className="font-mono text-sm">
                  Schedule: {scheduleStatus.schedule.cron || '0 9 * * *'} (Daily at 9 AM UTC)
                </p>
                {scheduleStatus.schedule.nextRun && (
                  <p className="font-mono text-sm">
                    Next Run: {new Date(scheduleStatus.schedule.nextRun).toLocaleString()}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {scheduleStatus?.status === 'not_found' && (
            <button
              onClick={createSchedule}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              Create Daily Schedule
            </button>
          )}

          {scheduleStatus?.status === 'active' && (
            <>
              <button
                onClick={pauseSchedule}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                disabled={loading}
              >
                Pause Schedule
              </button>
              <button
                onClick={deleteSchedule}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={loading}
              >
                Delete Schedule
              </button>
            </>
          )}

          {scheduleStatus?.status === 'paused' && (
            <>
              <button
                onClick={resumeSchedule}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                disabled={loading}
              >
                Resume Schedule
              </button>
              <button
                onClick={deleteSchedule}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={loading}
              >
                Delete Schedule
              </button>
            </>
          )}

          <button
            onClick={checkScheduleStatus}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            disabled={loading}
          >
            Refresh Status
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">About the Kitchen Sink Workflow</h3>
        <p className="text-gray-600 mb-4">
          The Kitchen Sink workflow can be triggered in three ways:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>
            Via webhook: POST to{' '}
            <code className="bg-gray-100 px-1">/api/kitchen-sink-workflow</code>
          </li>
          <li>Manual invocation: Direct API call with custom payload</li>
          <li>Scheduled: Automatically runs once per day (when configured)</li>
        </ul>

        <h4 className="text-md font-semibold mt-4 mb-2">Features Demonstrated:</h4>
        <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
          <li>All Upstash Workflow context methods</li>
          <li>QStash Flow Control (rate limiting and parallelism)</li>
          <li>URL Groups/Fan-out messaging</li>
          <li>Request Signing verification</li>
          <li>Batch Processing with concurrency control</li>
          <li>Dead Letter Queue handling</li>
          <li>AI integration with Anthropic Claude</li>
          <li>Multi-tenant SaaS patterns</li>
          <li>Real-time event processing</li>
          <li>Complex ETL pipelines</li>
          <li>And much more!</li>
        </ul>
      </div>
    </div>
  );
}
