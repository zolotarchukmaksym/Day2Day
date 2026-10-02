import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean; // true until we've checked for an existing session
  error: string | null;

  init: () => () => void; // returns unsubscribe fn
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  error: null,

  init: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, isLoading: false });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, isLoading: false });
    });

    return () => listener.subscription.unsubscribe();
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      throw error;
    }
  },

  signUp: async (email, password) => {
    console.log("SIGN UP START", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },
}));

