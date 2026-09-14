import React, { useState, useMemo } from 'react';
import { Search, FolderPlus } from 'lucide-react';
import { MemoNote, NoteCategory } from '../../types';
import { NoteInput } from './NoteInput';
import { NoteCard } from './NoteCard';
import { CategoryModal } from './CategoryModal';

interface NotesTabProps {
  notes: MemoNote[];
  categories: NoteCategory[];
  onAddMemo: (payload: {
    content: string;
    category: string;
    isPinned?: boolean;
  }) => void;
  onUpdateMemo: (id: string, newContent: string, newCategory?: string) => void;
  onDeleteMemo: (id: string) => void;
  onTogglePinMemo: (id: string) => void;
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  categories,
  onAddMemo,
  onUpdateMemo,
  onDeleteMemo,
  onTogglePinMemo,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Quick add category helper
  const handleQuickAddCategory = (name: string): string => {
    const existing = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      return existing.name;
    }
    const colors = ['#059669', '#0284c7', '#7c3aed', '#d97706', '#e11d48', '#4f46e5'];
    const randomColor = colors[categories.length % colors.length];
    onAddCategory(name, randomColor);
    return name;
  };

  // Filtered and sorted notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Category match
        if (selectedCategory !== 'all' && note.category !== selectedCategory) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const contentMatch = note.content.toLowerCase().includes(q);
          const catMatch = note.category.toLowerCase().includes(q);
          return contentMatch || catMatch;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned notes first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then newest first
        return b.createdAt - a.createdAt;
      });
  }, [notes, selectedCategory, searchQuery]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    notes.forEach((n) => {
      map[n.category] = (map[n.category] || 0) + 1;
    });
    return map;
  }, [notes]);

  const categoryMap = useMemo(() => {
    const map: Record<string, NoteCategory> = {};
    categories.forEach((c) => {
      map[c.name] = c;
    });
    return map;
  }, [categories]);

  return (
    <div className="pt-2 pb-24 max-w-lg mx-auto">
      {/* Category Pills Bar */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-black text-white shadow-sm font-semibold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>전체</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {notes.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = categoryCounts[cat.name] || 0;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-black text-white shadow-sm font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#333' }}
                />
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Add Category Button */}
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-2.5 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-black border border-dashed border-gray-300 hover:border-black whitespace-nowrap flex items-center gap-1 transition-colors"
            title="새 카테고리 추가"
          >
            <FolderPlus size={13} />
            <span>+ 카테고리</span>
          </button>
        </div>
      </div>

      {/* Note Creation Card (pure memo without title) */}
      <NoteInput
        categories={categories}
        onAddMemo={onAddMemo}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onQuickAddCategory={handleQuickAddCategory}
      />

      {/* Search Bar */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="메모 검색..."
            className="w-full pl-8 pr-12 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black border border-transparent focus:border-black transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px]"
            >
              지우기
            </button>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div className="px-4">
        {filteredNotes.length > 0 ? (
          <div className="space-y-2.5">
            {filteredNotes.map((note) => {
              const cat = categoryMap[note.category];
              return (
                <NoteCard
                  key={note.id}
                  note={note}
                  categoryObj={cat}
                  categories={categories}
                  onTogglePin={onTogglePinMemo}
                  onDelete={onDeleteMemo}
                  onUpdateContent={onUpdateMemo}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 mt-2">
            <p className="text-gray-500 text-xs font-medium">
              {searchQuery
                ? '검색 결과와 일치하는 메모가 없습니다.'
                : selectedCategory !== 'all'
                ? `'${selectedCategory}' 카테고리에 작성된 메모가 없습니다.`
                : '작성된 메모가 없습니다. 첫 메모를 남겨보세요!'}
            </p>
          </div>
        )}
      </div>

      {/* Category Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        existingCategories={categories}
        onAddCategory={onAddCategory}
        onDeleteCategory={onDeleteCategory}
      />
    </div>
  );
};
