import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { NewNoteInput, Note } from '../types';

type NoteState = {
  notes: Note[];
  isLoading: boolean;
  error: string | null;

  fetchNotes: () => Promise<void>;
  addNote: (input: NewNoteInput) => Promise<void>;
  updateNote: (id: string, changes: Partial<NewNoteInput>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
};

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }
    set({ notes: data as Note[], isLoading: false });
  },

  addNote: async (input) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase.from('notes').insert({
      user_id: userId,
      title: input.title,
      content: input.content ?? null,
    });
    if (error) throw error;
    await get().fetchNotes();
  },

  updateNote: async (id, changes) => {
    const { error } = await supabase.from('notes').update(changes).eq('id', id);
    if (error) throw error;
    await get().fetchNotes();
  },

  deleteNote: async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
    set({ notes: get().notes.filter((n) => n.id !== id) });
  },
}));
