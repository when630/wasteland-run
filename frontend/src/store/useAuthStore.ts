import { create } from 'zustand';

interface AuthState {
  username: string;
  isAuthenticated: boolean;
  setUsername: (name: string) => void;
}

export const useAuthStore = create<AuthState>(() => ({
  username: 'Player',
  isAuthenticated: true,
  setUsername: (name: string) => useAuthStore.setState({ username: name }),
}));
