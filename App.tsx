import React, { useState, useEffect, useMemo } from 'react';
import Header, { AppTab } from './components/Header';
import DiaryInput from './components/DiaryInput';
import DiaryEntryCard from './components/DiaryEntry';
import InlineCalendar from './components/InlineCalendar';
import ImageViewer from './components/ImageViewer';
import { NotesTab } from './components/notes/NotesTab';
import { TodoTab } from './components/todo/TodoTab';
import {
  DiaryEntry,
  getWeekNumber,
  formatDate,
  MemoNote,
  NoteCategory,
  TodoItem,
} from './types';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

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
      const saved = localStorage.getItem('note_categories') || localStorage.getItem('scratch_categories');
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

  // Sync entries from Supabase if configured
  const fetchEntries = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries from Supabase:', error);
      } else if (data && data.length > 0) {
        const mappedData: DiaryEntry[] = data.map((item: any) => ({
          id: String(item.id),
          content: item.content,
          date: item.date,
          week: item.week,
          images: item.images,
          createdAt: new Date(item.created_at).getTime(),
        }));
        setEntries(mappedData);
      }
    } catch (err) {
      console.error('Unexpected error loading from Supabase:', err);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchEntries();
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
    return entries.filter((entry) => {
      const parts = entry.date.split('.').map((p) => parseInt(p.trim(), 10));
      if (parts.length >= 2) {
        return parts[0] === viewYear && parts[1] === viewMonth + 1;
      }
      return false;
    }).sort((a, b) => b.createdAt - a.createdAt);
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
          content,
          date: entryDate,
          week: weekNum,
          images: images || [],
          created_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from('entries')
          .insert([newEntryPayload])
          .select();

        if (error) {
          console.error('Error adding entry to Supabase:', error);
        } else if (data && data.length > 0) {
          const savedEntry = data[0];
          setEntries((prev) =>
            prev.map((e) =>
              e.id === localEntry.id
                ? {
                    ...e,
                    id: String(savedEntry.id),
                    createdAt: new Date(savedEntry.created_at).getTime(),
                  }
                : e
            )
          );
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
      prev.map((entry) =>
        entry.id === id ? { ...entry, content: newContent } : entry
      )
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
  const handleAddMemo = (payload: {
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
  };

  const handleUpdateMemo = (id: string, newContent: string, newCategory?: string) => {
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
  };

  const handleDeleteMemo = (id: string) => {
    if (window.confirm('이 메모를 삭제하시겠습니까?')) {
      setNotes((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleTogglePinMemo = (id: string) => {
    setNotes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPinned: !m.isPinned } : m))
    );
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
        prev.map((n) =>
          n.category === categoryToDelete.name ? { ...n, category: '일반' } : n
        )
      );
    }
  };

  // Todo Handlers (No category needed, checked items move to completed list)
  const handleAddTodo = (text: string) => {
    const newTodo: TodoItem = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? Date.now() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTodoText = (id: string, text: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t))
    );
  };

  const handleClearCompletedTodos = () => {
    if (window.confirm('완료된 투두 리스트를 모두 삭제하시겠습니까?')) {
      setTodos((prev) => prev.filter((t) => !t.completed));
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto shadow-2xl relative border-x border-gray-50 flex flex-col font-sans">
      {/* App Header with centered title and without left/right icons or dots */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

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
              <DiaryInput
                selectedDate={selectedDate}
                onAddEntry={handleAddEntry}
              />

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
        ) : (
          /* Standalone Todo Tab (카테고리 없음, 체크 시 완료 목록으로 분리) */
          <TodoTab
            todos={todos}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onUpdateTodoText={handleUpdateTodoText}
            onClearCompleted={handleClearCompletedTodos}
          />
        )}
      </div>

      {/* Image Viewer Lightbox */}
      {viewingImages && (
        <ImageViewer
          images={viewingImages}
          onClose={() => setViewingImages(null)}
        />
      )}
    </div>
  );
};

export default App;
