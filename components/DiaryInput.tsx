import React, { useState, useRef } from 'react';
import { Camera, Check, X, Calendar as CalendarIcon } from 'lucide-react';

interface DiaryInputProps {
  selectedDate: string;
  onAddEntry: (content: string, images?: string[], dateStr?: string) => void;
}

const DiaryInput: React.FC<DiaryInputProps> = ({ selectedDate, onAddEntry }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files) as File[];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (!text.trim() && images.length === 0) return;

    onAddEntry(text, images.length > 0 ? images : undefined, selectedDate);

    // Reset form
    setText('');
    setImages([]);
  };

  return (
    <div className="px-4 mb-5">
      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
        {/* Selected Date Header */}
        <div className="px-3.5 pt-2.5 pb-1 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 font-medium text-gray-700">
            <CalendarIcon size={13} className="text-gray-400" />
            <span>{selectedDate} 일기</span>
          </div>
        </div>

        <textarea
          className="w-full px-3.5 py-2 bg-transparent text-gray-800 placeholder:text-gray-400 placeholder:text-[13px] resize-none focus:outline-none text-[14px] leading-relaxed"
          placeholder={`${selectedDate}의 소중한 하루를 기록해보세요...`}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {images.length > 0 && (
          <div className="px-3.5 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {images.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                <img
                  src={img}
                  alt={`Preview ${idx}`}
                  className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm border border-gray-200 hover:bg-gray-50 z-10"
                >
                  <X size={11} className="text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-white/60">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={triggerFileInput}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
              aria-label="사진 첨부"
              title="사진 추가"
            >
              <Camera size={17} strokeWidth={1.7} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() && images.length === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
              text.trim() || images.length > 0
                ? 'bg-black text-white shadow-sm hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check size={14} strokeWidth={2.5} />
            <span>등록</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiaryInput;
