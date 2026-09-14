
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarProps {
  onClose: () => void;
  onSelectDate: (dateStr: string, dateObj: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onClose, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = `${selected.getFullYear()}. ${String(selected.getMonth() + 1).padStart(2, '0')}. ${String(selected.getDate()).padStart(2, '0')}`;
    onSelectDate(formattedDate, selected);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[320px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 ml-2">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronRight size={20} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 ml-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = 
                day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() && 
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all
                    ${isToday 
                      ? 'bg-black text-white font-semibold shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 font-medium'}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
