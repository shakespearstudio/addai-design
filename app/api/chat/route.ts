import { anthropic } from '@/lib/anthropic'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages,
  })

  return new Response(stream.toReadableStream())
}
