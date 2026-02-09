import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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

// Fetch admin emails from Xano
async function getAdminEmails(): Promise<string[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_XANO_API_URL}/get_admin_emails`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch admin emails')
    }

    const data = await response.json()
    // Extract emails from admins array
    const admins = data.admins
    if (Array.isArray(admins)) {
      return admins.map((admin: any) => admin.email).filter((email: string) => email)
    }
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Error fetching admin emails:', error)
    // Fallback to support email if set
    if (process.env.SUPPORT_EMAIL) {
      return process.env.SUPPORT_EMAIL.split(',').map(e => e.trim())
    }
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentName, agentEmail, subject, message } = body

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Get admin emails
    const adminEmails = await getAdminEmails()

    if (!Array.isArray(adminEmails) || adminEmails.length === 0) {
      return NextResponse.json(
        { error: 'No support contacts configured. Please try again later.' },
        { status: 500 }
      )
    }

    // Send email to all admins
    const transporter = createTransporter()

    const toEmails = adminEmails.filter(e => typeof e === 'string' && e.length > 0).join(', ')

    const mailOptions = {
      from: `"${agentName || 'Agent'} via TheCollabPortal" <${process.env.SMTP_USER || 'noreply@thecollabportal.com'}>`,
      to: toEmails,
      replyTo: agentEmail,
      subject: `[Support] ${subject}`,
      html: `<p style="white-space: pre-wrap;">${message}</p>`,
      text: message,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    })
  } catch (error: any) {
    console.error('Support contact error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
