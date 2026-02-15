// Squad configuration
module.exports = {
  squadSecret: process.env.SQUAD_SECRET_KEY,
  squadPublic: process.env.SQUAD_PUBLIC_KEY,
  squadApiUrl: process.env.SQUAD_API_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://api-d.squadco.com' : 'https://sandbox-api-d.squadco.com'),
  squadWebhookSecret: process.env.SQUAD_WEBHOOK_SECRET,
  squadWebhookUrl: process.env.SQUAD_WEBHOOK_URL,
  squadCallbackUrl: process.env.SQUAD_CALLBACK_URL,
  squadTokenChargePath: process.env.SQUAD_TOKEN_CHARGE_PATH || '/transaction/charge_card',
};
