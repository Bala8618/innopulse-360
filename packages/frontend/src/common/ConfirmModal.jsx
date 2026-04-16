export default function ConfirmModal({ open, title, description, onConfirm, onCancel, busy }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded border px-3 py-2 text-sm dark:border-slate-700" onClick={onCancel}>
            Cancel
          </button>
          <button className="rounded bg-rose-600 px-3 py-2 text-sm text-white disabled:opacity-60" onClick={onConfirm} disabled={busy}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
