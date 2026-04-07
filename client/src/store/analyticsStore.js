import { create } from 'zustand';

export const useAnalyticsStore = create((set) => ({
  analyticsData: null,
  setAnalyticsData: (data) => set({ analyticsData: data }),
}));
