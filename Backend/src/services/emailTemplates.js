const getBrandTokens = () => ({
  brandName: process.env.BRAND_NAME || 'Glossy Store',
  supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || '',
  appUrl: process.env.APP_BASE_URL || '#',
  accentPrimary: process.env.BRAND_PRIMARY_COLOR || '#b42318',
  accentSecondary: process.env.BRAND_SECONDARY_COLOR || '#1f2430',
  accentTertiary: process.env.BRAND_TERTIARY_COLOR || '#d4af37',
});

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const baseTemplate = ({ title, preheader, contentHtml, ctaLabel, ctaUrl }) => {
  const t = getBrandTokens();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f1eb;font-family:Segoe UI,Arial,sans-serif;color:#1f2430;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #eadfce;box-shadow:0 18px 40px rgba(31,36,48,0.15);">
            <tr>
              <td style="padding:28px;background:linear-gradient(135deg, ${t.accentSecondary}, ${t.accentPrimary});color:#ffffff;">
                <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:700;letter-spacing:0.4px;">${t.brandName}</h1>
                <p style="margin:8px 0 0 0;font-size:14px;opacity:0.95;">Luxury Shopping. Hardened Security.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px 8px 32px;">${contentHtml}</td>
            </tr>
            ${ctaLabel && ctaUrl ? `
            <tr>
              <td style="padding:8px 32px 24px 32px;">
                <a href="${ctaUrl}" style="display:inline-block;background:${t.accentPrimary};color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-size:14px;font-weight:600;">${ctaLabel}</a>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding:18px 32px 28px 32px;background:#faf7f2;border-top:1px solid #f0e6d6;">
                <p style="margin:0;font-size:12px;color:#5b6370;line-height:1.6;">
                  Need help? Contact us at <a href="mailto:${t.supportEmail}" style="color:${t.accentSecondary};text-decoration:none;">${t.supportEmail}</a><br/>
                  &copy; ${new Date().getFullYear()} ${t.brandName}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};

const otpPurposeText = {
  registration: 'Complete your registration',
  login: 'Confirm your sign-in',
  forgot_password: 'Reset your password securely',
  delete_account: 'Confirm account deletion request',
};

const renderOtpTemplate = ({ otp, purpose }) => {
  const t = getBrandTokens();
  const action = otpPurposeText[purpose] || 'Confirm your secure action';
  const adminHint = purpose === 'login'
    ? '<p style="margin:14px 0 0 0;font-size:13px;color:#5b6370;line-height:1.6;">Administrative access always requires OTP verification.</p>'
    : '';

  return baseTemplate({
    title: `${t.brandName} Security Code`,
    preheader: `${action} with this one-time verification code.`,
    contentHtml: `
      <h2 style="margin:0 0 12px 0;font-size:24px;color:#141926;">${action}</h2>
      <p style="margin:0 0 16px 0;font-size:15px;color:#3b4352;line-height:1.7;">
        For your security, use the verification code below. This code expires in 10 minutes and can only be used once.
      </p>
      <div style="margin:18px 0 20px 0;padding:16px;background:#fff7e7;border:1px solid #f2dfba;border-radius:14px;text-align:center;">
        <span style="font-size:34px;letter-spacing:9px;font-weight:700;color:${t.accentPrimary};">${otp}</span>
      </div>
      <p style="margin:0 0 6px 0;font-size:13px;color:#5b6370;line-height:1.6;">
        If you did not request this action, secure your account immediately by changing your password.
      </p>
      ${adminHint}`,
    ctaLabel: 'Open Glossy Store',
    ctaUrl: t.appUrl,
  });
};

const renderWelcomeTemplate = ({ name }) => {
  const t = getBrandTokens();
  return baseTemplate({
    title: `Welcome to ${t.brandName}`,
    preheader: `Your ${t.brandName} account is now active.`,
    contentHtml: `
      <h2 style="margin:0 0 12px 0;font-size:24px;color:#141926;">Welcome, ${escapeHtml(name || 'Valued Customer')}.</h2>
      <p style="margin:0 0 12px 0;font-size:15px;color:#3b4352;line-height:1.7;">
        Your account has been successfully verified. You can now shop curated collections, manage your wishlist, and track every order in real time.
      </p>
      <p style="margin:0;font-size:15px;color:#3b4352;line-height:1.7;">
        We designed your experience to be elegant, secure, and effortless from cart to checkout.
      </p>`,
    ctaLabel: 'Start Shopping',
    ctaUrl: t.appUrl,
  });
};

const renderDeviceChangeTemplate = ({ ipAddress }) => {
  const t = getBrandTokens();
  return baseTemplate({
    title: `${t.brandName} Security Alert`,
    preheader: 'A new device or network was detected on your account.',
    contentHtml: `
      <h2 style="margin:0 0 12px 0;font-size:24px;color:#141926;">New login environment detected</h2>
      <p style="margin:0 0 14px 0;font-size:15px;color:#3b4352;line-height:1.7;">
        We detected a login attempt from a new IP address:
      </p>
      <p style="margin:0 0 18px 0;font-size:16px;color:${t.accentPrimary};font-weight:700;">${escapeHtml(ipAddress)}</p>
      <p style="margin:0;font-size:14px;color:#5b6370;line-height:1.7;">
        If this was you, continue with your OTP verification. If this was not you, reset your password immediately and contact support.
      </p>`,
    ctaLabel: 'Secure Account',
    ctaUrl: `${t.appUrl}/security`,
  });
};

const renderContactReplyTemplate = ({ name, reply }) => {
  const t = getBrandTokens();
  return baseTemplate({
    title: `${t.brandName} Support Reply`,
    preheader: 'Our support team has replied to your message.',
    contentHtml: `
      <h2 style="margin:0 0 12px 0;font-size:24px;color:#141926;">Hello ${escapeHtml(name || 'there')},</h2>
      <p style="margin:0 0 12px 0;font-size:15px;color:#3b4352;line-height:1.7;">
        Thank you for contacting ${t.brandName}. Our team has reviewed your message and provided the response below:
      </p>
      <div style="padding:16px 18px;background:#f8fbff;border:1px solid #d7e3f8;border-radius:14px;">
        <p style="margin:0;font-size:14px;color:#243047;line-height:1.8;">${escapeHtml(reply)}</p>
      </div>`,
    ctaLabel: 'Visit Glossy Store',
    ctaUrl: t.appUrl,
  });
};

const formatPrice = (amount, currency = 'NGN') => {
  const value = Number(amount || 0);
  return `${currency} ${value.toFixed(2)}`;
};

const renderWeeklyMarketingTemplate = ({ products = [] }) => {
  const t = getBrandTokens();
  const currency = process.env.BRAND_CURRENCY || 'NGN';
  const safeProducts = Array.isArray(products) ? products.slice(0, 12) : [];
  const itemsHtml = safeProducts.map((product, index) => {
    const name = escapeHtml(product?.name || 'Product');
    const url = escapeHtml(product?.url || t.appUrl);
    const price = formatPrice(product?.price, currency);
    return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid ${t.accentSecondary};">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size:14px;color:${t.accentSecondary};width:30px;">${index + 1}.</td>
              <td style="font-size:15px;color:${t.accentSecondary};font-weight:600;line-height:1.5;">
                <a href="${url}" style="color:${t.accentSecondary};text-decoration:none;">${name}</a>
              </td>
              <td style="font-size:15px;color:${t.accentPrimary};font-weight:700;text-align:right;white-space:nowrap;">${price}</td>
            </tr>
            <tr>
              <td></td>
              <td colspan="2" style="padding-top:6px;">
                <a href="${url}" style="display:inline-block;padding:7px 12px;background:${t.accentPrimary};color:#ffffff;text-decoration:none;border-radius:6px;font-size:12px;font-weight:600;">View Product</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join('');

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t.brandName} Weekly Picks</title>
  </head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:Segoe UI,Arial,sans-serif;color:${t.accentSecondary};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#ffffff;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:2px solid ${t.accentSecondary};">
            <tr>
              <td style="padding:20px 24px;background:${t.accentSecondary};">
                <h1 style="margin:0;font-size:26px;line-height:1.2;color:#ffffff;">${t.brandName}</h1>
                <p style="margin:8px 0 0 0;font-size:13px;color:#ffffff;">Weekly product highlights</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 24px 10px 24px;">
                <h2 style="margin:0 0 10px 0;font-size:22px;color:${t.accentSecondary};">Latest 12 Products</h2>
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:${t.accentSecondary};">
                  Discover what is new this week. Each product below links directly to its page.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${itemsHtml || '<tr><td style="font-size:14px;color:' + t.accentSecondary + ';">No products available right now.</td></tr>'}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 24px 22px 24px;background:${t.accentSecondary};">
                <a href="${escapeHtml(t.appUrl)}" style="display:inline-block;padding:10px 16px;background:${t.accentPrimary};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700;">Shop All Products</a>
                <p style="margin:12px 0 0 0;font-size:12px;line-height:1.6;color:#ffffff;">
                  ${t.brandName} | ${new Date().getFullYear()}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};

const renderPaymentReceiptTemplate = ({ name, email, amount, currency, status, reference, eventLabel, occurredAt }) => {
  const t = templateVars();
  const safeName = name || 'Customer';
  const dateText = occurredAt ? new Date(occurredAt).toLocaleString() : new Date().toLocaleString();
  const displayAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;
  return wrapTemplate({
    ...t,
    title: `${t.brandName} Payment Receipt`,
    preheader: `Payment ${status} for ${t.brandName}`,
    body: `
      <h2 style="margin:0 0 12px 0;color:${t.textPrimary};">Hello ${safeName},</h2>
      <p style="margin:0 0 14px 0;color:${t.textSecondary};line-height:1.6;">
        We received a payment event from Squad. Here are the details:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:8px 0;color:${t.textSecondary};">Event</td>
          <td style="padding:8px 0;color:${t.textPrimary};font-weight:600;">${eventLabel}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${t.textSecondary};">Status</td>
          <td style="padding:8px 0;color:${t.textPrimary};font-weight:600;">${status}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${t.textSecondary};">Amount</td>
          <td style="padding:8px 0;color:${t.textPrimary};font-weight:600;">${currency} ${displayAmount}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${t.textSecondary};">Reference</td>
          <td style="padding:8px 0;color:${t.textPrimary};font-weight:600;">${reference || '-'}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${t.textSecondary};">Date</td>
          <td style="padding:8px 0;color:${t.textPrimary};font-weight:600;">${dateText}</td>
        </tr>
      </table>
      <p style="margin:0 0 8px 0;color:${t.textSecondary};line-height:1.6;">
        If you have questions, reply to this email or contact ${t.supportEmail}.
      </p>
      <p style="margin:0;color:${t.textSecondary};line-height:1.6;">
        Thanks for shopping with ${t.brandName}.
      </p>
    `,
  });
};

module.exports = {
  renderOtpTemplate,
  renderWelcomeTemplate,
  renderDeviceChangeTemplate,
  renderContactReplyTemplate,
  renderWeeklyMarketingTemplate,
  renderPaymentReceiptTemplate,
};
