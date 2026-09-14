import React, { useState } from 'react';
import { Plus, X, Pin, Tag } from 'lucide-react';
import { NoteCategory } from '../../types';

interface NoteInputProps {
  categories: NoteCategory[];
  onAddMemo: (payload: {
    content: string;
    category: string;
    isPinned?: boolean;
  }) => void;
  onOpenCategoryModal: () => void;
  onQuickAddCategory: (name: string) => string;
}

export const NoteInput: React.FC<NoteInputProps> = ({
  categories,
  onAddMemo,
  onOpenCategoryModal,
  onQuickAddCategory,
}) => {
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return categories.length > 0 ? categories[0].name : '일반';
  });

  // Inline quick category creation
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleSaveQuickCategory = () => {
    const trimmed = newCatName.trim();
    if (trimmed) {
      const addedName = onQuickAddCategory(trimmed);
      setSelectedCategory(addedName);
      setNewCatName('');
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddMemo({
      content: content.trim(),
      category: selectedCategory || '일반',
      isPinned,
    });

    setContent('');
    setIsPinned(false);
  };

  const canSubmit = content.trim().length > 0;

  return (
    <div className="px-4 mb-5">
      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-200">
        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5">
          {/* Category & Pin Selection */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Tag size={13} className="text-gray-400 shrink-0" />
              {!isCreatingCategory ? (
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsCreatingCategory(true);
                      } else {
                        setSelectedCategory(e.target.value);
                      }
                    }}
                    className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-800 font-medium focus:outline-none focus:border-black"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="__NEW__">+ 새 카테고리...</option>
                  </select>
                  <button
                    type="button"
                    onClick={onOpenCategoryModal}
                    className="text-[11px] text-gray-400 hover:text-gray-600 px-1.5 py-1 rounded hover:bg-gray-100 whitespace-nowrap"
                    title="카테고리 관리"
                  >
                    관리
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="새 카테고리명"
                    className="px-2 py-0.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-black w-28"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveQuickCategory();
                      } else if (e.key === 'Escape') {
                        setIsCreatingCategory(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveQuickCategory}
                    className="px-2 py-0.5 bg-black text-white rounded text-[11px] font-medium"
                  >
                    확인
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(false)}
                    className="p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Pin Toggle */}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                isPinned
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="상단 고정"
            >
              <Pin size={12} className={isPinned ? 'rotate-45 fill-amber-700' : ''} />
              <span className="text-[11px]">고정</span>
            </button>
          </div>

          {/* Memo Content Input (No title as requested: "제목은 없애줘") */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="자유롭게 메모를 적어보세요..."
            rows={4}
            className="w-full px-2 py-1 bg-transparent text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 placeholder:text-[13px] resize-none focus:outline-none"
          />

          {/* Footer Save Button */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">
              {content.trim().length > 0 ? `${content.trim().length}자` : '새 메모 작성'}
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                canSubmit
                  ? 'bg-black text-white hover:bg-gray-800 shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus size={14} />
              메모 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
