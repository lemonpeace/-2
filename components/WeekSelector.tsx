
import React, { useMemo, useEffect, useRef } from 'react';
import { getWeekNumber } from '../types';

interface WeekSelectorProps {
  currentWeek: number;
  onSelectWeek: (week: number) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ currentWeek, onSelectWeek }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate weeks dynamically for the current year/context
  // Let's generate from week 1 to current week + 4 (for future planning)
  const weeks = useMemo(() => {
    const totalWeeksToShow = 52; // Show full year or dynamic
    
    return Array.from({ length: totalWeeksToShow }, (_, i) => {
      const weekNum = i + 1;
      return {
        label: `w${weekNum}`,
        value: weekNum
      };
    });
  }, []);

  // Scroll to active week on mount or update
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeBtn = scrollContainerRef.current.querySelector(`button[data-active="true"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentWeek]);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex overflow-x-auto no-scrollbar px-6 py-2 border-b border-transparent gap-9 scroll-smooth"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {weeks.map((week) => (
        <button
          key={week.value}
          data-active={currentWeek === week.value}
          onClick={() => onSelectWeek(week.value)}
          className={`text-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
            currentWeek === week.value
              ? 'font-bold text-black'
              : 'font-medium text-gray-400 hover:text-gray-600'
          }`}
        >
          {week.label}
        </button>
      ))}
      {/* Padding for right side scrolling */}
      <div className="w-2 flex-shrink-0" />
    </div>
  );
};

export default WeekSelector;
