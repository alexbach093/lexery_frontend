import type { SectionId } from '@/types';

export const ROOT_ENTRY_PATH = '/';
export const WORKSPACE_HOME_PATH = '/workspace';
export const SETTINGS_ROOT_PATH = '/settings';

const SETTINGS_SECTION_SLUGS: Record<SectionId, string> = {
  general: 'general',
  info: 'information',
  security: 'security',
};

const SETTINGS_SLUG_TO_SECTION = Object.fromEntries(
  Object.entries(SETTINGS_SECTION_SLUGS).map(([section, slug]) => [slug, section])
) as Record<string, SectionId>;

type SearchParamsLike = {
  get: (name: string) => string | null;
};

export function getWorkspaceHomePath(): string {
  return WORKSPACE_HOME_PATH;
}

export function getWorkspaceChatPath(chatId: string): string {
  return `${WORKSPACE_HOME_PATH}/chats/${encodeURIComponent(chatId)}`;
}

export function getSettingsRootPath(): string {
  return SETTINGS_ROOT_PATH;
}

export function getSettingsSectionSlug(section: SectionId): string {
  return SETTINGS_SECTION_SLUGS[section];
}

export function getSettingsPath(section: SectionId = 'general'): string {
  return `${SETTINGS_ROOT_PATH}/${getSettingsSectionSlug(section)}`;
}

export function getLegacyChatIdFromSearchParams(
  searchParams?: SearchParamsLike | URLSearchParams | null
): string | null {
  const rawValue = searchParams?.get('chat');

  if (!rawValue) {
    return null;
  }

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

export function getCanonicalPathFromLegacyChatSearch(
  searchParams?: SearchParamsLike | URLSearchParams | null
): string | null {
  const chatId = getLegacyChatIdFromSearchParams(searchParams);
  return chatId ? getWorkspaceChatPath(chatId) : null;
}

export function getRouteChatIdFromPathname(pathname?: string | null): string | null {
  if (!pathname) {
    return null;
  }

  const prefix = `${WORKSPACE_HOME_PATH}/chats/`;
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const remainder = pathname.slice(prefix.length);
  const [encodedChatId] = remainder.split('/');
  if (!encodedChatId) {
    return null;
  }

  try {
    return decodeURIComponent(encodedChatId);
  } catch {
    return encodedChatId;
  }
}

export function getSettingsSectionFromSlug(slug?: string | null): SectionId | null {
  if (!slug) {
    return null;
  }

  return SETTINGS_SLUG_TO_SECTION[slug] ?? null;
}
