// Route for AI playground chat streaming
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, system, provider } = await req.json();

    let model;
    if (provider === 'anthropic') {
      const apiKey = req.headers.get('x-anthropic-key');
      if (!apiKey) return new Response('Missing Anthropic API Key', { status: 401 });
      const anthropic = createAnthropic({ apiKey });
      model = anthropic('claude-3-5-sonnet-20240620');
    } else {
      const apiKey = req.headers.get('x-openai-key');
      if (!apiKey) return new Response('Missing OpenAI API Key', { status: 401 });
      const openai = createOpenAI({ apiKey });
      model = openai('gpt-4o');
    }

    // Cast messages to typed array
    const typedMessages = Array.isArray(messages) 
      ? messages.map((m: unknown) => {
          const msg = m as Record<string, unknown>;
          const roleStr = typeof msg?.role === 'string' ? msg.role : 'user';
          return {
            role: (['user', 'assistant', 'system'].includes(roleStr) ? roleStr : 'user') as 'user' | 'assistant' | 'system',
            content: typeof msg?.content === 'string' ? msg.content : '',
          };
        })
      : [];

    const result = await streamText({
      model,
      system,
      messages: typedMessages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const err = error as Error;
    return new Response(err.message || 'An error occurred', { status: 500 });
  }
}
