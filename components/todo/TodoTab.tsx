import React, { useState } from 'react';
import { Plus, Check, Trash2, Edit3, X, RotateCcw, CheckCircle2, Circle } from 'lucide-react';
import { TodoItem } from '../../types';

interface TodoTabProps {
  todos: TodoItem[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodoText: (id: string, text: string) => void;
  onClearCompleted: () => void;
}

export const TodoTab: React.FC<TodoTabProps> = ({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onUpdateTodoText,
  onClearCompleted,
}) => {
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddTodo(inputText.trim());
    setInputText('');
  };

  const handleStartEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    onUpdateTodoText(id, editText.trim());
    setEditingId(null);
  };

  return (
    <div className="pt-3 pb-24 px-4 max-w-lg mx-auto">
      {/* Todo Add Input */}
      <form onSubmit={handleAdd} className="mb-5">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 focus-within:border-black focus-within:bg-white focus-within:ring-1 focus-within:ring-black transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="새로운 할 일을 입력하세요..."
            className="flex-1 px-3 py-2 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              inputText.trim()
                ? 'bg-black text-white hover:bg-gray-800 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus size={15} />
            <span>추가</span>
          </button>
        </div>
      </form>

      {/* Active Todo List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-xs font-bold text-gray-500 tracking-wide uppercase flex items-center gap-1.5">
            <span>할 일</span>
            <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {activeTodos.length}
            </span>
          </h2>
        </div>

        {activeTodos.length === 0 ? (
          <div className="py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
            남은 할 일이 없습니다. 오늘 할 일을 추가해보세요!
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeTodos.map((todo) => {
              const isEditing = editingId === todo.id;

              return (
                <div
                  key={todo.id}
                  className="bg-white border border-gray-100 hover:border-gray-200 rounded-xl px-3.5 py-3 flex items-center justify-between gap-3 group transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTodo(todo.id)}
                      className="text-gray-300 hover:text-black transition-colors shrink-0 p-0.5"
                      title="완료로 체크"
                    >
                      <Circle size={18} strokeWidth={1.75} />
                    </button>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 text-sm border-b border-black py-0.5 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(todo.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(todo.id)}
                          className="p-1 text-black hover:bg-gray-100 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[14px] text-gray-800 break-words leading-relaxed select-text">
                        {todo.text}
                      </span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(todo)}
                        className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="수정"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTodo(todo.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Todos Section (Separated as requested) */}
      {completedTodos.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <button
              type="button"
              onClick={() => setIsCompletedOpen(!isCompletedOpen)}
              className="text-xs font-bold text-gray-500 tracking-wide flex items-center gap-1.5 hover:text-gray-800 transition-colors"
            >
              <span>완료된 투두 리스트</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {completedTodos.length}
              </span>
            </button>

            <button
              type="button"
              onClick={onClearCompleted}
              className="text-[11px] text-gray-400 hover:text-rose-600 transition-colors"
            >
              완료 항목 비우기
            </button>
          </div>

          {isCompletedOpen && (
            <div className="space-y-1.5">
              {completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="bg-gray-50/60 border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTodo(todo.id)}
                      className="text-emerald-600 hover:text-gray-400 transition-colors shrink-0 p-0.5"
                      title="체크 해제 (할 일로 복원)"
                    >
                      <CheckCircle2 size={18} className="fill-emerald-100" />
                    </button>
                    <span className="text-[13px] text-gray-400 line-through break-words select-text">
                      {todo.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleTodo(todo.id)}
                      className="p-1 text-gray-400 hover:text-black hover:bg-gray-200/50 rounded transition-colors text-[11px] flex items-center gap-0.5"
                      title="할 일로 되돌리기"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTodo(todo.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
