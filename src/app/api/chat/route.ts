import { NextResponse } from 'next/server';

import { createChatCompletion } from '@/lib/openrouter';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Expected body.messages (non-empty array of { role, content })' },
        { status: 400 }
      );
    }
    const openAiMessages = messages.map(
      (m: { role: string; content: string }) =>
        ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content ?? '' }) as const
    );
    const completion = await createChatCompletion(openAiMessages);
    const content = completion.choices?.[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
