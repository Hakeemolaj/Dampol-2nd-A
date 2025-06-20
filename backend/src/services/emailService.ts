import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // For development, log emails instead of sending
    return nodemailer.createTransporter({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.text || options.html);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('📧 Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const subject = `Welcome to ${process.env.BARANGAY_NAME}!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1d4ed8;">Welcome to ${process.env.BARANGAY_NAME}!</h1>
      <p>Dear ${name},</p>
      <p>Thank you for registering with our Barangay Web Application. Your account has been successfully created.</p>
      <p>You can now access our online services including:</p>
      <ul>
        <li>Document requests (Barangay Clearance, Certificates, etc.)</li>
        <li>Community announcements and updates</li>
        <li>Contact information for barangay officials</li>
        <li>Emergency hotlines and services</li>
      </ul>
      <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
      <p>Best regards,<br>${process.env.BARANGAY_NAME} Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetUrl: string
): Promise<void> => {
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1d4ed8;">Password Reset Request</h1>
      <p>Dear ${name},</p>
      <p>You have requested to reset your password for your ${process.env.BARANGAY_NAME} account.</p>
      <p>Please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>${process.env.BARANGAY_NAME} Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

export const sendDocumentStatusEmail = async (
  email: string,
  name: string,
  documentType: string,
  status: string,
  requestNumber: string
): Promise<void> => {
  const subject = `Document Request Update - ${requestNumber}`;
  const statusColor = status === 'approved' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1d4ed8;">Document Request Update</h1>
      <p>Dear ${name},</p>
      <p>Your document request has been updated:</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Request Number:</strong> ${requestNumber}</p>
        <p><strong>Document Type:</strong> ${documentType}</p>
        <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status.toUpperCase()}</span></p>
      </div>
      <p>You can check the full details of your request by logging into your account on our website.</p>
      <p>If you have any questions, please contact our office during business hours.</p>
      <p>Best regards,<br>${process.env.BARANGAY_NAME} Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};
