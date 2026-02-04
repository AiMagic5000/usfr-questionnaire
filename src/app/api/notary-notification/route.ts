import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10)
const SMTP_USER = process.env.SMTP_USER || 'claim@usforeclosurerecovery.com'
const SMTP_PASS = process.env.SMTP_PASS || ''
const FROM_EMAIL = process.env.FROM_EMAIL || 'US Foreclosure Recovery <claim@usforeclosurerecovery.com>'

interface NotaryNotificationBody {
  notary_email: string
  notary_name: string
  document_title: string
  document_description?: string
  client_name: string
  client_email: string
  client_phone?: string
  client_address?: string
  property_address?: string
  property_county?: string
}

/**
 * POST /api/notary-notification
 * Sends a context email to the notary with client details and case information.
 * The notary will receive a separate DocuSeal email with the actual signing link.
 */
export async function POST(request: NextRequest) {
  try {
    const body: NotaryNotificationBody = await request.json()

    const {
      notary_email,
      notary_name,
      document_title,
      document_description,
      client_name,
      client_email,
      client_phone,
      client_address,
      property_address,
      property_county,
    } = body

    if (!notary_email || !notary_name || !document_title || !client_name) {
      return NextResponse.json(
        { error: 'notary_email, notary_name, document_title, and client_name are required' },
        { status: 400 }
      )
    }

    if (!SMTP_PASS) {
      return NextResponse.json(
        { error: 'SMTP not configured' },
        { status: 500 }
      )
    }

    // Build the email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notarization Request - US Foreclosure Recovery</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="width: 100%; background-color: #f5f7fa; padding: 30px 0;">
    <div style="max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #003366 0%, #004d99 100%); padding: 30px 40px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">US Foreclosure Recovery</h1>
        <p style="color: #a3c4e8; font-size: 13px; margin: 6px 0 0 0;">Surplus Fund Recovery Services</p>
      </div>

      <!-- Body -->
      <div style="background-color: #ffffff; padding: 35px 40px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">Dear ${notary_name},</p>

        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
          You have been selected to assist with a notarization for our client. Below are the details you'll need to coordinate with the client and complete the signing.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #003366; text-transform: uppercase; letter-spacing: 0.5px;">Document Information</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;"><strong>Document:</strong> ${document_title}</p>
          ${document_description ? `<p style="margin: 0; font-size: 13px; color: #64748b;">${document_description}</p>` : ''}
        </div>

        <div style="background-color: #f0f7ff; border: 1px solid #c8ddf5; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #003366; text-transform: uppercase; letter-spacing: 0.5px;">Client Information</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;"><strong>Name:</strong> ${client_name}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;"><strong>Email:</strong> <a href="mailto:${client_email}" style="color: #004d99;">${client_email}</a></p>
          ${client_phone ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;"><strong>Phone:</strong> <a href="tel:${client_phone}" style="color: #004d99;">${client_phone}</a></p>` : ''}
          ${client_address ? `<p style="margin: 0; font-size: 14px; color: #334155;"><strong>Address:</strong> ${client_address}</p>` : ''}
        </div>

        ${property_address || property_county ? `
        <div style="background-color: #faf5ff; border: 1px solid #e9d8fd; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #553c9a; text-transform: uppercase; letter-spacing: 0.5px;">Property Information</h3>
          ${property_address ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;"><strong>Property Address:</strong> ${property_address}</p>` : ''}
          ${property_county ? `<p style="margin: 0; font-size: 14px; color: #334155;"><strong>County:</strong> ${property_county}</p>` : ''}
        </div>
        ` : ''}

        <div style="background-color: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
          <p style="margin: 0; font-size: 13px; color: #854d0e; line-height: 1.6;">
            <strong>Important:</strong> You will receive a separate email from US Foreclosure Recovery with a secure link to sign/notarize the document electronically. Please coordinate with the client to complete the signing.
          </p>
        </div>

        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 24px 0 16px 0;">
          Please reach out to the client at your earliest convenience to schedule the notarization appointment. If you have any questions, reply to this email or contact our office.
        </p>

        <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
          Best regards,<br>
          <strong>US Foreclosure Recovery</strong><br>
          <span style="color: #64748b; font-size: 13px;">Surplus Fund Recovery Services</span>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 24px 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;"><strong>US Foreclosure Recovery</strong></p>
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">claim@usforeclosurerecovery.com</p>
        <p style="font-size: 11px; color: #b0b8c4; margin-top: 12px;">
          This email contains confidential client information. Please do not share or forward.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

    // Send the email
    const result = await transporter.sendMail({
      from: FROM_EMAIL,
      to: notary_email,
      subject: `Notarization Request: ${document_title} - US Foreclosure Recovery`,
      html: emailHtml,
    })

    return NextResponse.json({
      success: true,
      message_id: result.messageId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send notification'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
