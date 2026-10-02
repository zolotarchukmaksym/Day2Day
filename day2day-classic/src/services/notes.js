import { supabase } from './supabase';

export async function fetchNotes() {
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createNote({ user_id, title, content }) {
    const { data, error } = await supabase
        .from('notes')
        .insert([{ user_id, title, content }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteNote(id) {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
}