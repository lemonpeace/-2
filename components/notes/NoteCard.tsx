import React, { useState } from 'react';
import { Pin, Trash2, Edit3, Check, X, Copy } from 'lucide-react';
import { MemoNote, NoteCategory } from '../../types';

interface NoteCardProps {
  note: MemoNote;
  categoryObj?: NoteCategory;
  categories: NoteCategory[];
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateContent: (id: string, newContent: string, newCategory?: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  categoryObj,
  categories,
  onTogglePin,
  onDelete,
  onUpdateContent,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editCategory, setEditCategory] = useState(note.category);
  const [copied, setCopied] = useState(false);

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    onUpdateContent(note.id, editContent.trim(), editCategory);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 p-4 relative group ${
        note.isPinned
          ? 'border-amber-200/90 shadow-sm ring-1 ring-amber-100 bg-amber-50/20'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-xs'
      }`}
    >
      {/* Top Header: Category badge & Actions */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-gray-100 flex items-center gap-1 text-gray-700 bg-gray-50"
            style={{
              borderColor: categoryObj?.color ? `${categoryObj.color}40` : undefined,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: categoryObj?.color || '#71717a' }}
            />
            {note.category}
          </span>
          {note.isPinned && (
            <span className="text-[10px] text-amber-700 font-medium bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Pin size={10} className="rotate-45 fill-amber-700" />
              고정됨
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onTogglePin(note.id)}
            className={`p-1 rounded-md transition-colors ${
              note.isPinned
                ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title={note.isPinned ? '고정 해제' : '상단 고정'}
          >
            <Pin size={13} className={note.isPinned ? 'rotate-45 fill-amber-600' : ''} />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="메모 복사"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="메모 수정"
            >
              <Edit3 size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="메모 삭제"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Memo Content (No title as instructed) */}
      {isEditing ? (
        <div className="space-y-2 mt-2">
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-800"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full text-sm p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-black resize-none text-gray-800 leading-relaxed"
            placeholder="메모 내용"
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEditContent(note.content);
                setIsEditing(false);
              }}
              className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-3 py-1 bg-black text-white text-xs font-medium rounded hover:bg-gray-800"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[14px] leading-relaxed text-gray-800 whitespace-pre-wrap break-words select-text">
          {note.content}
        </div>
      )}

      {/* Footer Date */}
      <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};
