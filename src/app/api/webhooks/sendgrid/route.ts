import { NextRequest, NextResponse } from 'next/server'

const XANO_WEBHOOK_URL = process.env.NEXT_PUBLIC_XANO_API_URL?.replace('/api:', '/api:Y8CjHB2a') + '/sendgrid_webhook'

// SendGrid sends events as an array
interface SendGridEvent {
  event: string
  email: string
  sg_message_id?: string
  sg_template_id?: string
  url?: string
  useragent?: string
  timestamp?: number
}

export async function POST(request: NextRequest) {
  try {
    const events: SendGridEvent[] = await request.json()

    // Process each event
    for (const event of events) {
      // Forward to Xano endpoint
      try {
        await fetch(XANO_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: event.event,
            email: event.email,
            sg_message_id: event.sg_message_id || '',
            sg_template_id: event.sg_template_id || '',
            url: event.url || '',
            useragent: event.useragent || '',
          }),
        })
      } catch (err) {
        console.error('Failed to forward event to Xano:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('SendGrid webhook error:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}
