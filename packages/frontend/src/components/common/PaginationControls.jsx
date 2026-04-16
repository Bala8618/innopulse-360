export default function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPrev,
  onNext
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-300">
      <span>{totalItems} records • {pageSize} per page</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrev}
          className="rounded border border-slate-300 px-2 py-1 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Prev
        </button>
        <span>Page {page} / {totalPages}</span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className="rounded border border-slate-300 px-2 py-1 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Next
        </button>
      </div>
    </div>
  );
}
