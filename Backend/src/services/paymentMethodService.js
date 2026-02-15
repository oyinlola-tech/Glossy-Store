const crypto = require('crypto');
const { PaymentMethod, sequelize } = require('../models');

let nonProdKey = null;

const getEncryptionKey = () => {
  const raw = String(process.env.PAYMENT_TOKEN_SECRET || '').trim();
  if (raw) {
    return crypto.createHash('sha256').update(raw).digest();
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('PAYMENT_TOKEN_SECRET is not configured');
  }
  if (!nonProdKey) {
    nonProdKey = crypto.randomBytes(32);
    console.warn('[payments] Using generated in-memory payment token key for non-production mode');
  }
  return nonProdKey;
};

const fingerprintToken = (token) => crypto
  .createHash('sha256')
  .update(`${String(token)}|${getEncryptionKey().toString('hex')}`)
  .digest('hex');

const encryptToken = (token) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(token), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    v: 1,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted.toString('hex'),
  });
};

const decryptToken = (payload) => {
  const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
  if (!parsed?.iv || !parsed?.tag || !parsed?.data) {
    throw new Error('Invalid encrypted token payload');
  }
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(parsed.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(parsed.tag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.data, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
};

const publicPaymentMethod = (model) => ({
  id: model.id,
  provider: model.provider,
  type: model.type,
  brand: model.brand,
  last4: model.last4,
  exp_month: model.exp_month,
  exp_year: model.exp_year,
  is_default: Boolean(model.is_default),
  is_active: Boolean(model.is_active),
  created_at: model.created_at,
});

const getUserPaymentMethods = async (userId) => {
  const items = await PaymentMethod.findAll({
    where: { user_id: userId, is_active: true },
    order: [['is_default', 'DESC'], ['updated_at', 'DESC']],
  });
  return items.map(publicPaymentMethod);
};

const setDefaultPaymentMethod = async (userId, paymentMethodId) => sequelize.transaction(async (transaction) => {
  const method = await PaymentMethod.findOne({
    where: { id: paymentMethodId, user_id: userId, is_active: true },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!method) return null;
  await PaymentMethod.update({ is_default: false }, { where: { user_id: userId }, transaction });
  method.is_default = true;
  await method.save({ transaction });
  return publicPaymentMethod(method);
});

const deactivatePaymentMethod = async (userId, paymentMethodId) => sequelize.transaction(async (transaction) => {
  const method = await PaymentMethod.findOne({
    where: { id: paymentMethodId, user_id: userId, is_active: true },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!method) return null;
  method.is_active = false;
  method.is_default = false;
  await method.save({ transaction });
  const fallback = await PaymentMethod.findOne({
    where: { user_id: userId, is_active: true },
    order: [['updated_at', 'DESC']],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (fallback && !fallback.is_default) {
    fallback.is_default = true;
    await fallback.save({ transaction });
  }
  return true;
});

const getUserMethodWithToken = async (userId, paymentMethodId) => {
  const method = await PaymentMethod.findOne({
    where: { id: paymentMethodId, user_id: userId, is_active: true, type: 'card', provider: 'squad' },
  });
  if (!method) return null;
  return {
    method: publicPaymentMethod(method),
    token: decryptToken(method.token_encrypted),
  };
};

const upsertSavedCard = async ({
  userId,
  token,
  brand = null,
  last4 = null,
  expMonth = null,
  expYear = null,
  metadata = null,
}) => {
  if (!userId || !token) return null;
  const tokenFingerprint = fingerprintToken(token);
  const encrypted = encryptToken(token);

  return sequelize.transaction(async (transaction) => {
    let method = await PaymentMethod.findOne({
      where: { token_fingerprint: tokenFingerprint },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (method) {
      method.user_id = userId;
      method.brand = brand || method.brand;
      method.last4 = last4 || method.last4;
      method.exp_month = expMonth || method.exp_month;
      method.exp_year = expYear || method.exp_year;
      method.token_encrypted = encrypted;
      method.metadata = metadata || method.metadata;
      method.is_active = true;
      await method.save({ transaction });
      return publicPaymentMethod(method);
    }

    const hasDefault = await PaymentMethod.count({
      where: { user_id: userId, is_active: true, is_default: true },
      transaction,
    });
    method = await PaymentMethod.create({
      user_id: userId,
      provider: 'squad',
      type: 'card',
      brand,
      last4,
      exp_month: expMonth,
      exp_year: expYear,
      token_encrypted: encrypted,
      token_fingerprint: tokenFingerprint,
      is_default: hasDefault === 0,
      is_active: true,
      metadata,
    }, { transaction });
    return publicPaymentMethod(method);
  });
};

module.exports = {
  getUserPaymentMethods,
  setDefaultPaymentMethod,
  deactivatePaymentMethod,
  getUserMethodWithToken,
  upsertSavedCard,
};
