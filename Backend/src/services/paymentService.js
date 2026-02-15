const config = require('../config/payment');

const getPaymentChannelsForCurrency = (currency = 'NGN') => {
  const normalizedCurrency = String(currency || 'NGN').toUpperCase();
  if (normalizedCurrency === 'USD') {
    return ['card'];
  }
  return ['transfer', 'bank', 'ussd', 'card'];
};

const initializeTransaction = async (email, amount, reference, metadata = {}, currency = 'NGN', callbackUrl = undefined) => {
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
      amount: Math.round(Number(amount) * 100),
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

const verifyTransaction = async (reference) => {
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

module.exports = { initializeTransaction, verifyTransaction };
