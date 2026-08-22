import nodemailer from 'nodemailer';

/**
 * Creates and returns a Nodemailer transporter.
 * Uses Gmail SMTP if credentials are provided in environment variables,
 * otherwise falls back to Ethereal (test) email for development.
 */
let transporter = null;
let transporterReady = false;

async function getTransporter() {
  if (transporter && transporterReady) return transporter;

  const gmailUser = process.env.SMTP_USER;
  const gmailPass = process.env.SMTP_PASS;

  if (gmailUser && gmailPass) {
    // Production / Real Gmail SMTP
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
    transporterReady = true;
    console.log(`📧 [Email] Gmail SMTP configured for: ${gmailUser}`);
  } else {
    // Fallback: Ethereal test account (emails viewable at ethereal.email)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    transporterReady = true;
    console.log(`📧 [Email] Using Ethereal test account: ${testAccount.user}`);
    console.log(`   ⚠️  To send REAL emails, add SMTP_USER and SMTP_PASS to your .env file`);
  }

  return transporter;
}

/**
 * Sends the HR invitation email with the activation link.
 */
export async function sendInvitationEmail({ to, fullName, role, employeeId, activationUrl, createdBy }) {
  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: `"Dayflow HRMS" <${process.env.SMTP_USER || 'noreply@dayflow.com'}>`,
      to,
      subject: 'Welcome to Dayflow — Complete Your Employee Account Setup',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D1117; border-radius: 16px; overflow: hidden; border: 1px solid #212B3B;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #161D27 0%, #0D1117 100%); padding: 32px 32px 24px 32px; text-align: center;">
            <div style="display: inline-block; background: #00C896; width: 48px; height: 48px; border-radius: 14px; line-height: 48px; font-size: 22px; color: white; font-weight: bold; margin-bottom: 12px;">D</div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #E2E8F0; letter-spacing: -0.5px;">Dayflow HRMS</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748B;">Every workday, perfectly aligned.</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 8px; font-size: 18px; color: #F1F5F9;">Welcome aboard, ${fullName}! 🎉</h2>
            <p style="margin: 0 0 24px; font-size: 13px; color: #94A3B8; line-height: 1.6;">
              You have been invited to join <strong style="color: #00C896;">Dayflow HRMS</strong> as 
              <strong style="color: #00C896;">${role.toUpperCase()}</strong>. 
              Click the button below to verify your email, set your password, and activate your account.
            </p>

            <!-- Employee Details Card -->
            <div style="background: #161D27; border: 1px solid #212B3B; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 12px; color: #94A3B8;">
                <tr><td style="padding: 4px 0; color: #64748B;">Employee ID</td><td style="padding: 4px 0; text-align: right; color: #E2E8F0; font-family: monospace; font-weight: bold;">${employeeId}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748B;">Assigned Role</td><td style="padding: 4px 0; text-align: right; color: #00C896; font-weight: bold;">${role.toUpperCase()}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748B;">Invited By</td><td style="padding: 4px 0; text-align: right; color: #E2E8F0;">${createdBy}</td></tr>
              </table>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${activationUrl}" 
                 style="display: inline-block; background: #00C896; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 36px; border-radius: 12px; letter-spacing: 0.3px;">
                Activate My Account →
              </a>
            </div>

            <!-- Fallback Link -->
            <p style="font-size: 11px; color: #64748B; text-align: center; line-height: 1.5;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${activationUrl}" style="color: #00C896; word-break: break-all;">${activationUrl}</a>
            </p>

            <!-- Security Note -->
            <div style="margin-top: 24px; padding: 12px 16px; background: #1a1a2e; border: 1px solid #2d2d44; border-radius: 10px;">
              <p style="margin: 0; font-size: 11px; color: #94A3B8; line-height: 1.5;">
                🔒 <strong style="color: #E2E8F0;">Security Notice:</strong> This link is single-use and expires in 7 days. 
                Your role and employee ID are locked by HR and cannot be modified during signup. 
                Do not share this link with anyone.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 32px; border-top: 1px solid #212B3B; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #475569;">
              This is an automated email from Dayflow HRMS. If you did not expect this invitation, please ignore this email or contact your HR department.
            </p>
          </div>
        </div>
      `
    });

    // Log preview URL for Ethereal test emails
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 [Email] Preview URL (Ethereal): ${previewUrl}`);
    }

    console.log(`📧 [Email] Invitation sent to ${to} | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, previewUrl: previewUrl || null };
  } catch (error) {
    console.error(`📧 [Email Error] Failed to send to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sends a reminder email for pending invitations.
 */
export async function sendReminderEmail({ to, fullName, activationUrl }) {
  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: `"Dayflow HRMS" <${process.env.SMTP_USER || 'noreply@dayflow.com'}>`,
      to,
      subject: 'Reminder: Your Dayflow Account Is Waiting — Complete Setup Now',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D1117; border-radius: 16px; overflow: hidden; border: 1px solid #212B3B;">
          <div style="background: linear-gradient(135deg, #161D27 0%, #0D1117 100%); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; color: #E2E8F0;">⏰ Friendly Reminder</h1>
            <p style="margin: 8px 0 0; font-size: 13px; color: #94A3B8;">Your Dayflow account is still waiting for you, ${fullName}!</p>
          </div>
          <div style="padding: 32px; text-align: center;">
            <p style="font-size: 13px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px;">
              Your HR administrator invited you to Dayflow HRMS but you haven't completed your account setup yet. 
              Click below to activate your account before the link expires.
            </p>
            <a href="${activationUrl}" 
               style="display: inline-block; background: #00C896; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 36px; border-radius: 12px;">
              Complete My Signup →
            </a>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid #212B3B; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #475569;">Dayflow HRMS — Automated reminder. Do not share this link.</p>
          </div>
        </div>
      `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 [Email Reminder] Preview URL: ${previewUrl}`);
    }
    console.log(`📧 [Email] Reminder sent to ${to} | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, previewUrl: previewUrl || null };
  } catch (error) {
    console.error(`📧 [Email Reminder Error] Failed to send to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sends a password reset email with a secure reset link.
 */
export async function sendPasswordResetEmail(to, fullName, resetLink) {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: `"Dayflow HRMS" <${process.env.SMTP_USER || 'no-reply@dayflow.com'}>`,
      to,
      subject: 'Reset Your Dayflow Password',
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background: #0A0F1A; color: #E2E8F0; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #1E293B;">
          <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 32px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #00C896;">Dayflow HRMS</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748B; letter-spacing: 0.05em;">HUMAN RESOURCE MANAGEMENT SYSTEM</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #F8FAFC; margin: 0 0 12px;">Password Reset Request</h2>
            <p style="color: #94A3B8; margin: 0 0 24px;">Hello <strong style="color: #E2E8F0;">${fullName}</strong>, we received a request to reset your Dayflow account password. Click the button below to set a new password.</p>
            <a href="${resetLink}" style="display: inline-block; background: #00C896; color: #0A0F1A; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; margin-bottom: 24px;">Reset My Password</a>
            <p style="color: #64748B; font-size: 13px; margin: 16px 0 0;">This link expires in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email — your account remains secure.</p>
            <p style="color: #475569; font-size: 12px; margin: 8px 0 0; word-break: break-all;">Or copy this link: <a href="${resetLink}" style="color: #00C896;">${resetLink}</a></p>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid #212B3B; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: #475569;">Dayflow HRMS — This is an automated security email. Do not share the reset link with anyone.</p>
          </div>
        </div>
      `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`📧 [Email Reset] Preview URL: ${previewUrl}`);
    console.log(`📧 [Email] Password reset sent to ${to} | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`📧 [Email Reset Error] Failed to send to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
