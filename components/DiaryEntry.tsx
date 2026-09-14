
import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { DiaryEntry as DiaryEntryType } from '../types';

interface DiaryEntryProps {
  entry: DiaryEntryType;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
  onImageClick: (images: string[]) => void;
}

const DiaryEntry: React.FC<DiaryEntryProps> = ({ entry, onDelete, onUpdate, onImageClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(entry.id, editContent);
      setIsEditing(false);
    }
  };

  // Use character count as a heuristic for showing the "more" button
  const shouldShowMore = entry.content.length > 100;
  const hasImages = entry.images && entry.images.length > 0;

  if (isEditing) {
    return (
      <div className="mb-8 px-6 animate-in fade-in">
        <div className="bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <textarea 
            className="w-full p-3 bg-transparent focus:outline-none resize-none text-[15px] leading-snug text-gray-700"
            rows={5}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Edit your story..."
          />
          <div className="flex justify-end gap-2 px-2 pb-2 pt-1 border-t border-gray-100">
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditContent(entry.content);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              <X size={16} />
            </button>
            <button 
              onClick={handleSave}
              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 px-6 group relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-xs font-medium text-gray-400">
          {entry.date}
        </div>
        
        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => setIsEditing(true)}
            className="text-gray-300 hover:text-gray-600 transition-colors"
            aria-label="Edit"
          >
            <Pencil size={13} />
          </button>
          <button 
            onClick={() => onDelete(entry.id)}
            className="text-gray-300 hover:text-red-400 transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p 
            className={`text-gray-600 leading-snug text-[15px] font-light text-justify ${!isExpanded ? 'line-clamp-3' : ''}`}
          >
            {entry.content}
          </p>
          {shouldShowMore && !isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-gray-400 hover:text-gray-600 text-[11px] font-medium mt-0.5 inline-block"
            >
              ...more
            </button>
          )}
        </div>
        
        {hasImages && (
          <div 
            className="relative flex-shrink-0 w-[72px] h-[72px] cursor-zoom-in rounded-lg overflow-hidden border border-gray-100 bg-gray-50 group/image"
            onClick={() => onImageClick(entry.images!)}
          >
            <img 
              src={entry.images![0]} 
              alt="Diary attachment" 
              className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {entry.images!.length > 1 && (
              <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-[2px] px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium text-white/90 flex items-center justify-center min-w-[18px]">
                {entry.images!.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryEntry;
