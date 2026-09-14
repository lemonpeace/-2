import React, { useState } from 'react';
import { X, Check, Palette } from 'lucide-react';
import { NoteCategory } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string, color: string) => void;
  existingCategories: NoteCategory[];
  onDeleteCategory?: (id: string) => void;
}

const PRESET_COLORS = [
  '#1e293b', // Slate / Neutral black
  '#4f46e5', // Indigo
  '#0284c7', // Sky
  '#059669', // Emerald
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed', // Purple
  '#ea580c', // Orange
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  existingCategories,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('카테고리 이름을 입력해주세요.');
      return;
    }

    if (existingCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('이미 존재하는 카테고리입니다.');
      return;
    }

    onAddCategory(trimmed, selectedColor);
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">카테고리 관리</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* New Category Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs font-semibold text-gray-500">
              새 카테고리 추가
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="예: 아이디어, 장보기, 업무, 개인..."
                maxLength={20}
                className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-black transition-colors"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center shrink-0"
              >
                추가
              </button>
            </div>
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

            {/* Color Palette */}
            <div>
              <span className="block text-[11px] text-gray-400 mb-1.5 flex items-center gap-1">
                <Palette size={12} />
                색상 라벨 선택
              </span>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {selectedColor === color && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Existing Categories List */}
          <div className="pt-3 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              현재 카테고리 ({existingCategories.length})
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
              {existingCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs text-gray-700"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || '#1e293b' }}
                  />
                  <span>{cat.name}</span>
                  {onDeleteCategory && cat.name !== '일반' && (
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat.id)}
                      className="ml-1 text-gray-400 hover:text-rose-500 transition-colors"
                      title="카테고리 삭제"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
