const crypto = require('crypto');
const { Order, PaystackEvent } = require('../models');
const { verifyTransaction } = require('../services/paymentService');
const { sendPaymentReceiptEmail } = require('../services/emailService');
const { upsertSavedCard } = require('../services/paymentMethodService');

const safeEqualHex = (expectedHex, receivedHex) => {
  if (!expectedHex || !receivedHex) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const received = Buffer.from(String(receivedHex), 'hex');
  if (expected.length === 0 || received.length === 0 || expected.length !== received.length) {
    return false;
  }
  return crypto.timingSafeEqual(expected, received);
};

const extractSavedCardPayload = (payload) => {
  const card = payload?.card || payload?.payment_method || {};
  const authorization = payload?.authorization || {};
  const token = card?.token
    || card?.card_token
    || payload?.card_token
    || authorization?.token
    || authorization?.authorization_code
    || null;
  const last4 = card?.last4 || card?.last_4 || authorization?.last4 || null;
  const brand = card?.brand || card?.card_type || authorization?.brand || null;
  const expMonthRaw = card?.exp_month || authorization?.exp_month || null;
  const expYearRaw = card?.exp_year || authorization?.exp_year || null;
  const expMonth = expMonthRaw ? Number(expMonthRaw) : null;
  const expYear = expYearRaw ? Number(expYearRaw) : null;
  if (!token) return null;
  return {
    token: String(token),
    last4: last4 ? String(last4).slice(-4) : null,
    brand: brand ? String(brand).slice(0, 64) : null,
    expMonth: Number.isInteger(expMonth) ? expMonth : null,
    expYear: Number.isInteger(expYear) ? expYear : null,
    metadata: {
      bank: card?.bank || authorization?.bank || null,
      country: card?.country || authorization?.country || null,
      reusable: authorization?.reusable ?? null,
    },
  };
};

exports.webhook = async (req, res) => {
  try {
    const webhookSecret = process.env.SQUAD_WEBHOOK_SECRET || process.env.SQUAD_SECRET_KEY;
    if (!webhookSecret && process.env.NODE_ENV === 'production') {
      return res.status(503).json({ error: 'Webhook service is unavailable' });
    }

    if (webhookSecret) {
      const signature = req.headers['x-squad-signature'] || '';
      if (!/^[a-f0-9]+$/i.test(String(signature))) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
      const expected = crypto
        .createHmac('sha512', webhookSecret)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest('hex');
      if (!safeEqualHex(expected, signature)) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body;
    const eventType = event?.Event || event?.event || 'unknown';
    const data = event?.Body || event?.data || {};
    const customer = data?.customer || {};
    const reference = data?.transaction_ref || data?.reference || null;
    const amount = typeof data?.amount === 'number' ? data.amount / 100 : null;
    const currency = data?.currency || null;
    const status = data?.status || null;
    const occurredAt = data?.paid_at || data?.created_at || null;

    await PaystackEvent.create({
      event: eventType,
      reference,
      status,
      amount,
      currency,
      customer_email: customer?.email || null,
      customer_name: customer?.first_name ? `${customer.first_name} ${customer.last_name || ''}`.trim() : customer?.email || null,
      occurred_at: occurredAt ? new Date(occurredAt) : null,
      payload: event,
    });

    if ((eventType === 'charge.successful' || eventType === 'transaction.success' || status === 'success') && data?.status === 'success') {
      const orderId = Number(data?.metadata?.orderId);
      if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(200).json({ received: true });
      }
      const order = await Order.findByPk(orderId);
      if (order) {
        order.payment_status = 'success';
        if (order.status === 'pending') order.status = 'paid';
        await order.save();
        const savedCard = extractSavedCardPayload(data);
        if (savedCard) {
          try {
            await upsertSavedCard({
              userId: order.user_id,
              token: savedCard.token,
              brand: savedCard.brand,
              last4: savedCard.last4,
              expMonth: savedCard.expMonth,
              expYear: savedCard.expYear,
              metadata: savedCard.metadata,
            });
          } catch (saveCardErr) {
            console.error('Saving card from webhook failed:', saveCardErr?.message || saveCardErr);
          }
        }
      }
    }

    if (customer?.email) {
      const label = String(eventType).replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      try {
        await sendPaymentReceiptEmail({
          email: customer.email,
          name: customer?.first_name || customer?.email,
          amount,
          currency,
          status: status || eventType,
          reference,
          eventLabel: label,
          occurredAt,
        });
      } catch (emailErr) {
        console.error('Payment receipt email failed:', emailErr?.message || emailErr);
      }
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing failed:', err?.message || err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

exports.verify = async (req, res) => {
  try {
    const reference = req.params.reference || req.query.reference;
    if (!reference) return res.status(400).json({ error: 'Reference is required' });
    if (String(reference).length > 120) return res.status(400).json({ error: 'Invalid reference' });

    const payload = await verifyTransaction(reference);
    const data = payload?.data || payload?.Body || payload?.body || {};
    const status = data?.status || payload?.status;
    const customer = data?.customer || {};
    const amount = typeof data?.amount === 'number' ? data.amount / 100 : null;
    const currency = data?.currency || null;
    const occurredAt = data?.paid_at || data?.created_at || null;

    await PaystackEvent.create({
      event: data?.gateway_response ? `verify.${data?.status || 'unknown'}` : 'verify',
      reference,
      status: status || null,
      amount,
      currency,
      customer_email: customer?.email || null,
      customer_name: customer?.first_name ? `${customer.first_name} ${customer.last_name || ''}`.trim() : customer?.email || null,
      occurred_at: occurredAt ? new Date(occurredAt) : null,
      payload,
    });

    if (status === 'success') {
      const orderId = Number(data?.metadata?.orderId);
      if (Number.isInteger(orderId) && orderId > 0) {
        const order = await Order.findByPk(orderId);
        if (order) {
          order.payment_status = 'success';
          if (order.status === 'pending') order.status = 'paid';
          await order.save();
          const savedCard = extractSavedCardPayload(data);
          if (savedCard) {
            try {
              await upsertSavedCard({
                userId: order.user_id,
                token: savedCard.token,
                brand: savedCard.brand,
                last4: savedCard.last4,
                expMonth: savedCard.expMonth,
                expYear: savedCard.expYear,
                metadata: savedCard.metadata,
              });
            } catch (saveCardErr) {
              console.error('Saving card from verify failed:', saveCardErr?.message || saveCardErr);
            }
          }
        }
      }
    }
    if (customer?.email) {
      const label = data?.gateway_response || 'Transaction Update';
      try {
        await sendPaymentReceiptEmail({
          email: customer.email,
          name: customer?.first_name || customer?.email,
          amount,
          currency,
          status: status || 'unknown',
          reference,
          eventLabel: label,
          occurredAt,
        });
      } catch (emailErr) {
        console.error('Payment verify email failed:', emailErr?.message || emailErr);
      }
    }

    return res.json({ status: status || 'unknown', reference, data });
  } catch (err) {
    console.error('Payment verification failed:', err?.message || err);
    return res.status(500).json({ error: 'Verification failed' });
  }
};
