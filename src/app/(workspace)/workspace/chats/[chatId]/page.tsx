import { WorkspaceScreen } from '@/components/workspace/WorkspaceScreen';

type WorkspaceChatPageProps = {
  params: Promise<{
    chatId: string;
  }>;
};

export default async function WorkspaceChatPage({ params }: WorkspaceChatPageProps) {
  const resolvedParams = await params;
  return <WorkspaceScreen routeChatId={resolvedParams.chatId} />;
}
