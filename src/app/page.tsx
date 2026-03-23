import { redirect } from 'next/navigation';

import { EntryScreen } from '@/components/workspace/EntryScreen';
import { getWorkspaceChatPath } from '@/lib/app-routes';

type RootPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RootPage({ searchParams }: RootPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const legacyChatParam = resolvedSearchParams.chat;
  const legacyChatId = Array.isArray(legacyChatParam) ? legacyChatParam[0] : legacyChatParam;

  if (legacyChatId) {
    redirect(getWorkspaceChatPath(legacyChatId));
  }

  return <EntryScreen />;
}
