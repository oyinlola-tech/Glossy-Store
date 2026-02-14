const crypto = require('crypto');
const { Order } = require('../models');

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
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret && process.env.NODE_ENV === 'production') {
      return res.status(500).json({ error: 'Webhook secret is not configured' });
    }

    if (paystackSecret) {
      const signature = req.headers['x-paystack-signature'] || '';
      const expected = crypto
        .createHmac('sha512', paystackSecret)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest('hex');
      if (!safeEqualHex(expected, signature)) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body;
    if (event.event === 'charge.success' && event?.data?.status === 'success') {
      const orderId = Number(event?.data?.metadata?.orderId);
      if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.sendStatus(200);
      }
      const order = await Order.findByPk(orderId);
      if (order) {
        order.payment_status = 'success';
        if (order.status === 'pending') order.status = 'paid';
        await order.save();
      }
    }
    return res.sendStatus(200);
  } catch (err) {
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
