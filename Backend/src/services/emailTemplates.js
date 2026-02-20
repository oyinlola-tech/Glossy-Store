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
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${t.accentSecondary};font-family:Segoe UI,Arial,sans-serif;color:${t.accentSecondary};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:${t.accentSecondary};">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:${t.accentTertiary};border:2px solid ${t.accentTertiary};">
            <tr>
              <td style="padding:24px;background:${t.accentSecondary};">
                <h1 style="margin:0;color:${t.accentTertiary};font-size:26px;line-height:1.2;font-weight:700;">${escapeHtml(t.brandName)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;border-top:4px solid ${t.accentPrimary};">
                ${contentHtml}
              </td>
            </tr>
            ${ctaLabel && ctaUrl ? `
              <tr>
                <td style="padding:0 24px 24px 24px;">
                  <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:${t.accentPrimary};color:${t.accentTertiary};text-decoration:none;padding:12px 18px;font-size:14px;font-weight:700;">${escapeHtml(ctaLabel)}</a>
                </td>
              </tr>
            ` : ''}
            <tr>
              <td style="padding:16px 24px;background:${t.accentSecondary};border-top:2px solid ${t.accentTertiary};">
                <p style="margin:0;color:${t.accentTertiary};font-size:12px;line-height:1.6;">
                  Need help? Contact us at
                  <a href="mailto:${escapeHtml(t.supportEmail)}" style="color:${t.accentTertiary};text-decoration:underline;">${escapeHtml(t.supportEmail)}</a><br/>
                  &copy; ${new Date().getFullYear()} ${escapeHtml(t.brandName)}
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

  return baseTemplate({
    title: `${t.brandName} Security Code`,
    preheader: `${action} with this one-time verification code.`,
    contentHtml: `
      <h2 style="margin:0 0 12px 0;color:${t.accentSecondary};font-size:24px;">${escapeHtml(action)}</h2>
      <p style="margin:0 0 14px 0;color:${t.accentSecondary};font-size:15px;line-height:1.7;">
        Use the code below. It expires in 10 minutes and can only be used once.
      </p>
      <div style="padding:16px;border:2px solid ${t.accentPrimary};background:${t.accentTertiary};text-align:center;margin:0 0 14px 0;">
        <span style="font-size:32px;letter-spacing:8px;font-weight:700;color:${t.accentPrimary};">${escapeHtml(otp)}</span>
      </div>
      <p style="margin:0;color:${t.accentSecondary};font-size:13px;line-height:1.6;">
        If you did not request this, secure your account immediately.
      </p>
    `,
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
      <h2 style="margin:0 0 12px 0;color:${t.accentSecondary};font-size:24px;">Welcome, ${escapeHtml(name || 'Valued Customer')}.</h2>
      <p style="margin:0;color:${t.accentSecondary};font-size:15px;line-height:1.7;">
        Your account has been verified. Start exploring new arrivals and track every order in one place.
      </p>
    `,
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
      <h2 style="margin:0 0 12px 0;color:${t.accentSecondary};font-size:24px;">New login environment detected</h2>
      <p style="margin:0 0 10px 0;color:${t.accentSecondary};font-size:15px;line-height:1.7;">
        We detected a login attempt from this IP address:
      </p>
      <p style="margin:0 0 14px 0;color:${t.accentPrimary};font-size:16px;font-weight:700;">${escapeHtml(ipAddress || '-')}</p>
      <p style="margin:0;color:${t.accentSecondary};font-size:14px;line-height:1.7;">
        If this was not you, reset your password and contact support.
      </p>
    `,
    ctaLabel: 'Secure Account',
    ctaUrl: t.appUrl,
  });
};

