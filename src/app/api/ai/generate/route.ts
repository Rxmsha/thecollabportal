import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize lazily to avoid build-time errors
let openai: OpenAI | null = null

function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

// System prompts for different tools
const systemPrompts: Record<string, string> = {
  'deal-notes': `You are a professional mortgage/real estate assistant. Create clear, well-organized deal notes and transaction summaries. Focus on key details, terms, and conditions. Use bullet points and sections for readability.`,

  'content-coach': `You are a creative marketing assistant for real estate and mortgage professionals. Create engaging, professional content for social media, newsletters, and marketing materials. Use compelling language while maintaining professionalism.`,

  'renewal-email': `You are an expert at writing personalized client outreach emails for mortgage professionals. Create warm, professional renewal emails that build on existing client relationships. Include relevant details and a clear call to action.`,

  'email-builder': `You are an expert at writing professional real estate emails. Create clear, engaging emails for various purposes including follow-ups, listing updates, and client communications. Maintain a professional yet approachable tone.`,

  'thank-you': `You are skilled at writing heartfelt, genuine thank you notes. Create personalized messages that express sincere gratitude while maintaining professionalism. Make the recipient feel valued and appreciated.`,
}

// Tone modifiers
const toneModifiers: Record<string, string> = {
  professional: 'Use a professional, business-appropriate tone.',
  friendly: 'Use a warm, friendly tone while remaining professional.',
  casual: 'Use a casual, conversational tone.',
  formal: 'Use a formal, traditional business tone.',
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { tool, input, tone, promptPrefix } = body

    // Validate input
    if (!input || !input.trim()) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      )
    }

    // Get system prompt for the tool
    const systemPrompt = systemPrompts[tool] || systemPrompts['content-coach']
    const toneModifier = toneModifiers[tone] || toneModifiers['professional']

    // Build the full prompt
    const fullSystemPrompt = `${systemPrompt}\n\n${toneModifier}`
    const userPrompt = promptPrefix
      ? `${promptPrefix}\n\n${input}`
      : input

    // Call OpenAI
    const client = getOpenAI()
    if (!client) {
      return NextResponse.json(
        { error: 'OpenAI client not available' },
        { status: 500 }
      )
    }
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('AI generation error:', error)

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your billing.' },
        { status: 402 }
      )
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    )
  }
}
