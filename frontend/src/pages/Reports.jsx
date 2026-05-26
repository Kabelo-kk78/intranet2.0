import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

/**
 * Simple CSV export helper
 */
function downloadCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(','),
    ...rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Small inline bar component using SVG
 */
const InlineBar = ({ value = 0, max = 100, color = '#2563EB' }) => {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-3 rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: 'width 400ms ease',
        }}
      />
    </div>
  );
};

export default function Reports() {
  const [data, setData] = useState({ documents: [], activities: [], departments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/documents').catch(() => ({ data: [] })),
      api.get('/activities/recent').catch(() => ({ data: [] })),
      api.get('/departments/stats').catch(() => ({ data: { list: [] } })),
    ])
      .then(([docs, acts, depts]) => {
        setData({
          documents: docs.data || [],
          activities: acts.data || [],
          departments: (depts.data && depts.data.list) || [],
        });
      })
      .catch(() => setError('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  // Derived aggregates
  const byDepartment = useMemo(() => {
    const map = {};
    data.documents.forEach(d => {
      const key = d.department || 'Unassigned';
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [data.documents]);

  const byStatus = useMemo(() => {
    const map = {};
    data.documents.forEach(d => {
      const key = d.status || 'unknown';
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [data.documents]);

  const totalDocs = data.documents.length;
  const maxDeptCount = Math.max(1, ...Object.values(byDepartment));

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-gray-500">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Overview of documents, departments and recent activity</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadCSV('documents.csv', data.documents)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Export Documents
            </button>
          </div>
        </header>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* Top metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 mb-1">Total Documents</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalDocs}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 mb-1">Approved</p>
            <p className="text-3xl font-bold text-green-600">{byStatus.approved || 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{byStatus.pending || 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 mb-1">Departments</p>
            <p className="text-3xl font-bold text-blue-600">{data.departments.length}</p>
          </div>
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents by Department */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Documents by Department</h2>
              <p className="text-sm text-gray-500 dark:text-gray-300">{totalDocs} total</p>
            </div>

            <div className="space-y-3">
              {Object.keys(byDepartment).length === 0 ? (
                <p className="text-gray-500">No documents available.</p>
              ) : (
                Object.entries(byDepartment).map(([dept, count]) => (
                  <div key={dept} className="flex items-center gap-4">
                    <div className="w-36 text-sm text-gray-600 dark:text-gray-300">{dept}</div>
                    <div className="flex-1">
                      <InlineBar value={count} max={maxDeptCount} color="#2563EB" />
                    </div>
                    <div className="w-12 text-right text-sm font-medium text-gray-700 dark:text-gray-200">{count}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Departments list */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Departments</h2>
            <div className="space-y-2">
              {data.departments.length === 0 ? (
                <p className="text-gray-500">No departments found.</p>
              ) : (
                data.departments.map(d => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <div className="text-gray-800 dark:text-gray-100">{d.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{d.description || ''}</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{d.headCount ?? 0} members</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
            <button
              onClick={() => {
                setLoading(true);
                api.get('/activities/recent')
                  .then(res => setData(prev => ({ ...prev, activities: res.data || [] })))
                  .catch(() => setError('Failed to refresh activities'))
                  .finally(() => setLoading(false));
              }}
              className="text-sm text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              Refresh
            </button>
          </div>

          {data.activities.length > 0 ? (
            <div className="space-y-3">
              {data.activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-gray-800 dark:text-gray-100">{a.description}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-400 mt-1">{new Date(a.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}
