import { NextResponse, type NextRequest } from 'next/server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

export const POST = async (req: NextRequest) => {
  const {
    apiKey: key,
    model = 'gpt-4o-mini',
    prompt,
    system,
  } = (await req.json()) as {
    apiKey?: string
    model?: string
    prompt: string
    system?: string
  }

  const apiKey = key || process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key.' }, { status: 401 })
  }

  const openai = createOpenAI({ apiKey })

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxTokens: 50,
      model: openai(model),
      prompt,
      system,
      temperature: 0.7,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 })
    }

    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 })
  }
}
