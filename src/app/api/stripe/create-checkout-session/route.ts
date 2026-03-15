import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId } = body

    // Use the provided price ID or default to the professional plan
    const stripePriceId = priceId || process.env.STRIPE_PRICE_ID || 'price_1Szfh6KRd8Vurvx3q1Ard4Cd'

    // Create Checkout Session with custom fields for agent info
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      // Custom fields to collect agent information
      custom_fields: [
        {
          key: 'first_name',
          label: {
            type: 'custom',
            custom: 'First Name',
          },
          type: 'text',
        },
        {
          key: 'last_name',
          label: {
            type: 'custom',
            custom: 'Last Name',
          },
          type: 'text',
        },
        {
          key: 'company_name',
          label: {
            type: 'custom',
            custom: 'Company Name',
          },
          type: 'text',
        },
      ],
      // Collect email and phone
      customer_creation: 'always',
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      // Success and cancel URLs
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://thecollabportal.com'}/signup-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.STRIPE_CANCEL_URL || 'https://getrealtorconnect.com'}/#pricing`,
      // Metadata for webhook processing
      metadata: {
        source: 'getrealtorconnect',
        plan: 'professional',
        seat_limit: '50',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
  } catch (error: any) {
    console.error('Stripe checkout session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

// Also support GET for simple redirect (can be used as direct link)
export async function GET(request: NextRequest) {
  try {
    const stripePriceId = process.env.STRIPE_PRICE_ID || 'price_1Szfh6KRd8Vurvx3q1Ard4Cd'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      custom_fields: [
        {
          key: 'first_name',
          label: {
            type: 'custom',
            custom: 'First Name',
          },
          type: 'text',
        },
        {
          key: 'last_name',
          label: {
            type: 'custom',
            custom: 'Last Name',
          },
          type: 'text',
        },
        {
          key: 'company_name',
          label: {
            type: 'custom',
            custom: 'Company Name',
          },
          type: 'text',
        },
      ],
      customer_creation: 'always',
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://thecollabportal.com'}/signup-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.STRIPE_CANCEL_URL || 'https://getrealtorconnect.com'}/#pricing`,
      metadata: {
        source: 'getrealtorconnect',
        plan: 'professional',
        seat_limit: '50',
      },
    })

    // Redirect to Stripe Checkout
    return NextResponse.redirect(session.url!, { status: 303 })
  } catch (error: any) {
    console.error('Stripe checkout session error:', error)
    return NextResponse.redirect(
      `${process.env.STRIPE_CANCEL_URL || 'https://getrealtorconnect.com'}/?error=checkout_failed`,
      { status: 303 }
    )
  }
}
