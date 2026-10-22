// Notification and Alarm Reminder Service for SunJu's Diary

export interface ReminderConfig {
  enabled: boolean;
  time: string; // 'HH:mm' format, e.g. '21:00'
  soundEnabled: boolean;
  lastNotifiedDate?: string; // 'YYYY-MM-DD'
}

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  enabled: false,
  time: '21:00',
  soundEnabled: true,
};

const STORAGE_KEY = 'sunju_reminder_config';

export const getReminderConfig = (): ReminderConfig => {
  if (typeof window === 'undefined') return DEFAULT_REMINDER_CONFIG;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_REMINDER_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load reminder config', e);
  }
  return DEFAULT_REMINDER_CONFIG;
};

export const saveReminderConfig = (config: ReminderConfig): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save reminder config', e);
  }
};

// Play a gentle, soothing chime using Web Audio API (works offline, no external audio file needed)
export const playChimeSound = (): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Soothing gentle chord: C5 -> E5 -> G5
    playTone(523.25, now, 0.9, 0.15);
    playTone(659.25, now + 0.12, 1.1, 0.13);
    playTone(783.99, now + 0.25, 1.4, 0.11);
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
};

// Request browser notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return Notification.permission;
  }
};

// Send notification immediately (with sound if enabled)
export const triggerDiaryNotification = async (
  title: string = "SunJu's story 🌙",
  body: string = '오늘 하루는 어떠셨나요? 소중한 순간을 일기로 기록해보세요.',
  playSound: boolean = true
): Promise<boolean> => {
  if (playSound) {
    playChimeSound();
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    // Try using Service Worker registration if available
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.showNotification) {
        await registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'daily-diary-reminder',
        });
        return true;
      }
    }

    // Fallback to standard Notification
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      tag: 'daily-diary-reminder',
    });
    return true;
  } catch (e) {
    console.error('Failed to trigger notification:', e);
    return false;
  }
};
