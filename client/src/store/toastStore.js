import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: ({ title, message, tone = 'info' }) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: window.crypto.randomUUID(),
          title,
          message,
          tone,
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