const renderContactReplyTemplate = ({ name, reply }) => {
  const t = getBrandTokens();
  return baseTemplate({
    title: `${t.brandName} Support Reply`,
    preheader: 'Our support team has replied to your message.',
    contentHtml: `
      <h2 style="margin:0 0 12px 0;color:${t.accentSecondary};font-size:24px;">Hello ${escapeHtml(name || 'there')},</h2>
      <p style="margin:0 0 12px 0;color:${t.accentSecondary};font-size:15px;line-height:1.7;">
        Our team has reviewed your message and replied below:
      </p>
      <div style="padding:14px;border:2px solid ${t.accentTertiary};background:${t.accentTertiary};">
        <p style="margin:0;color:${t.accentSecondary};font-size:14px;line-height:1.8;">${escapeHtml(reply || '')}</p>
      </div>
    `,
    ctaLabel: 'Visit Glossy Store',
    ctaUrl: t.appUrl,
  });
};

const formatPrice = (amount, currency = 'NGN') => {
  const value = Number(amount || 0);
  return `${currency} ${value.toFixed(2)}`;
};

const formatDateLabel = (input) => {
  if (!input) return '';
  const value = new Date(input);
  if (Number.isNaN(value.getTime())) return '';
  return value.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const renderWeeklyMarketingTemplate = ({ userName, products = [], campaign = {} }) => {
  const t = getBrandTokens();
  const currency = process.env.BRAND_CURRENCY || 'NGN';
  const safeProducts = Array.isArray(products) ? products.slice(0, 12) : [];
  const firstName = String(userName || '').trim().split(/\s+/)[0] || 'there';
  const promoEnds = formatDateLabel(campaign?.promoEndsAt);
  const hero = safeProducts[0] || null;

  const itemsHtml = safeProducts.map((product, index) => {
    const name = escapeHtml(product?.name || 'Product');
    const url = escapeHtml(product?.url || t.appUrl);
    const price = escapeHtml(formatPrice(product?.price, currency));
    const anchor = Number(product?.originalPrice || 0);
    const current = Number(product?.price || 0);
    const showAnchor = anchor > current;
    const badge = escapeHtml(product?.badge || 'New this week');
    const rating = Number(product?.averageRating || 0);
    const reviewText = rating > 0 ? `${rating.toFixed(1)}/5 rated` : 'Trending pick';
    const stock = Number(product?.stock || 0);
    const stockText = stock > 0 && stock <= 5 ? `Only ${stock} left` : reviewText;

    return `
      <tr>
        <td style="padding:12px;border:1px solid ${t.accentTertiary};">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="width:26px;color:${t.accentSecondary};font-size:13px;font-weight:700;vertical-align:top;padding-top:4px;">${index + 1}.</td>
              <td style="color:${t.accentSecondary};font-size:14px;line-height:1.5;vertical-align:top;">
                <p style="margin:0 0 6px 0;">
                  <span style="display:inline-block;background:${t.accentTertiary};color:${t.accentSecondary};padding:2px 8px;font-size:11px;font-weight:700;">${badge}</span>
                </p>
                <a href="${url}" style="color:${t.accentSecondary};text-decoration:none;font-weight:700;">${name}</a><br/>
                <span style="color:${t.accentPrimary};font-weight:700;">${price}</span>
                ${showAnchor ? `<span style="color:${t.accentSecondary};font-size:12px;padding-left:6px;text-decoration:line-through;">${escapeHtml(formatPrice(anchor, currency))}</span>` : ''}
                <p style="margin:6px 0 0 0;color:${t.accentSecondary};font-size:12px;">${escapeHtml(stockText)}</p>
              </td>
              <td style="text-align:right;vertical-align:top;">
                <a href="${url}" style="display:inline-block;padding:8px 12px;background:${t.accentPrimary};color:${t.accentTertiary};text-decoration:none;font-size:12px;font-weight:700;">Buy Now</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  return baseTemplate({
    title: `${t.brandName} Weekly High-Converting Picks`,
    preheader: 'Handpicked products with clear value and direct checkout links.',
    contentHtml: `
      <h2 style="margin:0 0 8px 0;color:${t.accentSecondary};font-size:22px;">Hi ${escapeHtml(firstName)}, your weekly picks are in.</h2>
      <p style="margin:0 0 12px 0;color:${t.accentSecondary};font-size:14px;line-height:1.7;">
        We selected high-performing items based on demand, ratings, and stock movement so you can find the best deals quickly.
      </p>
      ${campaign?.promoCode ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 14px 0;border:2px solid ${t.accentPrimary};">
        <tr>
          <td style="padding:12px;background:${t.accentTertiary};color:${t.accentSecondary};font-size:13px;line-height:1.6;">
            <strong>Weekly offer:</strong> Use code <strong>${escapeHtml(campaign.promoCode)}</strong>
            ${promoEnds ? ` before <strong>${escapeHtml(promoEnds)}</strong>` : ''}.
          </td>
        </tr>
      </table>
      ` : ''}
      ${hero ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 14px 0;border:2px solid ${t.accentTertiary};">
        <tr>
          <td style="padding:12px;">
            <p style="margin:0 0 6px 0;color:${t.accentSecondary};font-size:12px;font-weight:700;">SPOTLIGHT PICK</p>
            <p style="margin:0 0 6px 0;color:${t.accentSecondary};font-size:18px;font-weight:700;">${escapeHtml(hero.name || 'Featured product')}</p>
            <p style="margin:0 0 10px 0;color:${t.accentPrimary};font-size:16px;font-weight:700;">${escapeHtml(formatPrice(hero.price, currency))}</p>
            <a href="${escapeHtml(hero.url || t.appUrl)}" style="display:inline-block;background:${t.accentPrimary};color:${t.accentTertiary};text-decoration:none;padding:10px 14px;font-size:12px;font-weight:700;">
              Shop Spotlight
            </a>
          </td>
        </tr>
      </table>
      ` : ''}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px;">
        ${itemsHtml || `<tr><td style="color:${t.accentSecondary};font-size:14px;">No products available right now.</td></tr>`}
      </table>
    `,
    ctaLabel: 'See All Products',
    ctaUrl: campaign?.ctaUrl || t.appUrl,
  });
};

const renderPaymentReceiptTemplate = ({ name, amount, currency, status, reference, eventLabel, occurredAt }) => {
  const t = getBrandTokens();
  const safeName = escapeHtml(name || 'Customer');
  const dateText = escapeHtml(occurredAt ? new Date(occurredAt).toLocaleString() : new Date().toLocaleString());
  const displayAmount = Number.isFinite(Number(amount)) ? Number(amount).toFixed(2) : escapeHtml(amount || '0.00');

  return baseTemplate({
    title: `${t.brandName} Payment Receipt`,
    preheader: `Payment ${escapeHtml(status || 'update')} for ${t.brandName}`,
    contentHtml: `
      <h2 style="margin:0 0 12px 0;color:${t.accentSecondary};font-size:24px;">Hello ${safeName},</h2>
      <p style="margin:0 0 12px 0;color:${t.accentSecondary};font-size:15px;line-height:1.7;">
        We received a payment event. Details are below.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:2px solid ${t.accentTertiary};">
        <tr><td style="padding:10px;color:${t.accentSecondary};font-size:14px;">Event</td><td style="padding:10px;color:${t.accentSecondary};font-size:14px;font-weight:700;">${escapeHtml(eventLabel || '-')}</td></tr>
        <tr><td style="padding:10px;color:${t.accentSecondary};font-size:14px;">Status</td><td style="padding:10px;color:${t.accentSecondary};font-size:14px;font-weight:700;">${escapeHtml(status || '-')}</td></tr>
        <tr><td style="padding:10px;color:${t.accentSecondary};font-size:14px;">Amount</td><td style="padding:10px;color:${t.accentSecondary};font-size:14px;font-weight:700;">${escapeHtml(currency || 'NGN')} ${displayAmount}</td></tr>
        <tr><td style="padding:10px;color:${t.accentSecondary};font-size:14px;">Reference</td><td style="padding:10px;color:${t.accentSecondary};font-size:14px;font-weight:700;">${escapeHtml(reference || '-')}</td></tr>
        <tr><td style="padding:10px;color:${t.accentSecondary};font-size:14px;">Date</td><td style="padding:10px;color:${t.accentSecondary};font-size:14px;font-weight:700;">${dateText}</td></tr>
      </table>
    `,
    ctaLabel: 'Open Glossy Store',
    ctaUrl: t.appUrl,
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
