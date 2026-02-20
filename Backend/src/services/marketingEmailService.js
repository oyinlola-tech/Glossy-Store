const { User, Product, ProductImage } = require('../models');
const { sendWeeklyMarketingEmail, isEmailConfigured } = require('./emailService');
const { ensureProductSlug } = require('./productSlugService');

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

const computeProductScore = (product) => {
  const now = Date.now();
  const createdAt = new Date(product.created_at || product.createdAt || now).getTime();
  const daysOld = Math.max(0, (now - createdAt) / (24 * 60 * 60 * 1000));
  const recencyScore = Math.max(0, 18 - daysOld);
  const ratingScore = Number(product.average_rating || 0) * 2.2;
  const hasPriceAnchor = Number(product.compare_at_price || 0) > Number(product.base_price || 0);
  const discountScore = hasPriceAnchor ? 3 : 0;
  const stock = Number(product.stock || 0);
  const stockScore = stock > 20 ? 2 : stock > 0 ? 1 : -100;
  return recencyScore + ratingScore + discountScore + stockScore;
};

const getProductUrl = (product) => {
  const appBaseUrl = String(process.env.APP_BASE_URL || '').trim() || 'http://localhost:5173';
  return `${appBaseUrl.replace(/\/+$/, '')}/products/${encodeURIComponent(product.slug)}`;
};

const getCampaignProducts = async () => {
  const sourceLimit = Math.max(20, parseNumber(process.env.MARKETING_EMAIL_SOURCE_LIMIT, 48));
  const campaignLimit = Math.max(4, parseNumber(process.env.MARKETING_EMAIL_PRODUCT_LIMIT, 12));
  const products = await Product.findAll({
    order: [['created_at', 'DESC']],
    limit: sourceLimit,
    attributes: ['id', 'name', 'slug', 'base_price', 'compare_at_price', 'average_rating', 'stock', 'discount_label', 'created_at'],
    include: [{ model: ProductImage, attributes: ['image_url'], required: false }],
  });
  const enriched = [];
  for (const productRecord of products) {
    const product = productRecord.toJSON();
    if (Number(product.stock || 0) <= 0) continue;

    const price = Number(product.base_price || 0);
    const originalPrice = Number(product.compare_at_price || 0);
    const slug = await ensureProductSlug(productRecord);
    const image = Array.isArray(product.ProductImages) ? product.ProductImages[0]?.image_url || null : null;
    const hasPriceAnchor = originalPrice > price;
    const rating = Number(product.average_rating || 0);
    const stock = Number(product.stock || 0);
    const badge = hasPriceAnchor
      ? `Save ${Math.max(1, Math.round(((originalPrice - price) / originalPrice) * 100))}%`
      : rating >= 4.5
        ? 'Top rated'
        : stock <= 5
          ? 'Low stock'
          : 'New this week';

    enriched.push({
      id: product.id,
      name: product.name,
      price,
      originalPrice: hasPriceAnchor ? originalPrice : null,
      averageRating: rating || null,
      stock,
      image,
      badge,
      slug,
      url: getProductUrl({ ...product, slug }),
      score: computeProductScore(product),
      createdAt: product.created_at || product.createdAt || null,
    });
  }
  return enriched
    .sort((a, b) => (b.score - a.score) || (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()))
    .slice(0, campaignLimit);
};

const getRecipients = async () => {
  return User.findAll({
    where: { email_verified: true, role: 'user' },
    attributes: ['id', 'email', 'name'],
  });
};

const buildCampaignMeta = () => {
  const appBaseUrl = String(process.env.APP_BASE_URL || '').trim() || 'http://localhost:5173';
  const promoCode = String(process.env.MARKETING_EMAIL_PROMO_CODE || '').trim();
  const promoDays = Math.max(1, parseNumber(process.env.MARKETING_EMAIL_PROMO_DAYS, 5));
  const promoEndsAt = new Date(Date.now() + promoDays * 24 * 60 * 60 * 1000).toISOString();
  return {
    promoCode: promoCode || null,
    promoEndsAt,
    ctaUrl: `${appBaseUrl.replace(/\/+$/, '')}/products`,
  };
};

const sendWeeklyMarketingCampaign = async () => {
  if (!isEmailConfigured()) {
    console.warn('[marketing-email] SMTP not configured. Weekly campaign skipped.');
    return { sent: 0, failed: 0, skipped: true };
  }

  const [products, recipients] = await Promise.all([
    getCampaignProducts(),
    getRecipients(),
  ]);
  const campaign = buildCampaignMeta();

  if (!products.length || !recipients.length) {
    return { sent: 0, failed: 0, skipped: true };
  }

  let sent = 0;
  let failed = 0;
  for (const user of recipients) {
    try {
      await sendWeeklyMarketingEmail({
        email: user.email,
        userName: user.name,
        products,
        campaign,
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
