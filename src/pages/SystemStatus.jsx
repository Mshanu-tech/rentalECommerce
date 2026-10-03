import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Temporary Phase-1 diagnostic page.
 * Confirms that: Vite dev server -> Express API -> MySQL are all wired up
 * correctly before any real features are built on top.
 */
export default function SystemStatus() {
  const [status, setStatus] = useState('loading'); // loading | ok | error
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/health')
      .then((res) => {
        if (!mounted) return;
        setStatus('ok');
        setDetails(res.data);
      })
      .catch((err) => {
        if (!mounted) return;
        setStatus('error');
        setDetails({ message: err.message });
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Phase 1 — System Status</h1>
        <p className="mt-1 text-sm text-gray-500">
          Checking connection: React → Express → MySQL
        </p>

        <div className="mt-6 space-y-3">
          <StatusRow label="Frontend (Vite + React)" state="ok" />
          <StatusRow
            label="Backend API (Express)"
            state={status === 'loading' ? 'loading' : status === 'ok' ? 'ok' : 'error'}
          />
          <StatusRow
            label="Database (MySQL)"
            state={
              status === 'loading'
                ? 'loading'
                : status === 'ok' && details?.database === 'connected'
                ? 'ok'
                : 'error'
            }
          />
        </div>

        {status === 'ok' && (
          <pre className="mt-6 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            {JSON.stringify(details, null, 2)}
          </pre>
        )}

        {status === 'error' && (
          <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {details?.message || 'Could not reach the backend API.'}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusRow({ label, state }) {
  const dot =
    state === 'ok'
      ? 'bg-green-500'
      : state === 'error'
      ? 'bg-red-500'
      : 'bg-yellow-400 animate-pulse';

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
    </div>
  );
}
