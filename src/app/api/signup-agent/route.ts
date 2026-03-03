import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const XANO_API_URL = process.env.NEXT_PUBLIC_XANO_API_URL || 'https://xzkg-6hxh-f8to.n7d.xano.io/api:Y8CjHB2a'

// Create email transporter
function createTransporter() {
  // For Gmail, you need to use an App Password (not your regular password)
  // Go to: Google Account > Security > 2-Step Verification > App passwords
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
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
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to The Collab Portal</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${firstName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">Your The Collab Portal account is ready!</p>

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your login credentials:</p>
            <p style="margin: 0 0 5px 0;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
          </div>

          <p style="font-size: 16px; margin-bottom: 20px;">Here's what to do next:</p>

          <ol style="padding-left: 20px; margin-bottom: 20px;">
            <li style="margin-bottom: 10px;">Log in to your portal using the credentials above</li>
            <li style="margin-bottom: 10px;">Upload your logo and set your brand color</li>
            <li style="margin-bottom: 10px;">Start inviting your Realtor partners</li>
          </ol>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block;">Log In to Your Portal</a>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">We'll handle all updates and notifications automatically.</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="font-size: 14px; color: #6b7280; margin: 0;">— The Collab Portal Team</p>
        </div>
      </body>
      </html>
    `,
    text: `
Hi ${firstName},

Your The Collab Portal account is ready!

Your login credentials:
Email: ${to}
Temporary Password: ${tempPassword}

Here's what to do next:
1. Log in to your portal: ${loginUrl}
2. Upload your logo and set your brand color
3. Start inviting your Realtor partners
4. Change the password (optional)

We'll handle all updates and notifications automatically.

The The Collab Portal Team
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, companyName } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    // Call Xano to create the agent (public signup endpoint - no auth required)
    const xanoResponse = await fetch(`${XANO_API_URL}/signup_agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName || '',
        phone: phone || '',
        seat_limit: 50,
      }),
    })

    const xanoData = await xanoResponse.json()

    if (!xanoResponse.ok) {
      return NextResponse.json(
        { error: xanoData.message || 'Failed to create account' },
        { status: xanoResponse.status }
      )
    }

    // Get the temp password that Xano generated
    const tempPassword = xanoData.tempPassword || xanoData.temp_password

    if (!tempPassword) {
      console.error('No temp password returned from Xano:', xanoData)
      return NextResponse.json(
        { error: 'Account created but no password was generated' },
        { status: 500 }
      )
    }

    // Send welcome email with credentials
    const emailResult = await sendWelcomeEmail(email, firstName, tempPassword)

    if (!emailResult.success) {
      // Account was created but email failed - still return success
      // but log the error
      console.error('Failed to send welcome email:', emailResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      agentId: xanoData.agentId || xanoData.agent_id,
      emailSent: emailResult.success,
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
