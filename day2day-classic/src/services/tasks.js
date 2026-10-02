import { supabase } from './supabase';

// Fetch all tasks for the logged-in user (used to build calendar dot markers)
export async function fetchAllTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('target_date', { ascending: true });
  if (error) throw error;
  return data;
}

// Fetch tasks for one specific day (YYYY-MM-DD)
export async function fetchTasksForDate(dateString) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('target_date', dateString)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createTask({ user_id, title, description, target_date }) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ user_id, title, description, target_date }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleTaskStatus(id, currentStatus) {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}