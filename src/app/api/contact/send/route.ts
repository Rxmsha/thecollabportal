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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentEmail, realtorName, realtorEmail, subject, message } = body

    // Validate required fields
    if (!agentEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Agent email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Send email to agent
    const transporter = createTransporter()

    const mailOptions = {
      from: `"${realtorName} via The Collab Portal" <${process.env.SMTP_USER || 'noreply@thecollabportal.com'}>`,
      to: agentEmail,
      replyTo: realtorEmail,
      subject: subject,
      html: `<p style="white-space: pre-wrap;">${message}</p>`,
      text: message,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    })
  } catch (error: any) {
    console.error('Contact send error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
