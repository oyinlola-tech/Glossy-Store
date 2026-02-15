const { getCurrencyProfile } = require('../services/currencyService');

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await getCurrencyProfile(req);
    return res.json(profile);
  } catch (err) {
    return next(err);
  }
};
