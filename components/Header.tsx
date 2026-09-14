import React from 'react';
import { BookOpen, FileText, CheckSquare } from 'lucide-react';

export type AppTab = 'diary' | 'notes' | 'todo';

interface HeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  return (
    <header className="bg-white sticky top-0 z-20 border-b border-gray-100">
      {/* Top Brand Bar - Clean and centered without left/right icons or dots */}
      <div className="flex items-center justify-center px-6 pt-5 pb-3">
        <h1 className="text-xl tracking-tight font-sans text-center text-black">
          <span className="font-bold">SunJu's</span> story
        </h1>
      </div>

      {/* Tabs Switcher: 일기 | 노트 | 투두 */}
      <div className="px-5 pb-3">
        <div className="bg-gray-100/90 p-1 rounded-full flex gap-1 shadow-inner">
          <button
            onClick={() => onSelectTab('diary')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              activeTab === 'diary'
                ? 'bg-white text-black shadow-sm font-bold scale-[1.01]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <BookOpen size={13} />
            <span>일기</span>
          </button>
          <button
            onClick={() => onSelectTab('notes')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              activeTab === 'notes'
                ? 'bg-white text-black shadow-sm font-bold scale-[1.01]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText size={13} />
            <span>노트</span>
          </button>
          <button
            onClick={() => onSelectTab('todo')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              activeTab === 'todo'
                ? 'bg-white text-black shadow-sm font-bold scale-[1.01]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <CheckSquare size={13} />
            <span>투두</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
