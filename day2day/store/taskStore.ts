import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { MarkedDates, NewTaskInput, Task } from '../types';
import { theme } from '../theme/theme';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type TaskState = {
  selectedDate: string;            // 'YYYY-MM-DD'
  tasksForSelectedDate: Task[];
  markedDates: MarkedDates;        // dots shown on the calendar
  isLoading: boolean;
  error: string | null;

  setSelectedDate: (date: string) => void;
  fetchTasksForSelectedDate: () => Promise<void>;
  fetchMonthMarkers: (year: number, month: number) => Promise<void>; // month: 1-12
  addTask: (input: NewTaskInput) => Promise<void>;
  updateTask: (id: string, changes: Partial<NewTaskInput>) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addBatchTasks: (inputs: NewTaskInput[]) => Promise<void>;
  
  allTasks: Task[];
  fetchAllTasks: () => Promise<void>;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  selectedDate: todayIso(),
  tasksForSelectedDate: [],
  allTasks: [],
  markedDates: {},
  isLoading: false,
  error: null,

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().fetchTasksForSelectedDate();
  },

  // Loads only the tasks needed for the day currently shown below the calendar.
  fetchTasksForSelectedDate: async () => {
    set({ isLoading: true, error: null });
    const { selectedDate } = get();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('target_date', selectedDate)
      .order('created_at', { ascending: true });

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }
    set({ tasksForSelectedDate: data as Task[], isLoading: false });
  },

  fetchAllTasks: async () => {
    set({ isLoading: true, error: null });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) {
      set({ isLoading: false, error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('target_date', todayIso())
      .order('target_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }
    set({ allTasks: data as Task[], isLoading: false });
  },

  // Loads just the dates (not full task rows) for one visible calendar month,
  // and turns them into the dot markers react-native-calendars expects.
  fetchMonthMarkers: async (year, month) => {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).getDate(); // last day of month
    const end = `${year}-${String(month).padStart(2, '0')}-${String(endDate).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('tasks')
      .select('target_date')
      .gte('target_date', start)
      .lte('target_date', end);

    if (error) {
      set({ error: error.message });
      return;
    }

    const marks: MarkedDates = {};
    (data as { target_date: string }[]).forEach((row) => {
      marks[row.target_date] = { marked: true, dotColor: theme.colors.coral };
    });

    // keep the current selection highlighted on top of the dots
    const { selectedDate } = get();
    marks[selectedDate] = {
      ...(marks[selectedDate] ?? {}),
      selected: true,
      selectedColor: theme.colors.primary,
    };

    set({ markedDates: marks });
  },

  addTask: async (input) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase.from('tasks').insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      target_date: input.target_date,
    });
    if (error) throw error;

    await get().fetchTasksForSelectedDate();
    await get().fetchAllTasks();
    const [year, month] = input.target_date.split('-');
    await get().fetchMonthMarkers(parseInt(year, 10), parseInt(month, 10));
  },

  addBatchTasks: async (inputs) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const rows = inputs.map((input) => ({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      target_date: input.target_date,
    }));

    const { error } = await supabase.from('tasks').insert(rows);
    if (error) throw error;

    await get().fetchTasksForSelectedDate();
    await get().fetchAllTasks();
    // Refresh markers for the current month
    const { selectedDate } = get();
    const [year, month] = selectedDate.split('-');
    await get().fetchMonthMarkers(parseInt(year, 10), parseInt(month, 10));
  },

  updateTask: async (id, changes) => {
    const { error } = await supabase.from('tasks').update(changes).eq('id', id);
    if (error) throw error;
    await get().fetchTasksForSelectedDate();
    await get().fetchAllTasks();
  },

  toggleTaskCompleted: async (id) => {
    const task = get().tasksForSelectedDate.find((t) => t.id === id) || get().allTasks.find((t) => t.id === id);
    if (!task) return;

    // Optimistic update so the checkbox feels instant.
    set({
      tasksForSelectedDate: get().tasksForSelectedDate.map((t) =>
        t.id === id ? { ...t, is_completed: !t.is_completed } : t
      ),
      allTasks: get().allTasks.map((t) =>
        t.id === id ? { ...t, is_completed: !t.is_completed } : t
      ),
    });

    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', id);

    if (error) {
      // roll back on failure
      set({
        tasksForSelectedDate: get().tasksForSelectedDate.map((t) =>
          t.id === id ? { ...t, is_completed: task.is_completed } : t
        ),
        allTasks: get().allTasks.map((t) =>
          t.id === id ? { ...t, is_completed: task.is_completed } : t
        ),
      });
    }
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    set({ 
      tasksForSelectedDate: get().tasksForSelectedDate.filter((t) => t.id !== id),
      allTasks: get().allTasks.filter((t) => t.id !== id),
    });
  },
}));
