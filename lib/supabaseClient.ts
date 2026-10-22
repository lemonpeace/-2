import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  try {
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env) {
      return meta.env[key] || '';
    }
  } catch (e) {
    // Ignore error
  }

  try {
    // @ts-ignore
    return process.env[key] || '';
  } catch {
    return '';
  }
};

// User's configured Supabase project credentials as default
export const DEFAULT_SUPABASE_URL = 'https://fllnyooulodtqlmgzwco.supabase.co';
export const DEFAULT_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbG55b291bG9kdHFsbWd6d2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NjY5NjEsImV4cCI6MjA3OTM0Mjk2MX0.3g7hhCibsHaK2QuF0N-l3VPXw_BVSSjQtuWa5xWbTg4';

// Check if user explicitly disconnected from UI
const isExplicitlyDisconnected =
  typeof window !== 'undefined' && localStorage.getItem('sb_disconnected') === 'true';

const localUrl = typeof window !== 'undefined' ? (localStorage.getItem('sb_url') || '').trim() : '';
const localKey = typeof window !== 'undefined' ? (localStorage.getItem('sb_key') || '').trim() : '';

export const supabaseUrl = isExplicitlyDisconnected
  ? localUrl || ''
  : getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL') || localUrl || DEFAULT_SUPABASE_URL;

export const supabaseKey = isExplicitlyDisconnected
  ? localKey || ''
  : getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY') || localKey || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

// Only initialize client if credentials exist to prevent "supabaseUrl is required" error
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const saveSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sb_disconnected');
    localStorage.setItem('sb_url', url.trim());
    localStorage.setItem('sb_key', key.trim());
    window.location.reload();
  }
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sb_url');
    localStorage.removeItem('sb_key');
    localStorage.setItem('sb_disconnected', 'true');
    window.location.reload();
  }
};

// Test connection and table existence
export const testSupabaseConnection = async (
  url: string,
  key: string
): Promise<{ success: boolean; message: string; tablesExist?: boolean }> => {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return {
      success: false,
      message: '올바른 URL 형식(https://...)을 입력해주세요.',
    };
  }

  try {
    const client = createClient(cleanUrl, cleanKey);
    const { error } = await client.from('entries').select('id').limit(1);

    if (error) {
      const msg = error.message || '';
      if (
        error.code === 'PGRST204' ||
        error.code === '42P01' ||
        msg.includes('relation "public.entries" does not exist') ||
        msg.includes('entries')
      ) {
        return {
          success: true,
          tablesExist: false,
          message: 'Supabase 프로젝트 인증 성공! 단, 아직 `entries` 테이블이 생성되지 않았습니다.',
        };
      }

      if (error.code === 'PGRST301' || msg.includes('JWT') || msg.includes('API key')) {
        return {
          success: false,
          message: 'API Key (Anon Key)가 유효하지 않습니다. 대시보드의 anon public 키를 확인해주세요.',
        };
      }

      return {
        success: false,
        message: `연결 응답 오류: ${msg} (${error.code || '알 수 없음'})`,
      };
    }

    return {
      success: true,
      tablesExist: true,
      message: 'Supabase 클라우드 연결 성공! entries 테이블이 정상 확인되었습니다.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `네트워크 연결 실패: ${err?.message || '주소를 다시 확인해주세요.'}`,
    };
  }
};

// SQL Schema for one-click setup in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- SunJu's Diary Database Schema for Supabase
-- 1. 일기 (entries) 테이블 생성
create table if not exists public.entries (
  id text primary key,
  content text not null,
  date text not null,
  week integer,
  images jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 2. 메모 (notes) 테이블 생성
create table if not exists public.notes (
  id text primary key,
  content text not null,
  category text default '일반',
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. 투두 (todos) 테이블 생성
create table if not exists public.todos (
  id text primary key,
  text text not null,
  completed boolean default false,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 4. RLS (Row Level Security) 설정 및 데이터 접근 허용
alter table public.entries enable row level security;
alter table public.notes enable row level security;
alter table public.todos enable row level security;

-- 기존 정책이 있다면 삭제 후 재생성 (안전한 멱등성 보장)
drop policy if exists "Public entries access" on public.entries;
create policy "Public entries access" on public.entries for all using (true) with check (true);

drop policy if exists "Public notes access" on public.notes;
create policy "Public notes access" on public.notes for all using (true) with check (true);

drop policy if exists "Public todos access" on public.todos;
create policy "Public todos access" on public.todos for all using (true) with check (true);
`;
