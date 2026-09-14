import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '../types';

interface InlineCalendarProps {
  selectedDate: string; // Current selected date (YYYY. MM. DD)
  onSelectDate: (dateStr: string, dateObj: Date) => void;
  entryDates: Set<string>;
  viewYear: number;
  viewMonth: number; // 0-indexed (0 = Jan, 7 = Aug, 8 = Sep)
  onMonthChange: (year: number, month: number) => void;
}

const InlineCalendar: React.FC<InlineCalendarProps> = ({
  selectedDate,
  onSelectDate,
  entryDates,
  viewYear,
  viewMonth,
  onMonthChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    let newYear = viewYear;
    let newMonth = viewMonth - 1;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    onMonthChange(newYear, newMonth);
  };

  const nextMonth = () => {
    let newYear = viewYear;
    let newMonth = viewMonth + 1;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    onMonthChange(newYear, newMonth);
  };

  const goToToday = () => {
    const today = new Date();
    onMonthChange(today.getFullYear(), today.getMonth());
    const formatted = formatDate(today);
    onSelectDate(formatted, today);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(viewYear, viewMonth, day);
    const formatted = formatDate(clickedDate);
    onSelectDate(formatted, clickedDate);
  };

  const todayStr = formatDate(new Date());

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ];

  const weekDayLabels = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white border-b border-gray-100 px-4 pt-1 pb-3 select-none">
      {/* Calendar Top Header */}
      <div className="flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-900 tracking-tight font-sans">
            {viewYear}년 {monthNames[viewMonth]}
          </span>
          <button
            onClick={goToToday}
            className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center gap-1"
            title="오늘 날짜로 이동"
          >
            <RotateCcw size={10} />
            오늘
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors ml-1"
            aria-label={isCollapsed ? '달력 펼치기' : '달력 접기'}
            title={isCollapsed ? '달력 펼치기' : '달력 접기'}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="transition-all duration-300 ease-in-out pt-1">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1 text-center">
            {weekDayLabels.map((day, idx) => (
              <span
                key={day}
                className={`text-[11px] font-medium py-1 ${
                  idx === 0 ? 'text-rose-500/80' : idx === 6 ? 'text-sky-500/80' : 'text-gray-400'
                }`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-full" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(viewYear, viewMonth, day);
              const dateStr = formatDate(dateObj);
              const isToday = dateStr === todayStr;
              const isSelected = selectedDate === dateStr;
              const hasEntry = entryDates.has(dateStr);
              const dayOfWeek = dateObj.getDay();

              // Clean button styling: No black fill for written days! Yellow dot used instead.
              let buttonStyle = 'text-gray-700 hover:bg-gray-100 font-normal';

              if (isSelected) {
                // High-contrast active selection
                buttonStyle = 'bg-black text-white font-bold shadow-sm ring-2 ring-offset-1 ring-black scale-105';
              } else if (isToday) {
                // Today indicator
                buttonStyle = 'border border-gray-400 text-black font-semibold hover:bg-gray-100';
              } else {
                // Weekend styling
                if (dayOfWeek === 0) buttonStyle = 'text-rose-600 hover:bg-rose-50';
                if (dayOfWeek === 6) buttonStyle = 'text-sky-600 hover:bg-sky-50';
              }

              return (
                <div key={day} className="flex flex-col items-center justify-center relative">
                  <button
                    onClick={() => handleDateClick(day)}
                    className={`h-8 w-8 rounded-full flex flex-col items-center justify-center text-xs transition-all duration-150 relative ${buttonStyle}`}
                    title={
                      hasEntry
                        ? `${dateStr} (일기 작성됨)`
                        : isToday
                        ? `${dateStr} (오늘)`
                        : dateStr
                    }
                  >
                    <span className={hasEntry ? '-mt-1' : ''}>{day}</span>
                    {/* Yellow dot indicating diary entry as requested */}
                    {hasEntry && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                          isSelected
                            ? 'bg-amber-300 ring-1 ring-black/20'
                            : 'bg-amber-400 ring-1 ring-amber-500/30'
                        }`}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineCalendar;
