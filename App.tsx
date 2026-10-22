import React, { useState, useEffect, useMemo } from 'react';
import Header, { AppTab } from './components/Header';
import DiaryInput from './components/DiaryInput';
import DiaryEntryCard from './components/DiaryEntry';
import InlineCalendar from './components/InlineCalendar';
import ImageViewer from './components/ImageViewer';
import { NotesTab } from './components/notes/NotesTab';
import { TodoTab } from './components/todo/TodoTab';
import { SettingsTab } from './components/settings/SettingsTab';
import {
  DiaryEntry,
  getWeekNumber,
  formatDate,
  MemoNote,
  NoteCategory,
  TodoItem,
} from './types';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import {
  ReminderConfig,
  getReminderConfig,
  saveReminderConfig,
  triggerDiaryNotification,
} from './services/reminderService';

// Default categories for Notes (메모)
const DEFAULT_CATEGORIES: NoteCategory[] = [
  { id: 'cat_general', name: '일반', color: '#1e293b' },
  { id: 'cat_idea', name: '아이디어', color: '#7c3aed' },
  { id: 'cat_favorite', name: '관심사', color: '#059669' },
  { id: 'cat_shopping', name: '장보기', color: '#d97706' },
];

// Initial starter memo notes (No title, pure memo)
const DEFAULT_MEMOS: MemoNote[] = [
  {
    id: 'memo_1',
    content: '달력 위에 일기 쓴 날들이 노란색 점으로 콕콕 찍혀 한눈에 보이니 뿌듯하다. 매일의 작은 순간들을 잊지 않고 적어둬야지.',
    category: '일반',
    isPinned: true,
    createdAt: Date.now() - 3600000 * 3,
    updatedAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'memo_2',
    content: '주말에 찾아갈 분위기 좋은 북카페 리스트 & 읽을 책 정리해두기',
    category: '아이디어',
    isPinned: false,
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 24,
  },
];

// Initial starter todos (No categories needed)
const DEFAULT_TODOS: TodoItem[] = [
  { id: 'td_1', text: '오늘의 한 줄 일기 남기기', completed: false, createdAt: Date.now() },
  { id: 'td_2', text: '산책하고 따뜻한 차 마시기', completed: false, createdAt: Date.now() },
  { id: 'td_3', text: '달력에서 작성된 일기 확인하기', completed: true, createdAt: Date.now(), completedAt: Date.now() },
];

