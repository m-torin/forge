'use client';

import { useEffect, useState } from 'react';

export default function KitchenSinkSchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cron, setCron] = useState('0 9 * * *');
  const [timezone, setTimezone] = useState('UTC');

  // Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedule-kitchen-sink');
      const data = await response.json();
      if (data.success) {
        setSchedules(data.schedules || []);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to fetch schedules');
    }
  };

  const createSchedule = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/schedule-kitchen-sink', {
        body: JSON.stringify({ cron, timezone }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        alert(`Schedule created successfully! ID: ${data.scheduleId}`);
        fetchSchedules();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/schedule-kitchen-sink?scheduleId=${scheduleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('Schedule deleted successfully!');
        fetchSchedules();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Kitchen Sink Workflow Scheduler</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Daily Schedule</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
            <input
              onChange={(e) => setCron(e.target.value)}
              placeholder="0 9 * * * (9 AM daily)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              type="text"
              value={cron}
            />
            <p className="text-sm text-gray-500 mt-1">Format: minute hour day month weekday</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={timezone}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>

          <button
            onClick={createSchedule}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Active Schedules</h2>

        {schedules.length === 0 ? (
          <p className="text-gray-500">No schedules found</p>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="border border-gray-200 rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Schedule ID: {schedule.id}</p>
                    <p className="text-sm text-gray-600">Cron: {schedule.cron}</p>
                    <p className="text-sm text-gray-600">Timezone: {schedule.timezone || 'UTC'}</p>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(schedule.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Quick Reference</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Daily at 9 AM: <code>0 9 * * *</code>
          </li>
          <li>
            • Every hour: <code>0 * * * *</code>
          </li>
          <li>
            • Every Monday at 8 AM: <code>0 8 * * 1</code>
          </li>
          <li>• Twice daily (9 AM & 5 PM): Create two schedules</li>
        </ul>
      </div>
    </div>
  );
}
