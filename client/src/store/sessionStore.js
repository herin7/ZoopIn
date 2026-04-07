import { create } from 'zustand';

export const useSessionStore = create((set) => ({
  session: null,
  viewerCount: 0,
  currentProduct: null,
  setSession: (session) =>
    set((state) => ({
      session: typeof session === 'function' ? session(state.session) : session,
    })),
  setViewerCount: (viewerCount) =>
    set((state) => ({
      viewerCount:
        typeof viewerCount === 'function' ? viewerCount(state.viewerCount) : viewerCount,
    })),
  setCurrentProduct: (product) =>
    set((state) => ({
      currentProduct:
        typeof product === 'function' ? product(state.currentProduct) : product,
    })),
}));
