import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  tokens: number;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  decrementToken: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  tokens: 0,
  isLoading: true,
  
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    await get().refreshTokens();
  },
  
  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, tokens: 0 });
  },
  
  refreshTokens: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      set({ tokens: 0 });
      return;
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('tokens')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching tokens:', error);
      set({ tokens: 0 });
      return;
    }
    
    set({ tokens: data?.tokens || 0 });
  },
  
  decrementToken: () => {
    set((state) => ({ tokens: Math.max(0, state.tokens - 1) }));
  },
}));

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({ session, user: session?.user || null, isLoading: false });
  
  if (session?.user) {
    useAuthStore.getState().refreshTokens();
  }
});

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({ session, user: session?.user || null });
  
  if (event === 'SIGNED_IN' && session?.user) {
    useAuthStore.getState().refreshTokens();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ tokens: 0 });
  }
});