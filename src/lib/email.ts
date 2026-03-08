import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.log("📧 Email not configured. Email would have been sent:")
    console.log(`   To: ${to}`)
    console.log(`   Subject: ${subject}`)
    // In development, simulate success
    return { success: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Email send error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export function generateVerificationEmailHtml(name: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Apni Pathshala</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Computer Management Dashboard</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #4b5563;">Thank you for creating an account. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #667eea; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `
}

export function generatePasswordResetEmailHtml(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Apni Pathshala</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Computer Management Dashboard</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #4b5563;">We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #667eea; font-size: 14px; word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `
}
