const config = require('../config/payment');

const getPaymentChannelsForCurrency = (currency = 'NGN') => {
  const normalizedCurrency = String(currency || 'NGN').toUpperCase();
  if (normalizedCurrency === 'USD') {
    return ['card'];
  }
  return ['transfer', 'bank', 'ussd', 'card'];
};

const ensureSecret = () => {
  if (!config.squadSecret) {
    const err = new Error('Payment secret key is not configured');
    err.statusCode = 503;
    throw err;
  }
};

const ensureAmount = (amount) => {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    const err = new Error('Payment amount is invalid');
    err.statusCode = 400;
    throw err;
  }
  return numeric;
};

const initializeTransaction = async (email, amount, reference, metadata = {}, currency = 'NGN', callbackUrl = undefined) => {
  ensureSecret();
  const validAmount = ensureAmount(amount);
  const normalizedCurrency = String(currency || 'NGN').toUpperCase();
  const payment_channels = getPaymentChannelsForCurrency(normalizedCurrency);
  const response = await fetch(`${config.squadApiUrl}/transaction/initiate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.squadSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(validAmount * 100),
      currency: normalizedCurrency,
      payment_channels,
      transaction_ref: reference,
      callback_url: callbackUrl,
      metadata,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Payment initialization failed');
  }
  return data;
};

const chargeWithSavedCard = async (
  email,
  amount,
  reference,
  currency = 'NGN',
  cardToken,
  metadata = {},
  callbackUrl = undefined
) => {
  ensureSecret();
  const validAmount = ensureAmount(amount);
  const normalizedCurrency = String(currency || 'NGN').toUpperCase();
  const response = await fetch(`${config.squadApiUrl}${config.squadTokenChargePath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.squadSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(validAmount * 100),
      currency: normalizedCurrency,
      transaction_ref: reference,
      callback_url: callbackUrl,
      card_token: cardToken,
      metadata,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Saved card charge failed');
  }
  return data;
};

const verifyTransaction = async (reference) => {
  ensureSecret();
  const response = await fetch(`${config.squadApiUrl}/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.squadSecret}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Verification failed');
  }
  return data;
};

module.exports = { initializeTransaction, chargeWithSavedCard, verifyTransaction };
