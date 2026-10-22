import React, { useState, useEffect } from 'react';
import {
  Database,
  Bell,
  Clock,
  Volume2,
  VolumeX,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Download,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
  supabaseUrl,
  supabaseKey,
  isSupabaseConfigured,
} from '../../lib/supabaseClient';
import {
  ReminderConfig,
  requestNotificationPermission,
  triggerDiaryNotification,
} from '../../services/reminderService';

interface SettingsTabProps {
  reminderConfig: ReminderConfig;
  onUpdateReminderConfig: (config: ReminderConfig) => void;
  onSyncAllToCloud: () => Promise<{ success: boolean; message: string }>;
  entriesCount: number;
  memosCount: number;
  todosCount: number;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  reminderConfig,
  onUpdateReminderConfig,
  onSyncAllToCloud,
  entriesCount,
  memosCount,
  todosCount,
}) => {
  // Supabase connection state
  const [urlInput, setUrlInput] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('sb_url') || supabaseUrl || '' : '';
  });
  const [keyInput, setKeyInput] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('sb_key') || supabaseKey || '' : '';
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tablesExist?: boolean;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Notification permission state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied';
  });

  const [isTestingAlarm, setIsTestingAlarm] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Handle Supabase Connection Test
  const handleTestConnection = async () => {
    if (!urlInput || !keyInput) {
      setTestResult({
        success: false,
        message: 'URL과 Anon API Key를 모두 입력해주세요.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(urlInput, keyInput);
    setIsTesting(false);
    setTestResult(result);
  };

  // Handle Save Supabase
  const handleSaveSupabase = () => {
    if (!urlInput || !keyInput) return;
    saveSupabaseConfig(urlInput, keyInput);
  };

  // Handle Disconnect Supabase
  const handleDisconnectSupabase = () => {
    if (window.confirm('Supabase 연동을 해제하고 로컬 모드로 전환하시겠습니까? (로컬에 저장된 데이터는 그대로 유지됩니다)')) {
      clearSupabaseConfig();
    }
  };

  // Copy SQL Schema
  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Sync to Cloud
  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus('데이터를 Supabase 클라우드로 업로드 중...');
    const res = await onSyncAllToCloud();
    setIsSyncing(false);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  // Handle Notification Permission Request
  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      onUpdateReminderConfig({ ...reminderConfig, enabled: true });
    }
  };

  // Handle Test Alarm
  const handleTestAlarm = async () => {
    setIsTestingAlarm(true);
    if (notificationPermission !== 'granted') {
      const perm = await requestNotificationPermission();
      setNotificationPermission(perm);
      if (perm !== 'granted') {
        alert('브라우저 알림 권한이 허용되어야 알람을 띄울 수 있습니다.');
        setIsTestingAlarm(false);
        return;
      }
    }

    await triggerDiaryNotification(
      "SunJu's story 🌙",
      '🔔 테스트 알람입니다! 매일 설정하신 시간에 소중한 일기를 남길 수 있도록 알려드립니다.',
      reminderConfig.soundEnabled
    );
    setIsTestingAlarm(false);
  };

  // Backup Download
  const handleDownloadBackup = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      entries: JSON.parse(localStorage.getItem('diary_entries') || '[]'),
      memos: JSON.parse(localStorage.getItem('memo_notes') || '[]'),
      todos: JSON.parse(localStorage.getItem('todo_items') || '[]'),
      categories: JSON.parse(localStorage.getItem('note_categories') || '[]'),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sunju-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-5 pt-3 pb-24 space-y-6">
      {/* 1. Daily Reminder Alarm Section */}
      <section className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Bell size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">매일 일기 알람</h3>
              <p className="text-[11px] text-gray-500">매일 같은 시간에 일기 작성을 리마인드합니다</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={reminderConfig.enabled}
            onClick={() => {
              if (!reminderConfig.enabled && notificationPermission !== 'granted') {
                handleRequestPermission();
              } else {
                onUpdateReminderConfig({
                  ...reminderConfig,
                  enabled: !reminderConfig.enabled,
                });
              }
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              reminderConfig.enabled ? 'bg-black' : 'bg-gray-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                reminderConfig.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Alarm Time Picker & Options */}
        <div className="mt-4 space-y-3.5 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              알람 시간
            </span>
            <input
              type="time"
              value={reminderConfig.time}
              onChange={(e) =>
                onUpdateReminderConfig({
                  ...reminderConfig,
                  time: e.target.value,
                })
              }
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-black focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              {reminderConfig.soundEnabled ? (
                <Volume2 size={14} className="text-gray-400" />
              ) : (
                <VolumeX size={14} className="text-gray-400" />
              )}
              알림 효과음 (차임벨)
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateReminderConfig({
                  ...reminderConfig,
                  soundEnabled: !reminderConfig.soundEnabled,
                })
              }
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                reminderConfig.soundEnabled
                  ? 'bg-amber-100 text-amber-800 font-semibold'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {reminderConfig.soundEnabled ? '켜짐' : '무음'}
            </button>
          </div>

          {/* Browser Permission Info */}
          {notificationPermission !== 'granted' ? (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
              <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] text-amber-900 font-medium">
                  브라우저 알림 권한이 필요합니다.
                </p>
                <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
                  권한을 허용하셔야 설정하신 시간에 알림 배너가 정상 발송됩니다.
                </p>
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="mt-2 text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors"
                >
                  알림 권한 허용하기
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between text-[11px] text-emerald-800">
              <div className="flex items-center gap-1.5 font-medium">
                <Check size={14} className="text-emerald-600" />
                <span>브라우저 알림 권한 허용됨</span>
              </div>
              <span className="text-[10px] text-emerald-600">매일 {reminderConfig.time} 발송</span>
            </div>
          )}

          {/* Test Alarm Button */}
          <button
            type="button"
            onClick={handleTestAlarm}
            disabled={isTestingAlarm}
            className="w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>테스트 알람 울리기 (소리 & 알림 확인)</span>
          </button>
        </div>
      </section>

      {/* 2. Supabase Cloud Sync Section */}
      <section className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Database size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">수파베이스(Supabase) 연동</h3>
              <p className="text-[11px] text-gray-500">
                {isSupabaseConfigured ? '클라우드 DB 동기화 활성' : '로컬 모드로 저장 중'}
              </p>
            </div>
          </div>

          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
              isSupabaseConfigured
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isSupabaseConfigured ? '연결됨' : '미연결'}
          </span>
        </div>

        {isSupabaseConfigured ? (
          /* Connected State */
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Check size={15} className="text-emerald-600 shrink-0" />
                <span>내 Supabase에 연결되어 있습니다</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-mono truncate">
                {supabaseUrl}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex-1 py-2 px-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                <span>클라우드로 전체 동기화</span>
              </button>

              <button
                type="button"
                onClick={handleDisconnectSupabase}
                className="py-2 px-3 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="연동 해제"
              >
                <Trash2 size={13} />
                <span>연동 해제</span>
              </button>
            </div>

            {syncStatus && (
              <p className="text-[11px] text-center font-medium text-emerald-600 animate-in fade-in">
                {syncStatus}
              </p>
            )}
          </div>
        ) : (
          /* Disconnected / Setup State */
          <div className="space-y-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed">
              여러 기기(PC, 휴대폰)에서 일기와 노트를 실시간 동기화하려면 본인의 Supabase 프로젝트 정보를 연결하세요.
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Project URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Anon API Key (Public)
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black text-xs font-mono"
                />
              </div>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <p className="font-semibold">{testResult.message}</p>
                {testResult.success && !testResult.tablesExist && (
                  <p className="text-[11px] text-emerald-700 mt-1">
                    아래 [테이블 생성 SQL 복사] 버튼을 눌러 Supabase SQL Editor에 붙여넣고 실행해주세요!
                  </p>
                )}
              </div>
            )}

            {/* Buttons: Test & Save */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !urlInput || !keyInput}
                className="flex-1 py-2 px-3 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
                <span>연결 테스트</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSupabase}
                disabled={!urlInput || !keyInput}
                className="flex-1 py-2 px-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <span>저장 및 연결하기</span>
              </button>
            </div>
          </div>
        )}

        {/* Supabase Table Creation SQL Guide - ALWAYS VISIBLE */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Database size={14} className="text-emerald-600" />
              Supabase 테이블 생성 SQL 스크립트
            </span>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-black hover:bg-neutral-800 text-white font-semibold transition-colors shadow-xs"
            >
              {copiedSql ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-300">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>SQL 복사하기</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Supabase 대시보드 ➡️ <strong>SQL Editor</strong> ➡️ <strong>New Query</strong>에 붙여넣고 <strong>Run</strong> 버튼을 누르면 일기(entries), 메모(notes), 투두(todos) 테이블이 즉시 생성됩니다.
          </p>
          <div className="bg-gray-900 rounded-xl p-3 text-[10px] text-gray-300 font-mono overflow-x-auto max-h-36 border border-gray-800 select-all">
            <pre className="whitespace-pre">{SUPABASE_SQL_SCHEMA}</pre>
          </div>
        </div>
      </section>

      {/* 3. Local Data Backup & Overview */}
      <section className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={17} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-gray-900">데이터 보관 및 백업</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 py-1 text-center">
          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium">일기 기록</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{entriesCount}개</p>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium">메모 노트</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{memosCount}개</p>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium">투두 항목</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{todosCount}개</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadBackup}
          className="w-full py-2 px-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Download size={13} />
          <span>내 데이터 JSON 백업 파일 다운로드</span>
        </button>
      </section>
    </div>
  );
};
