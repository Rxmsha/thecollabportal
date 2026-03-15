import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const XANO_API_URL = process.env.NEXT_PUBLIC_XANO_API_URL || 'https://xzkg-6hxh-f8to.n7d.xano.io/api:Y8CjHB2a'
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_Pk5BAPHSoaLCQiy3282AR3GXbUiEiotD'

// Create email transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Send welcome email
async function sendWelcomeEmail(
  to: string,
  firstName: string,
  tempPassword: string
) {
  const transporter = createTransporter()
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL + '/login'

  const mailOptions = {
    from: `"The Collab Portal" <${process.env.SMTP_USER || 'noreply@thecollabportal.com'}>`,
    to,
    subject: 'Welcome to The Collab Portal - Your Account is Ready!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to The Collab Portal!</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${firstName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">Thank you for subscribing to The Collab Portal! Your account has been created and is ready to use.</p>

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your login credentials:</p>
            <p style="margin: 0 0 5px 0;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
          </div>

          <div style="background: #ecfeff; border: 1px solid #0891b2; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #0e7490;"><strong>Your Plan:</strong> Professional - 50 Realtor Partner Seats</p>
          </div>

          <p style="font-size: 16px; margin-bottom: 20px;">Here's what to do next:</p>

          <ol style="padding-left: 20px; margin-bottom: 20px;">
            <li style="margin-bottom: 10px;">Log in to your portal using the credentials above</li>
            <li style="margin-bottom: 10px;">Change your password to something secure</li>
            <li style="margin-bottom: 10px;">Upload your logo and set your brand color</li>
            <li style="margin-bottom: 10px;">Start inviting your Realtor partners</li>
          </ol>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #0891b2; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block;">Log In to Your Portal</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="font-size: 14px; color: #6b7280; margin: 0;">Need help? Reply to this email or contact us at support@thecollabportal.com</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">— The Collab Portal Team</p>
        </div>
      </body>
      </html>
    `,
    text: `
Hi ${firstName},

Thank you for subscribing to The Collab Portal! Your account has been created and is ready to use.

Your login credentials:
Email: ${to}
Temporary Password: ${tempPassword}

Your Plan: Professional - 50 Realtor Partner Seats

Here's what to do next:
1. Log in to your portal: ${loginUrl}
2. Change your password to something secure
3. Upload your logo and set your brand color
4. Start inviting your Realtor partners

Need help? Reply to this email or contact us at support@thecollabportal.com

— The Collab Portal Team
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

// Create agent account via Xano
async function createAgentAccount(
  email: string,
  firstName: string,
  lastName: string,
  companyName: string,
  phone: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string
) {
  try {
    const response = await fetch(`${XANO_API_URL}/signup_agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        phone: phone || '',
        seat_limit: 50,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create agent account')
    }

    return {
      success: true,
      agentId: data.agentId || data.agent_id,
      tempPassword: data.tempPassword || data.temp_password,
    }
  } catch (error: any) {
    console.error('Xano agent creation error:', error)
    return { success: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('Checkout session completed:', session.id)

      // Only process if it's from our landing page
      if (session.metadata?.source !== 'getrealtorconnect') {
        console.log('Ignoring checkout session from different source')
        break
      }

      // Get customer details
      const customerEmail = session.customer_details?.email
      const customerPhone = session.customer_details?.phone || ''

      // Get custom fields
      const customFields = session.custom_fields || []
      const firstName = customFields.find(f => f.key === 'first_name')?.text?.value || ''
      const lastName = customFields.find(f => f.key === 'last_name')?.text?.value || ''
      const companyName = customFields.find(f => f.key === 'company_name')?.text?.value || ''

      if (!customerEmail || !firstName || !lastName) {
        console.error('Missing required fields:', { customerEmail, firstName, lastName })
        break
      }

      // Get Stripe IDs
      const stripeCustomerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id || ''
      const stripeSubscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id || ''

      // Create the agent account
      const accountResult = await createAgentAccount(
        customerEmail,
        firstName,
        lastName,
        companyName,
        customerPhone,
        stripeCustomerId,
        stripeSubscriptionId
      )

      if (!accountResult.success) {
        console.error('Failed to create agent account:', accountResult.error)
        // You might want to send an alert to admin here
        break
      }

      // Send welcome email
      if (accountResult.tempPassword) {
        const emailResult = await sendWelcomeEmail(
          customerEmail,
          firstName,
          accountResult.tempPassword
        )

        if (!emailResult.success) {
          console.error('Failed to send welcome email:', emailResult.error)
        }
      }

      console.log('Agent account created successfully:', {
        email: customerEmail,
        agentId: accountResult.agentId,
      })

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      console.log('Subscription updated:', subscription.id)
      // Handle subscription updates (upgrades, downgrades, etc.)
      // You can update the seat_limit in Xano based on subscription changes
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      console.log('Subscription cancelled:', subscription.id)
      // Handle subscription cancellation
      // You might want to deactivate the agent account or flag it
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.log('Payment failed for invoice:', invoice.id)
      // Handle failed payments - send notification, etc.
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
