'use client';

export const APP_PREFERENCES_STORAGE_KEY = 'lexery-app-preferences';
export const APP_PREFERENCES_UPDATED_EVENT = 'lexery-app-preferences-updated';

export interface AppPreferences {
  memoryEnabled: boolean;
}

const DEFAULT_APP_PREFERENCES: AppPreferences = {
  memoryEnabled: true,
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizePreferences(value: unknown): AppPreferences {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_APP_PREFERENCES };
  }

  const candidate = value as Partial<AppPreferences>;
  return {
    memoryEnabled:
      typeof candidate.memoryEnabled === 'boolean'
        ? candidate.memoryEnabled
        : DEFAULT_APP_PREFERENCES.memoryEnabled,
  };
}

function dispatchPreferencesUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(APP_PREFERENCES_UPDATED_EVENT));
}

export function getAppPreferences(): AppPreferences {
  if (!canUseStorage()) {
    return { ...DEFAULT_APP_PREFERENCES };
  }

  try {
    const raw = window.localStorage.getItem(APP_PREFERENCES_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_PREFERENCES };
    return normalizePreferences(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_APP_PREFERENCES };
  }
}

export function saveAppPreferences(preferences: AppPreferences): AppPreferences {
  const normalized = normalizePreferences(preferences);

  if (canUseStorage()) {
    window.localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify(normalized));
  }

  dispatchPreferencesUpdated();
  return normalized;
}

export function setMemoryEnabledPreference(memoryEnabled: boolean): AppPreferences {
  const current = getAppPreferences();
  return saveAppPreferences({ ...current, memoryEnabled });
}

export function clearAppPreferences(): AppPreferences {
  return saveAppPreferences(DEFAULT_APP_PREFERENCES);
}
