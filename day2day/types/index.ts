export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string; // 'YYYY-MM-DD'
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

export type NewTaskInput = {
  title: string;
  description?: string;
  target_date: string;
};

export type NewNoteInput = {
  title: string;
  content?: string;
};

// react-native-calendars marked-dates shape
export type MarkedDates = Record<
  string,
  { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }
>;
