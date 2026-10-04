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
      if (!apiKey) return new Response("Missing Anthropic API Key", { status: 401 });
      const anthropic = createAnthropic({ apiKey });
      model = anthropic('claude-3-5-sonnet-20240620');
    } else {
      const apiKey = req.headers.get('x-openai-key');
      if (!apiKey) return new Response("Missing OpenAI API Key", { status: 401 });
      const openai = createOpenAI({ apiKey });
      model = openai('gpt-4o');
    }

    const result = await streamText({
      model,
      system,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    return new Response(error.message || "An error occurred", { status: 500 });
  }
}
