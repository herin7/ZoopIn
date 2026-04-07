import { create } from 'zustand';

const AUTH_STORAGE_KEY = 'zoopin-auth';

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  try {
    const storedValue = window.sessionStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedValue) {
      return { token: null, user: null };
    }

    return JSON.parse(storedValue);
  } catch (error) {
    return { token: null, user: null };
  }
};

const persistAuth = (authState) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
};

const clearStoredAuth = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

const initialAuthState = readStoredAuth();

export const useAuthStore = create((set) => ({
  token: initialAuthState.token,
  user: initialAuthState.user,
  setAuth: ({ token, user }) => {
    persistAuth({ token, user });
    set({ token, user });
  },
  logout: () => {
    clearStoredAuth();
    set({ token: null, user: null });
  },
}));
