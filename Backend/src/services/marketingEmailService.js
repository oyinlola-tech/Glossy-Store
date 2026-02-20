const { User, Product } = require('../models');
const { sendWeeklyMarketingEmail, isEmailConfigured } = require('./emailService');

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const parseBoolean = (value, defaultValue = false) => {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(raw);
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getProductUrl = (product) => {
  const appBaseUrl = String(process.env.APP_BASE_URL || '').trim() || 'http://localhost:5173';
  const slugOrId = product.slug || product.id;
  return `${appBaseUrl.replace(/\/+$/, '')}/products/${encodeURIComponent(slugOrId)}`;
};

const getLatestProductsForCampaign = async () => {
  const products = await Product.findAll({
    order: [['created_at', 'DESC']],
    limit: 12,
    attributes: ['id', 'name', 'slug', 'base_price', 'created_at'],
  });
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.base_price,
    url: getProductUrl(product),
  }));
};

const getRecipients = async () => {
  return User.findAll({
    where: { email_verified: true },
    attributes: ['id', 'email'],
  });
};

const sendWeeklyMarketingCampaign = async () => {
  if (!isEmailConfigured()) {
    console.warn('[marketing-email] SMTP not configured. Weekly campaign skipped.');
    return { sent: 0, failed: 0, skipped: true };
  }

  const [products, recipients] = await Promise.all([
    getLatestProductsForCampaign(),
    getRecipients(),
  ]);

  if (!products.length || !recipients.length) {
    return { sent: 0, failed: 0, skipped: true };
  }

  let sent = 0;
  let failed = 0;
  for (const user of recipients) {
    try {
      await sendWeeklyMarketingEmail({
        email: user.email,
        products,
      });
      sent += 1;
    } catch (err) {
      failed += 1;
      console.error(`[marketing-email] Failed for ${user.email}:`, err?.message || err);
    }
  }

  console.log(`[marketing-email] Campaign complete. sent=${sent} failed=${failed}`);
  return { sent, failed, skipped: false };
};

const getNextRunDelayMs = () => {
  const weekday = Math.min(6, Math.max(0, parseNumber(process.env.MARKETING_EMAIL_WEEKDAY, 1))); // 0=Sun..6=Sat
  const hour = Math.min(23, Math.max(0, parseNumber(process.env.MARKETING_EMAIL_HOUR_UTC, 9)));
  const minute = Math.min(59, Math.max(0, parseNumber(process.env.MARKETING_EMAIL_MINUTE_UTC, 0)));

  const now = new Date();
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + ((weekday - now.getUTCDay() + 7) % 7));
  next.setUTCHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 7);
  }
  return next.getTime() - now.getTime();
};

const scheduleWeeklyMarketingEmails = () => {
  const enabled = parseBoolean(process.env.MARKETING_EMAIL_ENABLED, true);
  if (!enabled) {
    console.log('[marketing-email] Weekly marketing email scheduler disabled.');
    return;
  }

  const runNow = parseBoolean(process.env.MARKETING_EMAIL_RUN_ON_START, false);
  if (runNow) {
    void sendWeeklyMarketingCampaign();
  }

  const initialDelay = getNextRunDelayMs();
  console.log(`[marketing-email] Scheduler active. First run in ${Math.round(initialDelay / 1000)}s.`);

  setTimeout(() => {
    void sendWeeklyMarketingCampaign();
    setInterval(() => {
      void sendWeeklyMarketingCampaign();
    }, ONE_WEEK_MS);
  }, initialDelay);
};

module.exports = {
  sendWeeklyMarketingCampaign,
  scheduleWeeklyMarketingEmails,
};