// Initial starter diary entries with August and September entries for instant calendar sync test
const getInitialEntries = (): DiaryEntry[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const augustDate = new Date(today.getFullYear(), 7, 24); // August 24

  return [
    {
      id: 'entry_today',
      content: '맑은 하늘을 보며 산책했던 날. 달력에 노란색 점으로 일기 쓴 날이 표시되니 다이어리가 한결 따뜻하고 예뻐 보인다.',
      date: formatDate(today),
      week: getWeekNumber(today),
      createdAt: today.getTime(),
    },
    {
      id: 'entry_yesterday',
      content: '조용한 카페에서 좋아하는 음악을 들으며 생각을 정리했다. 소소하지만 행복했던 하루.',
      date: formatDate(yesterday),
      week: getWeekNumber(yesterday),
      createdAt: yesterday.getTime() - 86400000,
    },
    {
      id: 'entry_august',
      content: '늦여름의 시원한 바람이 불어오던 날. 계절의 변화를 느끼며 산뜻하게 하루를 마무리했다.',
      date: formatDate(augustDate),
      week: getWeekNumber(augustDate),
      createdAt: augustDate.getTime(),
    },
  ];
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('diary');

  // Diary State
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('diary_entries');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return getInitialEntries();
  });

  // Calendar view year and month (0-indexed: 7 = Aug, 8 = Sep)
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth());

  // Current selected date for DiaryInput and day filtering
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDate(new Date()));
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  const [viewingImages, setViewingImages] = useState<string[] | null>(null);

  // Notes state (pure memos without titles)
  const [notes, setNotes] = useState<MemoNote[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('memo_notes');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
      const oldScratch = localStorage.getItem('scratch_notes');
      if (oldScratch) {
        try {
          const parsed = JSON.parse(oldScratch);
          const textOnly: MemoNote[] = parsed
            .filter((p: any) => p.type === 'text' || p.content)
            .map((p: any) => ({
              id: p.id,
              content: p.content || p.title || '',
              category: p.category || '일반',
              isPinned: !!p.isPinned,
              createdAt: p.createdAt || Date.now(),
              updatedAt: p.updatedAt || Date.now(),
            }));
          if (textOnly.length > 0) return textOnly;
        } catch {}
      }
    }
    return DEFAULT_MEMOS;
  });

  // Note categories
  const [categories, setCategories] = useState<NoteCategory[]>(() => {
    if (typeof window !== 'undefined') {
      const saved =
        localStorage.getItem('note_categories') || localStorage.getItem('scratch_categories');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_CATEGORIES;
  });

  // Standalone Todos (no categories needed)
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('todo_items');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_TODOS;
  });

  // Daily Reminder Alarm config
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(() => getReminderConfig());

  const handleUpdateReminderConfig = (config: ReminderConfig) => {
    setReminderConfig(config);
    saveReminderConfig(config);
  };

  // Daily Reminder Scheduler: checks time and triggers notification once per day
  useEffect(() => {
    if (!reminderConfig.enabled) return;

    const checkAlarm = () => {
      const now = new Date();
      const [targetH, targetM] = reminderConfig.time.split(':').map((n) => parseInt(n, 10));
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;

      if (
        currentH === targetH &&
        currentM === targetM &&
        reminderConfig.lastNotifiedDate !== todayStr
      ) {
        triggerDiaryNotification(
          "SunJu's story 🌙",
          '오늘 하루는 어떠셨나요? 소중한 순간을 일기로 기록해보세요.',
          reminderConfig.soundEnabled
        );

        const updated = { ...reminderConfig, lastNotifiedDate: todayStr };
        setReminderConfig(updated);
        saveReminderConfig(updated);
      }
    };

    checkAlarm();
    const interval = setInterval(checkAlarm, 25000);
    return () => clearInterval(interval);
  }, [reminderConfig]);

  // Save diary entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('diary_entries', JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save entries to localStorage', e);
    }
  }, [entries]);

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('memo_notes', JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes to localStorage', e);
    }
  }, [notes]);

  // Save categories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('note_categories', JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage', e);
    }
  }, [categories]);

  // Save todos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('todo_items', JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos to localStorage', e);
    }
  }, [todos]);

  // Sync entries, notes, todos from Supabase if configured
  const fetchAllCloudData = async () => {
    if (!supabase) return;

    try {
      // 1. Fetch entries
      const { data: entryData, error: entryErr } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!entryErr && entryData && entryData.length > 0) {
        const mappedData: DiaryEntry[] = entryData.map((item: any) => ({
          id: String(item.id),
          content: item.content,
          date: item.date,
          week: item.week,
          images: item.images || [],
          createdAt: new Date(item.created_at).getTime(),
        }));
        setEntries(mappedData);

        // Auto-focus calendar view to the most recent entry's month and date
        if (mappedData[0]) {
          const parts = mappedData[0].date.split('.').map((p) => parseInt(p.trim(), 10));
          if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            setViewYear(parts[0]);
            setViewMonth(parts[1] - 1);
            setSelectedDate(mappedData[0].date);
          }
        }
      }

      // 2. Fetch notes
      const { data: noteData, error: noteErr } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!noteErr && noteData && noteData.length > 0) {
        const mappedNotes: MemoNote[] = noteData.map((item: any) => ({
          id: String(item.id),
          content: item.content,
          category: item.category || '일반',
          isPinned: !!item.is_pinned,
          createdAt: new Date(item.created_at).getTime(),
          updatedAt: item.updated_at
            ? new Date(item.updated_at).getTime()
            : new Date(item.created_at).getTime(),
        }));
        setNotes(mappedNotes);
      }

      // 3. Fetch todos
      const { data: todoData, error: todoErr } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!todoErr && todoData && todoData.length > 0) {
        const mappedTodos: TodoItem[] = todoData.map((item: any) => ({
          id: String(item.id),
          text: item.text,
          completed: !!item.completed,
          createdAt: new Date(item.created_at).getTime(),
          completedAt: item.completed_at ? new Date(item.completed_at).getTime() : undefined,
        }));
        setTodos(mappedTodos);
      }
    } catch (err) {
      console.error('Unexpected error loading from Supabase:', err);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchAllCloudData();
    }
  }, []);

  // Compute set of dates that have entries for calendar yellow dot
  const entryDates = useMemo(() => {
    return new Set(entries.map((e) => e.date));
  }, [entries]);

  // Month navigation callback
  const handleMonthChange = (year: number, month: number) => {
    setViewYear(year);
    setViewMonth(month);
    setSelectedDayFilter(null); // Clear day filter to show the whole month's entries!

    const today = new Date();
    if (year === today.getFullYear() && month === today.getMonth()) {
      setSelectedDate(formatDate(today));
    } else {
      setSelectedDate(formatDate(new Date(year, month, 1)));
    }
  };

  // Calendar date click callback
  const handleSelectDate = (dateStr: string, dateObj: Date) => {
    setSelectedDate(dateStr);
    if (dateObj.getFullYear() !== viewYear || dateObj.getMonth() !== viewMonth) {
      setViewYear(dateObj.getFullYear());
      setViewMonth(dateObj.getMonth());
    }
    setSelectedDayFilter(dateStr);
  };

  // Synchronized Month Entries: Only entries belonging to viewYear and viewMonth
  const monthEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const parts = entry.date.split('.').map((p) => parseInt(p.trim(), 10));
        if (parts.length >= 2) {
          return parts[0] === viewYear && parts[1] === viewMonth + 1;
        }
        return false;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, viewYear, viewMonth]);

  // Filtered entries displayed in the list:
  // If user clicked a specific date, show that date; otherwise show all entries of the viewed month!
  const displayedEntries = useMemo(() => {
    if (selectedDayFilter) {
      return monthEntries.filter((entry) => entry.date === selectedDayFilter);
    }
    return monthEntries;
  }, [monthEntries, selectedDayFilter]);

  // Add Diary Entry
  const handleAddEntry = async (content: string, images?: string[], dateStr?: string) => {
    const entryDate = dateStr || selectedDate || formatDate(new Date());

    // Parse week number from entryDate
    const dateParts = entryDate.split('.').map((p) => parseInt(p.trim(), 10));
    const targetDateObj =
      dateParts.length === 3 ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2]) : new Date();
    const weekNum = getWeekNumber(targetDateObj);

    // Keep viewed month aligned with the written entry date
    if (targetDateObj.getFullYear() !== viewYear || targetDateObj.getMonth() !== viewMonth) {
      setViewYear(targetDateObj.getFullYear());
      setViewMonth(targetDateObj.getMonth());
    }

    const localEntry: DiaryEntry = {
      id: `entry_${Date.now()}`,
      content,
      date: entryDate,
      week: weekNum,
      images: images || [],
      createdAt: Date.now(),
    };

    setEntries((prev) => [localEntry, ...prev]);

    if (supabase) {
      try {
        const newEntryPayload = {
          id: localEntry.id,
          content,
          date: entryDate,
          week: weekNum,
          images: images || [],
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('entries').insert([newEntryPayload]);
        if (error) {
          console.error('Error adding entry to Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to sync to Supabase:', err);
      }
    }
  };

  // Delete Diary Entry
  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('이 일기를 삭제하시겠습니까?')) {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));

      if (supabase) {
        try {
          const { error } = await supabase.from('entries').delete().eq('id', id);
          if (error) {
            console.error('Error deleting entry from Supabase:', error);
          }
        } catch (err) {
          console.error('Failed to delete on Supabase:', err);
        }
      }
    }
  };

  // Update Diary Entry
  const handleUpdateEntry = async (id: string, newContent: string) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, content: newContent } : entry))
    );

    if (supabase) {
      try {
        const { error } = await supabase
          .from('entries')
          .update({ content: newContent })
          .eq('id', id);
        if (error) {
          console.error('Error updating entry on Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to update on Supabase:', err);
      }
    }
  };

  // Notes (메모) Handlers
  const handleAddMemo = async (payload: {
    content: string;
    category: string;
    isPinned?: boolean;
  }) => {
    const newMemo: MemoNote = {
      id: `memo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      content: payload.content,
      category: payload.category || '일반',
      isPinned: !!payload.isPinned,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newMemo, ...prev]);

    if (supabase) {
      try {
        await supabase.from('notes').insert([
          {
            id: newMemo.id,
            content: newMemo.content,
            category: newMemo.category,
            is_pinned: newMemo.isPinned,
            created_at: new Date(newMemo.createdAt).toISOString(),
            updated_at: new Date(newMemo.updatedAt).toISOString(),
          },
        ]);
      } catch (e) {
        console.error('Error syncing note to Supabase', e);
      }
    }
  };

  const handleUpdateMemo = async (id: string, newContent: string, newCategory?: string) => {
    setNotes((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              content: newContent,
              category: newCategory !== undefined ? newCategory : m.category,
              updatedAt: Date.now(),
            }
          : m
      )
    );

    if (supabase) {
      try {
        await supabase
          .from('notes')
          .update({
            content: newContent,
            category: newCategory,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (e) {
        console.error('Error updating note on Supabase', e);
      }
    }
  };

  const handleDeleteMemo = async (id: string) => {
    if (window.confirm('이 메모를 삭제하시겠습니까?')) {
      setNotes((prev) => prev.filter((m) => m.id !== id));
      if (supabase) {
        try {
          await supabase.from('notes').delete().eq('id', id);
        } catch (e) {
          console.error('Error deleting note from Supabase', e);
        }
      }
    }
  };

  const handleTogglePinMemo = async (id: string) => {
    const target = notes.find((m) => m.id === id);
    const nextPin = target ? !target.isPinned : false;

    setNotes((prev) => prev.map((m) => (m.id === id ? { ...m, isPinned: nextPin } : m)));

    if (supabase) {
      try {
        await supabase.from('notes').update({ is_pinned: nextPin }).eq('id', id);
      } catch (e) {
        console.error('Error toggling pin on Supabase', e);
      }
    }
  };

  const handleAddCategory = (name: string, color: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return;

    const newCategory: NoteCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      color: color || '#1e293b',
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleDeleteCategory = (id: string) => {
    const categoryToDelete = categories.find((c) => c.id === id);
    if (!categoryToDelete) return;

    if (
      window.confirm(
        `'${categoryToDelete.name}' 카테고리를 삭제하시겠습니까? 해당 카테고리의 메모는 '일반'으로 변경됩니다.`
      )
    ) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setNotes((prev) =>
        prev.map((n) => (n.category === categoryToDelete.name ? { ...n, category: '일반' } : n))
      );
    }
  };

  // Todo Handlers (No category needed, checked items move to completed list)
  const handleAddTodo = async (text: string) => {
    const newTodo: TodoItem = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);

    if (supabase) {
      try {
        await supabase.from('todos').insert([
          {
            id: newTodo.id,
            text: newTodo.text,
            completed: false,
            created_at: new Date(newTodo.createdAt || Date.now()).toISOString(),
          },
        ]);
      } catch (e) {
        console.error('Error inserting todo to Supabase', e);
      }
    }
  };

  const handleToggleTodo = async (id: string) => {
    const target = todos.find((t) => t.id === id);
    const nextCompleted = target ? !target.completed : false;
    const completedAt = nextCompleted ? Date.now() : undefined;

    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            completed: nextCompleted,
            completedAt,
          };
        }
        return t;
      })
    );

    if (supabase) {
      try {
        await supabase
          .from('todos')
          .update({
            completed: nextCompleted,
            completed_at: completedAt ? new Date(completedAt).toISOString() : null,
          })
          .eq('id', id);
      } catch (e) {
        console.error('Error toggling todo on Supabase', e);
      }
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    if (supabase) {
      try {
        await supabase.from('todos').delete().eq('id', id);
      } catch (e) {
        console.error('Error deleting todo on Supabase', e);
      }
    }
  };

  const handleUpdateTodoText = async (id: string, text: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
    if (supabase) {
      try {
        await supabase.from('todos').update({ text }).eq('id', id);
      } catch (e) {
        console.error('Error updating todo on Supabase', e);
      }
    }
  };

  const handleClearCompletedTodos = async () => {
    if (window.confirm('완료된 투두 리스트를 모두 삭제하시겠습니까?')) {
      setTodos((prev) => prev.filter((t) => !t.completed));
      if (supabase) {
        try {
          await supabase.from('todos').delete().eq('completed', true);
        } catch (e) {
          console.error('Error clearing completed todos on Supabase', e);
        }
      }
    }
  };

  // Sync all current data to Supabase
  const handleSyncAllToCloud = async (): Promise<{ success: boolean; message: string }> => {
    if (!supabase) {
      return { success: false, message: 'Supabase가 아직 연결되지 않았습니다.' };
    }

    try {
      let eCount = 0;
      let nCount = 0;
      let tCount = 0;

      // 1. Sync entries
      if (entries.length > 0) {
        const entryRows = entries.map((e) => ({
          id: e.id,
          content: e.content,
          date: e.date,
          week: e.week,
          images: e.images || [],
          created_at: new Date(e.createdAt).toISOString(),
        }));
        const { error: eErr } = await supabase.from('entries').upsert(entryRows);
        if (eErr) throw eErr;
        eCount = entryRows.length;
      }

      // 2. Sync notes
      if (notes.length > 0) {
        const noteRows = notes.map((n) => ({
          id: n.id,
          content: n.content,
          category: n.category,
          is_pinned: n.isPinned,
          created_at: new Date(n.createdAt).toISOString(),
          updated_at: new Date(n.updatedAt).toISOString(),
        }));
        const { error: nErr } = await supabase.from('notes').upsert(noteRows);
        if (nErr) throw nErr;
        nCount = noteRows.length;
      }

      // 3. Sync todos
      if (todos.length > 0) {
        const todoRows = todos.map((t) => ({
          id: t.id,
          text: t.text,
          completed: t.completed,
          created_at: new Date(t.createdAt || Date.now()).toISOString(),
          completed_at: t.completedAt ? new Date(t.completedAt).toISOString() : null,
        }));
        const { error: tErr } = await supabase.from('todos').upsert(todoRows);
        if (tErr) throw tErr;
        tCount = todoRows.length;
      }

      return {
        success: true,
        message: `동기화 완료! 일기 ${eCount}개, 메모 ${nCount}개, 투두 ${tCount}개가 클라우드에 안전하게 저장되었습니다.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `동기화 실패: ${err?.message || '테이블 생성 여부나 RLS 정책을 확인해주세요.'}`,
      };
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto shadow-2xl relative border-x border-gray-50 flex flex-col font-sans">
      {/* App Header with centered title and without left/right icons or dots */}
      <Header activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* Main Content Area based on Active Tab */}
      <div className="flex-1">
        {activeTab === 'diary' ? (
          <div>
            {/* Inline Calendar with yellow dots and month synchronization */}
            <InlineCalendar
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              entryDates={entryDates}
              viewYear={viewYear}
              viewMonth={viewMonth}
              onMonthChange={handleMonthChange}
            />

            <main className="pt-3 pb-24">
              {/* Diary Input Box matched to selected date */}
              <DiaryInput selectedDate={selectedDate} onAddEntry={handleAddEntry} />

              {/* Matched Entries List Header synced with Calendar */}
              <div className="px-5 mb-2.5 flex items-center justify-between text-xs text-gray-500">
                {selectedDayFilter ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {selectedDayFilter} 기록 ({displayedEntries.length}개)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDayFilter(null)}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      {viewMonth + 1}월 전체 보기 ({monthEntries.length}개)
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {viewYear}년 {viewMonth + 1}월 일기 ({monthEntries.length}개)
                    </span>
                  </div>
                )}

                {selectedDate !== formatDate(new Date()) && (
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setViewYear(today.getFullYear());
                      setViewMonth(today.getMonth());
                      setSelectedDate(formatDate(today));
                      setSelectedDayFilter(null);
                    }}
                    className="text-gray-400 hover:text-black transition-colors"
                  >
                    오늘 날짜로 가기
                  </button>
                )}
              </div>

              {/* Entries matching the calendar month or selected day */}
              <div className="flex flex-col gap-2">
                {displayedEntries.length > 0 ? (
                  displayedEntries.map((entry) => (
                    <DiaryEntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDeleteEntry}
                      onUpdate={handleUpdateEntry}
                      onImageClick={(images) => setViewingImages(images)}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400 font-light px-6">
                    {selectedDayFilter ? (
                      <div>
                        <p className="text-sm text-gray-500">
                          {selectedDayFilter}에 작성된 일기가 없습니다.
                        </p>
                        {monthEntries.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedDayFilter(null)}
                            className="mt-2 text-xs font-semibold text-black underline"
                          >
                            {viewMonth + 1}월 전체 일기 보기 ({monthEntries.length}개)
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-500">
                          {viewYear}년 {viewMonth + 1}월에 작성된 일기가 없습니다.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          달력에서 날짜를 선택하거나 상단에서 일기를 기록해보세요.
                        </p>
                        {entries.length > 0 && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                const latest = entries[0];
                                const parts = latest.date.split('.').map((p) => parseInt(p.trim(), 10));
                                if (parts.length >= 2) {
                                  setViewYear(parts[0]);
                                  setViewMonth(parts[1] - 1);
                                  setSelectedDate(latest.date);
                                  setSelectedDayFilter(null);
                                }
                              }}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>최근 작성된 일기({entries[0].date}) 보러가기</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </main>
          </div>
        ) : activeTab === 'notes' ? (
          /* Notes Tab (메모만 보이고 제목은 없음, 카테고리 실시간 관리) */
          <NotesTab
            notes={notes}
            categories={categories}
            onAddMemo={handleAddMemo}
            onUpdateMemo={handleUpdateMemo}
            onDeleteMemo={handleDeleteMemo}
            onTogglePinMemo={handleTogglePinMemo}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        ) : activeTab === 'todo' ? (
          /* Standalone Todo Tab (카테고리 없음, 체크 시 완료 목록으로 분리) */
          <TodoTab
            todos={todos}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onUpdateTodoText={handleUpdateTodoText}
            onClearCompleted={handleClearCompletedTodos}
          />
        ) : (
          /* Settings Tab: Supabase Connection, Daily Reminder Alarm, Backups */
          <SettingsTab
            reminderConfig={reminderConfig}
            onUpdateReminderConfig={handleUpdateReminderConfig}
            onSyncAllToCloud={handleSyncAllToCloud}
            entriesCount={entries.length}
            memosCount={notes.length}
            todosCount={todos.length}
          />
        )}
      </div>

      {/* Image Viewer Lightbox */}
      {viewingImages && (
        <ImageViewer images={viewingImages} onClose={() => setViewingImages(null)} />
      )}
    </div>
  );
};

export default App;
