const transporter = require('../config/email');
const {
  renderOtpTemplate,
  renderWelcomeTemplate,
  renderDeviceChangeTemplate,
  renderContactReplyTemplate,
  renderPaymentReceiptTemplate,
  renderWeeklyMarketingTemplate,
} = require('./emailTemplates');

const isEmailConfigured = () => {
  const host = String(process.env.EMAIL_HOST || '').trim();
  const user = String(process.env.EMAIL_USER || '').trim();
  const pass = String(process.env.EMAIL_PASS || '').trim();
  return Boolean(host && user && pass);
};

const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured()) {
    console.warn('[email] SMTP not configured. Skipping email send.');
    return { skipped: true };
  }
  const fromName = process.env.EMAIL_FROM_NAME || process.env.BRAND_NAME || 'Glossy Store';
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER;
  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otp, purpose) => {
  const subject = `${process.env.BRAND_NAME || 'Glossy Store'} verification code`;
  const html = renderOtpTemplate({ otp, purpose });
  return sendEmail({ to: email, subject, html });
};

const sendWelcomeEmail = async (email, name) => {
  const subject = `Welcome to ${process.env.BRAND_NAME || 'Glossy Store'}`;
  const html = renderWelcomeTemplate({ name });
  return sendEmail({ to: email, subject, html });
};

const sendDeviceChangeEmail = async (email, ip) => {
  const subject = `${process.env.BRAND_NAME || 'Glossy Store'} security alert`;
  const html = renderDeviceChangeTemplate({ ipAddress: ip });
  return sendEmail({ to: email, subject, html });
};

const sendContactReplyEmail = async (email, name, reply) => {
  const subject = `${process.env.BRAND_NAME || 'Glossy Store'} support response`;
  const html = renderContactReplyTemplate({ name, reply });
  return sendEmail({ to: email, subject, html });
};

const sendPaymentReceiptEmail = async ({ email, name, amount, currency, status, reference, eventLabel, occurredAt }) => {
  const subject = `${process.env.BRAND_NAME || 'Glossy Store'} payment update`;
  const html = renderPaymentReceiptTemplate({ name, email, amount, currency, status, reference, eventLabel, occurredAt });
  return sendEmail({ to: email, subject, html });
};

const sendWeeklyMarketingEmail = async ({ email, userName, products, campaign }) => {
  const brand = process.env.BRAND_NAME || 'Glossy Store';
  const productCount = Array.isArray(products) ? products.length : 0;
  const subjectPrefix = campaign?.promoCode ? 'This week only' : 'Fresh this week';
  const subject = `${subjectPrefix}: ${productCount} picks from ${brand}`;
  const html = renderWeeklyMarketingTemplate({ userName, products, campaign });
  return sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendDeviceChangeEmail,
  sendContactReplyEmail,
  sendPaymentReceiptEmail,
  sendWeeklyMarketingEmail,
  isEmailConfigured,
};
