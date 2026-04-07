import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

const TONE_STYLES = {
  info: 'border-black bg-white text-black',
  success: 'border-black bg-zoop-yellow text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
  warning: 'border-black bg-orange-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
  error: 'border-black bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    const timeoutIds = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), 4000)
    );

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [removeToast, toasts]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto border-[3px] p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${TONE_STYLES[toast.tone] || TONE_STYLES.info}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-black uppercase italic tracking-tighter leading-none mb-1">{toast.title}</p>
              <p className="text-sm font-bold opacity-80 leading-tight">{toast.message}</p>
            </div>
            <button
              className="border-2 border-black bg-black text-white p-1 hover:bg-white hover:text-black transition-colors"
              onClick={() => removeToast(toast.id)}
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
