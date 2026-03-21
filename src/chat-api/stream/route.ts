import { createChatCompletionStream } from '@/lib/server/openrouter';

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Expected body.messages (non-empty array of { role, content })',
        }),
        { status: 400 }
      );
    }
    const openAiMessages = messages.map(
      (m: { role: string; content: string }) =>
        ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content ?? '' }) as const
    );

    const stream = await createChatCompletionStream(openAiMessages, {
      signal: request.signal,
    });

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let closed = false;
        const closeStream = () => {
          if (closed) return;
          closed = true;
          controller.close();
        };
        const handleAbort = () => {
          closeStream();
        };

        request.signal.addEventListener('abort', handleAbort, { once: true });

        try {
          for await (const chunk of stream) {
            if (request.signal.aborted) break;

            const content = chunk.choices?.[0]?.delta?.content;
            if (typeof content === 'string' && content.length > 0) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }

          if (!request.signal.aborted) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          }
        } catch (err) {
          if (!request.signal.aborted) {
            const message = err instanceof Error ? err.message : 'Stream failed';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
          }
        } finally {
          request.signal.removeEventListener('abort', handleAbort);
          closeStream();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat stream failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
