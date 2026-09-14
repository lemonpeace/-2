import React, { useState } from 'react';
import { Database, ArrowRight, ShieldCheck, X, Check, Trash2 } from 'lucide-react';
import { saveSupabaseConfig, isSupabaseConfigured } from '../lib/supabaseClient';

interface DbConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbConfigModal: React.FC<DbConfigModalProps> = ({ isOpen, onClose }) => {
  const [setupUrl, setSetupUrl] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('sb_url') || '' : '';
  });
  const [setupKey, setSetupKey] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('sb_key') || '' : '';
  });

  if (!isOpen) return null;

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupUrl && setupKey) {
      saveSupabaseConfig(setupUrl, setupKey);
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Supabase 연동을 해제하고 로컬 모드로 전환하시겠습니까?')) {
      localStorage.removeItem('sb_url');
      localStorage.removeItem('sb_key');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center text-white shrink-0">
            <Database size={20} strokeWidth={1.7} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">클라우드 데이터베이스</h3>
            <p className="text-xs text-gray-500">
              {isSupabaseConfigured ? 'Supabase 연동 완료' : '로컬 모드로 사용 중'}
            </p>
          </div>
        </div>

        {isSupabaseConfigured ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Check size={16} className="text-emerald-600 shrink-0" />
              <span>현재 Supabase 클라우드 데이터베이스와 연결되어 있습니다.</span>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full py-2.5 px-3 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} />
              연동 해제 (로컬 모드로 전환)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSetupSubmit} className="space-y-3.5">
            <p className="text-xs text-gray-500 leading-relaxed">
              여러 기기에서 일기를 동기화하려면 Supabase 프로젝트 정보를 입력하세요. 입력하지 않아도 브라우저에 안전하게 자동 저장됩니다.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Project URL
              </label>
              <input
                type="url"
                value={setupUrl}
                onChange={(e) => setSetupUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Anon API Key
              </label>
              <input
                type="password"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                placeholder="your-public-anon-key"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black text-xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!setupUrl || !setupKey}
              className="w-full bg-black text-white py-2.5 rounded-xl font-semibold text-xs hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              연결하기
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2 text-gray-400 text-[11px]">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-500" />
          <span>모든 데이터는 기기 로컬에 자동 보관되며 안전합니다.</span>
        </div>
      </div>
    </div>
  );
};
