import { create } from 'zustand';
import { AuthUser } from '@/lib/types';
import { mockApi } from '@/lib/mockApi';

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await mockApi.auth.login({ email, password });
      sessionStorage.setItem('token', response.token);
      set({ user: response.user, token: response.token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await mockApi.auth.register({ name, email, password });
      sessionStorage.setItem('token', response.token);
      set({ user: response.user, token: response.token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    sessionStorage.removeItem('token');
    set({ user: null, token: null });
  },

  initialize: () => {
    const token = sessionStorage.getItem('token');
    if (token) {
      const user = mockApi.auth.validateToken(token);
      if (user) {
        set({ user, token });
      } else {
        sessionStorage.removeItem('token');
      }
    }
  }
}));
