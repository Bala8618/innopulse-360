import { useMemo, useState } from 'react';

export default function DataTable({ columns = [], rows = [], rowActions = [] }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [rows, currentPage]
  );

  if (!columns.length) return <div className="text-sm text-slate-500">No columns configured.</div>;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              {columns.map((c) => <th key={c.key} className="px-3 py-2">{c.label}</th>)}
              {rowActions.length ? <th className="px-3 py-2">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? pageRows.map((row, idx) => (
              <tr key={row._id || row.id || idx} className="border-t dark:border-slate-700">
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2">{c.render ? c.render(row) : (row[c.key] ?? '-')}</td>
                ))}
                {rowActions.length ? (
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {rowActions.map((a) => (
                        <button
                          key={a.label}
                          type="button"
                          className={`rounded px-2 py-1 text-xs text-white ${a.variant === 'danger' ? 'bg-rose-600' : 'bg-blue-600'}`}
                          onClick={() => a.onClick(row)}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </td>
                ) : null}
              </tr>
            )) : (
              <tr><td className="px-3 py-4 text-sm text-slate-500" colSpan={columns.length + 1}>No data available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{rows.length} records</span>
        <div className="flex items-center gap-2">
          <button className="rounded border px-2 py-1" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <span>Page {currentPage} / {totalPages}</span>
          <button className="rounded border px-2 py-1" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      </div>
    </div>
  );
}
