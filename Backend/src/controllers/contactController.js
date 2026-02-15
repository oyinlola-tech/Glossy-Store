const { ContactMessage } = require('../models');

exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    const senderName = String(name || req.user?.name || '').trim();
    const senderEmail = String(email || req.user?.email || '').trim().toLowerCase();
    const sanitizedMessage = String(message || '').trim();

    if (!senderName || !senderEmail || !sanitizedMessage) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }
    if (senderName.length < 2 || senderName.length > 100) {
      return res.status(400).json({ error: 'name must be between 2 and 100 characters' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (sanitizedMessage.length < 5 || sanitizedMessage.length > 5000) {
      return res.status(400).json({ error: 'message must be between 5 and 5000 characters' });
    }

    const contact = await ContactMessage.create({
      user_id: req.user ? req.user.id : null,
      name: senderName,
      email: senderEmail,
      message: sanitizedMessage,
    });
    res.status(201).json({ message: 'Message sent', contact });
  } catch (err) {
    next(err);
  }
};
