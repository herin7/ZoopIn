import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

const TONE_STYLES = {
  info: 'border-brand-blue/40 bg-white/5 text-brand-blue',
  success: 'border-brand-blue/40 bg-white/5 text-brand-blue',
  warning: 'border-brand-yellow/40 bg-white/5 text-brand-yellow',
  error: 'border-red-500/40 bg-white/5 text-red-100',
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
          className={`pointer-events-auto rounded-2xl border p-4 shadow-lg backdrop-blur-sm ${TONE_STYLES[toast.tone] || TONE_STYLES.info}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              <p className="mt-1 text-sm opacity-90">{toast.message}</p>
            </div>
            <button
              className="rounded-full p-1 text-current/80 transition hover:bg-white/10 hover:text-current"
              onClick={() => removeToast(toast.id)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
