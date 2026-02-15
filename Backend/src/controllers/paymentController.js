const crypto = require('crypto');
const { Order, PaystackEvent } = require('../models');
const { verifyTransaction } = require('../services/paymentService');
const { sendPaymentReceiptEmail } = require('../services/emailService');

const safeEqualHex = (expectedHex, receivedHex) => {
  if (!expectedHex || !receivedHex) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const received = Buffer.from(String(receivedHex), 'hex');
  if (expected.length === 0 || received.length === 0 || expected.length !== received.length) {
    return false;
  }
  return crypto.timingSafeEqual(expected, received);
};

exports.webhook = async (req, res) => {
  try {
    const squadSecret = process.env.SQUAD_SECRET_KEY;
    if (!squadSecret && process.env.NODE_ENV === 'production') {
      return res.status(500).json({ error: 'Webhook secret is not configured' });
    }

    if (squadSecret) {
      const signature = req.headers['x-squad-signature'] || '';
      const expected = crypto
        .createHmac('sha512', squadSecret)
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
      }
    }

    if (customer?.email) {
      const label = String(eventType).replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

exports.verify = async (req, res) => {
  try {
    const reference = req.params.reference || req.query.reference;
    if (!reference) return res.status(400).json({ error: 'Reference is required' });

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
        }
      }
    }
    if (customer?.email) {
      const label = data?.gateway_response || 'Transaction Update';
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
    }

    return res.json({ status: status || 'unknown', reference, data });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed' });
  }
};
