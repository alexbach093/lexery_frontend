import { NextResponse } from 'next/server';

import { DEFAULT_CHAT_USER_ID } from '@/lib/chat-library';
import { getChatById, updateChat } from '@/lib/server/chat-store';
import type { Message } from '@/types/chat';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ chatId: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId')?.trim() || DEFAULT_CHAT_USER_ID;
    const { chatId } = await context.params;
    const chat = await getChatById(userId, chatId);

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load chat';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ chatId: string }> }) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      title?: string;
      preview?: string;
      pinned?: boolean;
      messages?: Message[];
    };

    if (body.messages != null && !Array.isArray(body.messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    if (body.pinned != null && typeof body.pinned !== 'boolean') {
      return NextResponse.json({ error: 'pinned must be a boolean' }, { status: 400 });
    }

    const { chatId } = await context.params;
    const chat = await updateChat({
      chatId,
      userId: body.userId?.trim() || DEFAULT_CHAT_USER_ID,
      title: body.title,
      preview: body.preview,
      pinned: body.pinned,
      messages: body.messages,
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update chat';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
