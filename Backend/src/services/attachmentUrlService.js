const crypto = require('crypto');

let nonProdSecret = null;

const getSecret = () => {
  const raw = String(process.env.ATTACHMENT_URL_SECRET || process.env.JWT_SECRET || '').trim();
  if (raw) return raw;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ATTACHMENT_URL_SECRET is not configured');
  }
  if (!nonProdSecret) {
    nonProdSecret = crypto.randomBytes(32).toString('hex');
    console.warn('[support] Using generated in-memory attachment signing secret for non-production mode');
  }
  return nonProdSecret;
};

const signPayload = (attachmentId, userId, expiresAt) => {
  const secret = getSecret();
  const payload = `${attachmentId}:${userId}:${expiresAt}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

const createSignedAttachmentUrl = (attachmentId, userId, basePath = '/api/support/attachments') => {
  const ttlSeconds = Number(process.env.ATTACHMENT_URL_TTL_SECONDS || 300);
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const sig = signPayload(attachmentId, userId, expiresAt);
  return `${basePath}/${attachmentId}/download?expires=${expiresAt}&sig=${sig}`;
};

const verifySignedAttachmentUrl = ({ attachmentId, userId, expires, sig }) => {
  if (!expires || !sig) return false;
  if (!/^[a-f0-9]+$/i.test(String(sig))) return false;
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  let expected;
  try {
    expected = signPayload(attachmentId, userId, expiresAt);
  } catch {
    return false;
  }
  const sigBuffer = Buffer.from(String(sig), 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (sigBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
};

module.exports = {
  createSignedAttachmentUrl,
  verifySignedAttachmentUrl,
};
