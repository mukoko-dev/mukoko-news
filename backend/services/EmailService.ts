/**
 * Email Service for Mukoko News
 * Handles transactional emails (password reset, verification codes)
 * Uses Resend API for email delivery
 */

export interface EmailConfig {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private apiKey: string | undefined;
  private fromEmail: string;

  constructor(config: EmailConfig) {
    this.apiKey = config.RESEND_API_KEY;
    this.fromEmail = config.EMAIL_FROM || 'Mukoko News <noreply@notify.mukoko.com>';
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Send an email using Resend API
   */
  async send(options: SendEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (!this.apiKey) {
      console.warn('[EMAIL] Email service not configured - RESEND_API_KEY missing');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text || this.htmlToText(options.html),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[EMAIL] Send failed:', response.status, errorData);
        return { success: false, error: `Email send failed: ${response.status}` };
      }

      const result = await response.json();
      console.log('[EMAIL] Sent successfully:', result.id);
      return { success: true, messageId: result.id };
    } catch (error: any) {
      console.error('[EMAIL] Send error:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }
  }

  /**
   * Send password reset code email
   */
  async sendPasswordResetCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #000000;">
                Mukoko <span style="color: #00A651;">News</span>
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                Reset Your Password
              </h2>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a4a4a;">
                You requested to reset your password. Use the code below to complete the process. This code expires in 15 minutes.
              </p>

              <!-- Code Box -->
              <div style="background-color: #f8f9fa; border: 2px dashed #00A651; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace;">
                  ${code}
                </span>
              </div>

              <p style="margin: 0 0 8px; font-size: 14px; color: #666666;">
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 14px; color: #666666;">
                For security, this code will expire in 15 minutes.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8f9fa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 12px; color: #888888; text-align: center;">
                © ${new Date().getFullYear()} Mukoko News. Zimbabwe's Modern News Platform.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Mukoko News - Password Reset

Your password reset code is: ${code}

This code expires in 15 minutes.

If you didn't request this, you can safely ignore this email.

© ${new Date().getFullYear()} Mukoko News`;

    return this.send({
      to: email,
      subject: 'Reset Your Password - Mukoko News',
      html,
      text,
    });
  }

  /**
   * Send email verification code
   */
  async sendVerificationCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #000000;">
                Mukoko <span style="color: #00A651;">News</span>
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                Verify Your Email
              </h2>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a4a4a;">
                Welcome to Mukoko News! Please use the code below to verify your email address.
              </p>

              <!-- Code Box -->
              <div style="background-color: #f8f9fa; border: 2px dashed #00A651; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace;">
                  ${code}
                </span>
              </div>

              <p style="margin: 0; font-size: 14px; color: #666666;">
                This code expires in 10 minutes.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8f9fa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 12px; color: #888888; text-align: center;">
                © ${new Date().getFullYear()} Mukoko News. Zimbabwe's Modern News Platform.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Welcome to Mukoko News!

Your verification code is: ${code}

This code expires in 10 minutes.

© ${new Date().getFullYear()} Mukoko News`;

    return this.send({
      to: email,
      subject: 'Verify Your Email - Mukoko News',
      html,
      text,
    });
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(email: string, displayName?: string): Promise<{ success: boolean; error?: string }> {
    const name = displayName || 'there';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mukoko News</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header with Zimbabwe colors -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #00A651 0%, #006400 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                Welcome! 🎉
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                Hey ${name}!
              </h2>
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #4a4a4a;">
                Welcome to <strong>Mukoko News</strong> – Zimbabwe's modern news platform. We're excited to have you!
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a4a4a;">
                Stay informed with the latest news, stories, and updates from Zimbabwe and beyond.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://news.mukoko.com" style="display: inline-block; padding: 14px 32px; background-color: #00A651; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 15px;">
                  Start Reading →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8f9fa; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 12px; color: #888888; text-align: center;">
                © ${new Date().getFullYear()} Mukoko News. Zimbabwe's Modern News Platform.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Welcome to Mukoko News, ${name}!

We're excited to have you join Zimbabwe's modern news platform.

Stay informed with the latest news, stories, and updates from Zimbabwe and beyond.

Visit https://news.mukoko.com to start reading!

© ${new Date().getFullYear()} Mukoko News`;

    return this.send({
      to: email,
      subject: 'Welcome to Mukoko News! 🎉',
      html,
      text,
    });
  }

  /**
   * Convert HTML to plain text (basic)
   * Uses iterative replacement to handle edge cases securely
   */
  private htmlToText(html: string): string {
    let text = html;

    // Iteratively remove style tags (handles whitespace variations)
    let prevLength = 0;
    while (text.length !== prevLength) {
      prevLength = text.length;
      text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style\s*>/gi, '');
    }

    // Iteratively remove script tags (handles whitespace variations)
    prevLength = 0;
    while (text.length !== prevLength) {
      prevLength = text.length;
      text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '');
    }

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }
}
