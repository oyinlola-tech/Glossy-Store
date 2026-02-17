const DEFAULT_CURRENCY = 'NGN';
const DEFAULT_LOCALE = 'en-NG';
const GEO_TTL_MS = 60 * 60 * 1000;
const RATE_TTL_MS = 30 * 60 * 1000;

const geoCache = new Map();
const rateCache = new Map();

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { 'User-Agent': 'GlossyStore/1.0' } });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
};

const getClientIp = (req) => {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwarded || req.ip || '';
  return ip.replace('::ffff:', '').trim();
};

const isLocalIp = (ip) => ip === '127.0.0.1' || ip === '::1' || ip === '';

const mapLocale = (currency) => {
  if (currency === 'USD') return 'en-US';
  if (currency === 'GBP') return 'en-GB';
  if (currency === 'EUR') return 'en-EU';
  if (currency === 'NGN') return 'en-NG';
  return DEFAULT_LOCALE;
};

const getCurrencyForIp = async (ip) => {
  if (isLocalIp(ip)) return { currency: DEFAULT_CURRENCY, country: 'NG' };

  const cached = geoCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const payload = await fetchJson(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
  const currency = String(payload?.currency || DEFAULT_CURRENCY).toUpperCase();
  const country = String(payload?.country || payload?.country_code || '').toUpperCase();

  const value = { currency, country };
  geoCache.set(ip, { value, expiresAt: Date.now() + GEO_TTL_MS });
  return value;
};

const getRate = async (base, target) => {
  if (!target || target === base) return 1;
  const cacheKey = `${base}:${target}`;
  const cached = rateCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const payload = await fetchJson(`https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(target)}`);
  const rate = Number(payload?.rates?.[target] || 1);
  rateCache.set(cacheKey, { value: rate, expiresAt: Date.now() + RATE_TTL_MS });
  return rate;
};

const getCurrencyProfile = async (req) => {
  try {
    const ip = getClientIp(req);
    const geo = await getCurrencyForIp(ip);
    const currency = geo.currency || DEFAULT_CURRENCY;
    const rate = await getRate(DEFAULT_CURRENCY, currency);
    return {
      base: DEFAULT_CURRENCY,
      currency,
      locale: mapLocale(currency),
      rate,
    };
  } catch {
    return {
      base: DEFAULT_CURRENCY,
      currency: DEFAULT_CURRENCY,
      locale: DEFAULT_LOCALE,
      rate: 1,
    };
  }
};

module.exports = { getCurrencyProfile };
