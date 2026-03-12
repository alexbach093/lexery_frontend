import { NextResponse } from 'next/server';

import { DEFAULT_CHAT_USER_ID } from '@/lib/chat-library';
import { createChat, listChatsByUser } from '@/lib/server/chat-store';
import type { Message } from '@/types/chat';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId')?.trim() || DEFAULT_CHAT_USER_ID;
    const chats = await listChatsByUser(userId);
    return NextResponse.json({ chats });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load chats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      title?: string;
      preview?: string;
      messages?: Message[];
    };

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const chat = await createChat({
      userId: body.userId?.trim() || DEFAULT_CHAT_USER_ID,
      title: body.title,
      preview: body.preview,
      messages: body.messages,
    });

    return NextResponse.json({ chat }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create chat';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
