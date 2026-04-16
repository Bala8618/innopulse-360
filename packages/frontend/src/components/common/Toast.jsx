import { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const style = type === 'error'
    ? 'bg-rose-600'
    : 'bg-gradient-to-r from-indigo-500 to-purple-600';

  return (
    <div className={`fixed top-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm text-white shadow-lg ${style}`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="rounded-md px-2 py-1 text-xs text-white/80 hover:text-white">
          x
        </button>
      </div>
    </div>
  );
};

export default Toast;
