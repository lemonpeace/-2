
export interface DiaryEntry {
  id: string;
  date: string; // Format: YYYY. MM. DD
  content: string;
  images?: string[]; // Changed from single imageUrl to array
  week: number;
  createdAt: number;
}

export interface WeekOption {
  label: string;
  value: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: number;
  completedAt?: number;
}

export interface NoteCategory {
  id: string;
  name: string;
  color?: string;
}

export interface MemoNote {
  id: string;
  content: string;
  category: string;
  isPinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

// Helper to get formatted date string: YYYY. MM. DD
export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
};

// Helper to get week number
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const WEEKS: WeekOption[] = [
  { label: 'w42', value: 42 },
  { label: 'w43', value: 43 },
  { label: 'w44', value: 44 },
  { label: 'w45', value: 45 },
  { label: 'w46', value: 46 },
  { label: 'w47', value: 47 },
];

